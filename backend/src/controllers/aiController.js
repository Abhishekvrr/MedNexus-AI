import { query } from "../config/database.js";
import { buildPatientContext } from "../services/patientContextService.js";
import { analyzePatientHealth, chatWithDoctorCopilot } from "../ai/groqService.js";

/*
=======================================================
MEDNEXUS AI CONTROLLER

POST /api/ai/analyze

Flow:

Authenticated User
        ↓
Find Patient
        ↓
Build Patient Context
        ↓
Groq AI Analysis
        ↓
Return Structured Analysis
=======================================================
*/

export const analyzeHealth = async (req, res) => {
  try {
    /*
    -------------------------------------------------------
    AUTHENTICATION
    -------------------------------------------------------
    */

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /*
    -------------------------------------------------------
    CURRENT SYMPTOMS
    -------------------------------------------------------
    */

    const { symptoms } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: "Symptoms or health concern is required",
      });
    }

    /*
    -------------------------------------------------------
    FIND PATIENT USING AUTHENTICATED USER
    -------------------------------------------------------

    We never trust patient_id from the frontend.
    */

    const patientContextResult =
      await buildPatientContextByUserId(userId);

    if (!patientContextResult.success) {
      return res.status(404).json({
        success: false,
        message: patientContextResult.message,
      });
    }

    /*
    -------------------------------------------------------
    SEND PATIENT CONTEXT TO AI
    -------------------------------------------------------
    */

    const context = patientContextResult.context;

    const aiResult = await analyzePatientHealth({
      patient: context.patient,
      healthMetrics: context.healthMetrics,
      medicalRecords: context.medicalRecords,
      labReports: context.labReports,
      prescriptions: context.prescriptions,
      symptoms: symptoms.trim(),
    });

    /*
    -------------------------------------------------------
    RETURN AI ANALYSIS
    -------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      message: "Health analysis generated successfully",
      analysis: aiResult.analysis,
    });

  } catch (error) {
    console.error(
      "MedNexus AI controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate health analysis",
      error: error.message,
    });
  }
};

/*
=======================================================
DOCTOR CLINICAL AI COPILOT CHAT
POST /api/ai/doctor-chat
=======================================================
*/
export const doctorChat = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { message, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // 1. Fetch Doctor Profile
    const doctorResult = await query(
      `
      SELECT d.*, u.full_name AS doctor_name, u.email, u.phone
      FROM doctors d
      INNER JOIN users u ON d.user_id = u.id
      WHERE d.user_id = $1
      `,
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const doctor = doctorResult.rows[0];

    // 2. Fetch Doctor's Assigned Patients
    const patientsResult = await query(
      `
      SELECT
        p.id AS patient_id,
        u.full_name,
        u.email,
        u.phone,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.allergies,
        p.chronic_conditions,
        p.current_medications,
        MAX(a.appointment_date + a.appointment_time) AS last_appointment,
        COUNT(a.id)::integer AS appointment_count
      FROM appointments a
      INNER JOIN doctors d ON d.id = a.doctor_id
      INNER JOIN patients p ON p.id = a.patient_id
      INNER JOIN users u ON u.id = p.user_id
      WHERE d.user_id = $1
      GROUP BY p.id, u.id, u.full_name, u.email, u.phone, p.date_of_birth, p.gender, p.blood_group, p.allergies, p.chronic_conditions, p.current_medications
      ORDER BY last_appointment DESC NULLS LAST
      `,
      [userId]
    );

    // 3. Fetch Doctor's Appointments
    const appointmentsResult = await query(
      `
      SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.appointment_type,
        a.reason,
        a.status,
        u.full_name AS patient_name,
        u.email AS patient_email
      FROM appointments a
      INNER JOIN doctors d ON d.id = a.doctor_id
      INNER JOIN patients p ON p.id = a.patient_id
      INNER JOIN users u ON u.id = p.user_id
      WHERE d.user_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT 20
      `,
      [userId]
    );

    // 4. Fetch Doctor's Prescriptions
    const prescriptionsResult = await query(
      `
      SELECT
        pr.id,
        pr.medicine_name,
        pr.dosage,
        pr.frequency,
        pr.duration,
        pr.instructions,
        pr.status,
        u.full_name AS patient_name
      FROM prescriptions pr
      INNER JOIN doctors d ON d.id = pr.doctor_id
      INNER JOIN patients p ON p.id = pr.patient_id
      INNER JOIN users u ON u.id = p.user_id
      WHERE d.user_id = $1
      ORDER BY pr.created_at DESC
      LIMIT 20
      `,
      [userId]
    );

    // 5. Call Groq Clinical Copilot
    const aiResult = await chatWithDoctorCopilot({
      doctor,
      patients: patientsResult.rows,
      appointments: appointmentsResult.rows,
      prescriptions: prescriptionsResult.rows,
      query: message.trim(),
      history: history || [],
    });

    return res.status(200).json({
      success: true,
      reply: aiResult.reply,
    });
  } catch (error) {
    console.error("Doctor AI chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process clinical AI assistant query",
      error: error.message,
    });
  }
};

/*
=======================================================
GET PATIENT CONTEXT USING AUTHENTICATED USER ID

users.id
   ↓
patients.user_id
   ↓
patients.id
=======================================================
*/

const buildPatientContextByUserId = async (userId) => {
  const patientResult = await query(
    `
    SELECT id
    FROM patients
    WHERE user_id = $1
    `,
    [userId]
  );

  if (patientResult.rows.length === 0) {
    return {
      success: false,
      message: "Patient profile not found for this account",
    };
  }

  const patientId = patientResult.rows[0].id;

  return await buildPatientContext(patientId);
};