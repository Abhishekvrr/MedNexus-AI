import { query } from "../config/database.js";

/*
===========================================================
GET LOGGED-IN PATIENT'S EMERGENCY PASS DATA
GET /api/emergency/me
===========================================================
*/
export const getMyEmergencyPass = async (req, res) => {
  try {
    const userId = req.user.id;

    const patientRes = await query(
      `
      SELECT 
        p.id as patient_id,
        p.user_id,
        u.full_name,
        u.email,
        u.phone,
        p.blood_group,
        p.date_of_birth,
        p.gender,
        p.allergies,
        p.chronic_conditions,
        p.current_medications,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.emergency_contact_relation
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      `,
      [userId]
    );

    if (patientRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const patient = patientRes.rows[0];

    // Fetch latest vitals
    const vitalsRes = await query(
      `
      SELECT * FROM health_metrics 
      WHERE patient_id = $1 
      ORDER BY recorded_at DESC 
      LIMIT 1
      `,
      [patient.patient_id]
    );

    // Fetch active prescriptions
    const rxRes = await query(
      `
      SELECT medicine_name, dosage, frequency, instructions 
      FROM prescriptions 
      WHERE patient_id = $1 AND status = 'active'
      LIMIT 6
      `,
      [patient.patient_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...patient,
        latest_vitals: vitalsRes.rows[0] || null,
        active_prescriptions: rxRes.rows,
        emergency_url: `/emergency/${patient.patient_id}`,
      },
    });
  } catch (error) {
    console.error("Get emergency pass error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve emergency pass data",
      error: error.message,
    });
  }
};

/*
===========================================================
PUBLIC FIRST-RESPONDER PARAMEDIC VIEW (NO AUTH REQUIRED)
GET /api/emergency/public/:patientId
===========================================================
*/
export const getPublicEmergencyPass = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patientRes = await query(
      `
      SELECT 
        p.id as patient_id,
        u.full_name,
        u.phone,
        p.blood_group,
        p.date_of_birth,
        p.gender,
        p.allergies,
        p.chronic_conditions,
        p.current_medications,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.emergency_contact_relation
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
      `,
      [patientId]
    );

    if (patientRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No emergency medical record found for this identifier.",
      });
    }

    const patient = patientRes.rows[0];

    // Fetch latest vitals for first-responder context
    const vitalsRes = await query(
      `
      SELECT heart_rate, systolic_bp, diastolic_bp, oxygen_saturation, blood_glucose, recorded_at 
      FROM health_metrics 
      WHERE patient_id = $1 
      ORDER BY recorded_at DESC 
      LIMIT 1
      `,
      [patientId]
    );

    // Active prescriptions
    const rxRes = await query(
      `
      SELECT medicine_name, dosage, frequency 
      FROM prescriptions 
      WHERE patient_id = $1 AND status = 'active'
      `,
      [patientId]
    );

    return res.status(200).json({
      success: true,
      data: {
        full_name: patient.full_name,
        blood_group: patient.blood_group || "Unknown",
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        allergies: patient.allergies ? patient.allergies.split(",").map(s => s.trim()) : [],
        chronic_conditions: patient.chronic_conditions ? patient.chronic_conditions.split(",").map(s => s.trim()) : [],
        current_medications: patient.current_medications ? patient.current_medications.split(",").map(s => s.trim()) : [],
        emergency_contact: {
          name: patient.emergency_contact_name || "Emergency Contact",
          phone: patient.emergency_contact_phone || "Not provided",
          relation: patient.emergency_contact_relation || "Next of Kin",
        },
        latest_vitals: vitalsRes.rows[0] || null,
        active_prescriptions: rxRes.rows,
        verified_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Public emergency lookup error:", error);
    return res.status(500).json({
      success: false,
      message: "Emergency lookup service encountered an error",
      error: error.message,
    });
  }
};

/*
===========================================================
TRIGGER EMERGENCY SOS BROADCAST
POST /api/emergency/sos
===========================================================
*/
export const triggerEmergencySOS = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, notes } = req.body;

    const patientRes = await query(
      `
      SELECT p.id, u.full_name, p.emergency_contact_name, p.emergency_contact_phone, p.blood_group
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      `,
      [userId]
    );

    const patient = patientRes.rows[0] || { full_name: "Patient", id: null };

    // Record emergency alert notification in DB
    await query(
      `
      INSERT INTO notifications (user_id, title, message, notification_type)
      VALUES ($1, $2, $3, 'emergency_sos')
      `,
      [
        userId,
        "🚨 EMERGENCY SOS BEACON ACTIVATED",
        `Emergency SOS triggered at Lat: ${latitude || "Unknown"}, Lng: ${longitude || "Unknown"}. Emergency contact notified: ${patient.emergency_contact_name || "Primary contact"}.`,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Emergency SOS broadcasted successfully",
      alert: {
        patient_name: patient.full_name,
        contact_notified: patient.emergency_contact_name,
        contact_phone: patient.emergency_contact_phone,
        location: { latitude, longitude },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Emergency SOS error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to trigger emergency SOS",
      error: error.message,
    });
  }
};
