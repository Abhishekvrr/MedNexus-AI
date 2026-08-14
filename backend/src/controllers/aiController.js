import { query } from "../config/database.js";
import { buildPatientContext } from "../services/patientContextService.js";
import { analyzePatientHealth } from "../ai/groqService.js";

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