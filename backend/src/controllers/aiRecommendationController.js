import { query } from "../config/database.js";

// =====================================================
// CREATE AI RECOMMENDATION
// =====================================================

export const createAIRecommendation = async (req, res) => {
  try {
    const {
      patient_id,
      recommendation_type,
      input_summary,
      recommendation,
      risk_level,
      confidence_score,
      disclaimer,
    } = req.body;

    if (
      !patient_id ||
      !recommendation_type ||
      !recommendation
    ) {
      return res.status(400).json({
        success: false,
        message:
          "patient_id, recommendation_type and recommendation are required",
      });
    }

    const patientResult = await query(
      `
      SELECT
        p.id,
        p.user_id,
        u.full_name,
        u.email
      FROM patients p
      INNER JOIN users u
        ON p.user_id = u.id
      WHERE p.id = $1
      `,
      [patient_id]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const result = await query(
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
        patient_id,
        recommendation_type,
        input_summary || null,
        recommendation,
        risk_level || null,
        confidence_score || null,
        disclaimer ||
          "This AI-generated information is not a substitute for professional medical advice.",
      ]
    );

    return res.status(201).json({
      success: true,
      message: "AI recommendation saved successfully",
      ai_recommendation: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create AI recommendation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save AI recommendation",
      error: error.message,
    });
  }
};


// =====================================================
// GET ALL AI RECOMMENDATIONS FOR PATIENT
// =====================================================

export const getAIRecommendationsByPatient = async (
  req,
  res
) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const result = await query(
      `
      SELECT
        ar.id,
        ar.patient_id,
        ar.recommendation_type,
        ar.input_summary,
        ar.recommendation,
        ar.risk_level,
        ar.confidence_score,
        ar.disclaimer,
        ar.created_at
      FROM ai_recommendations ar
      WHERE ar.patient_id = $1
      ORDER BY ar.created_at DESC
      `,
      [patientId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      recommendations: result.rows,
    });
  } catch (error) {
    console.error(
      "Get AI recommendations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch AI recommendations",
      error: error.message,
    });
  }
};


// =====================================================
// GET LATEST AI RECOMMENDATION
// =====================================================

export const getLatestAIRecommendation = async (
  req,
  res
) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const result = await query(
      `
      SELECT
        ar.id,
        ar.patient_id,
        ar.recommendation_type,
        ar.input_summary,
        ar.recommendation,
        ar.risk_level,
        ar.confidence_score,
        ar.disclaimer,
        ar.created_at
      FROM ai_recommendations ar
      WHERE ar.patient_id = $1
      ORDER BY ar.created_at DESC
      LIMIT 1
      `,
      [patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No AI recommendation found",
      });
    }

    return res.status(200).json({
      success: true,
      ai_recommendation: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get latest AI recommendation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch latest AI recommendation",
      error: error.message,
    });
  }
};


// =====================================================
// GET AI RECOMMENDATION BY ID
// =====================================================

export const getAIRecommendationById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Recommendation ID is required",
      });
    }

    const result = await query(
      `
      SELECT
        ar.id,
        ar.patient_id,
        ar.recommendation_type,
        ar.input_summary,
        ar.recommendation,
        ar.risk_level,
        ar.confidence_score,
        ar.disclaimer,
        ar.created_at
      FROM ai_recommendations ar
      WHERE ar.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "AI recommendation not found",
      });
    }

    return res.status(200).json({
      success: true,
      ai_recommendation: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get AI recommendation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch AI recommendation",
      error: error.message,
    });
  }
};