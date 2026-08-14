import { buildPatientContext } from "../services/patientContextService.js";
import { analyzePatientHealth } from "../ai/groqService.js";
import { findRecommendedDoctors } from "../services/doctorRecommendationService.js";
import { query } from "../config/database.js";

export const getAIRecommendations = async (req, res) => {
  try {
    // =====================================================
    // 1. AUTHENTICATED USER
    // =====================================================

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // =====================================================
    // 2. PATIENT INPUT
    // =====================================================

    const { symptoms, city } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: "Symptoms or health concern is required",
      });
    }

    const cleanSymptoms = symptoms.trim();

    // =====================================================
    // 3. FIND PATIENT
    // =====================================================

    const patientResult = await query(
      `
      SELECT id
      FROM patients
      WHERE user_id = $1
      `,
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const patientId = patientResult.rows[0].id;

    // =====================================================
    // 4. BUILD COMPLETE PATIENT CONTEXT
    // =====================================================

    const contextResult = await buildPatientContext(patientId);

    if (!contextResult.success) {
      return res.status(404).json({
        success: false,
        message: contextResult.message,
      });
    }

    // =====================================================
    // 5. AI HEALTH ANALYSIS
    // =====================================================

    const aiResult = await analyzePatientHealth({
      patient: contextResult.context.patient,

      healthMetrics:
        contextResult.context.healthMetrics,

      medicalRecords:
        contextResult.context.medicalRecords,

      labReports:
        contextResult.context.labReports,

      prescriptions:
        contextResult.context.prescriptions,

      symptoms: cleanSymptoms,
    });

    const analysis = aiResult?.analysis || {};

    // =====================================================
    // 6. RECOMMENDED SPECIALTY
    // =====================================================

    const recommendedSpecialty =
      analysis?.doctor_recommendation?.specialty ||
      "General Physician";

    // =====================================================
    // 7. FIND REAL DOCTORS
    // =====================================================

    const doctorResult = await findRecommendedDoctors({
      specialty: recommendedSpecialty,
      city: city?.trim() || null,
    });

    // =====================================================
    // 8. BUILD CLEAN ANALYSIS
    // =====================================================

    const cleanAnalysis = {
      risk_level:
        analysis?.risk_level || "moderate",

      risk_title:
        analysis?.risk_title ||
        "Health Assessment",

      summary:
        analysis?.summary ||
        "The available information should be reviewed with a healthcare professional.",

      what_i_found:
        Array.isArray(analysis?.what_i_found)
          ? analysis.what_i_found
          : [],

      possible_causes:
        Array.isArray(analysis?.possible_causes)
          ? analysis.possible_causes
          : [],

      what_you_can_do:
        Array.isArray(analysis?.what_you_can_do)
          ? analysis.what_you_can_do
          : [],

      doctor_recommendation: {
        specialty: recommendedSpecialty,

        reason:
          analysis?.doctor_recommendation?.reason ||
          "A healthcare professional can evaluate the symptoms and determine the appropriate next step.",
      },

      when_to_get_help: {
        urgency:
          analysis?.when_to_get_help?.urgency ||
          "prompt",

        message:
          analysis?.when_to_get_help?.message ||
          "Consider contacting a healthcare professional if your symptoms continue or worsen.",

        emergency_signs:
          Array.isArray(
            analysis?.when_to_get_help?.emergency_signs
          )
            ? analysis.when_to_get_help.emergency_signs
            : [],
      },

      reasoning:
        analysis?.reasoning ||
        "The assessment is based on the patient information provided.",

      safety_note:
        analysis?.safety_note ||
        "MedNexus AI provides healthcare decision-support information and does not replace professional medical care.",
    };

    // =====================================================
    // 9. SAVE AI RECOMMENDATION
    // =====================================================

    let savedRecommendation = null;

    try {
      const saveResult = await query(
        `
        INSERT INTO ai_recommendations (
          patient_id,
          recommendation_type,
          input_summary,
          recommendation,
          risk_level,
          confidence_score,
          disclaimer
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
          patientId,

          "health_assessment",

          cleanSymptoms,

          JSON.stringify(cleanAnalysis),

          cleanAnalysis.risk_level,

          null,

          cleanAnalysis.safety_note,
        ]
      );

      savedRecommendation =
        saveResult.rows[0];
    } catch (saveError) {
      /*
       * Do not fail the AI analysis if saving the
       * history record fails.
       */
      console.error(
        "AI recommendation save error:",
        saveError
      );
    }

    // =====================================================
    // 10. RETURN COMPLETE RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      message:
        "AI health assessment and doctor recommendations generated successfully",

      analysis: cleanAnalysis,

      doctor_recommendations: {
        specialty: recommendedSpecialty,

        count:
          doctorResult?.count || 0,

        doctors:
          doctorResult?.doctors || [],
      },

      // ===================================================
      // SAVED HISTORY INFORMATION
      // ===================================================

      recommendation_history: {
        saved: Boolean(savedRecommendation),

        id:
          savedRecommendation?.id || null,

        created_at:
          savedRecommendation?.created_at || null,
      },

      // ===================================================
      // RAG SOURCES
      // ===================================================

      rag: {
        knowledge_sources:
          aiResult?.rag?.knowledge_sources || [],
      },
    });
  } catch (error) {
    console.error(
      "AI recommendation controller error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to generate AI doctor recommendations",

      error: error.message,
    });
  }
};