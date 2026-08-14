import { query } from "../config/database.js";

/*
===========================================================
CREATE HEALTH METRIC
POST /api/health-metrics
===========================================================
*/

export const createHealthMetric = async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      heart_rate,
      systolic_bp,
      diastolic_bp,
      temperature,
      oxygen_saturation,
      respiratory_rate,
      blood_glucose,
      weight_kg,
      notes,
    } = req.body;

    /*
    -------------------------------------------------------
    FIND PATIENT PROFILE FOR AUTHENTICATED USER
    -------------------------------------------------------
    */

    const patientResult = await query(
      `
      SELECT id
      FROM patients
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found. Create your patient profile first.",
      });
    }

    const patient_id = patientResult.rows[0].id;

    /*
    -------------------------------------------------------
    BASIC VALIDATION
    -------------------------------------------------------
    */

    if (
      heart_rate === undefined &&
      systolic_bp === undefined &&
      diastolic_bp === undefined &&
      temperature === undefined &&
      oxygen_saturation === undefined &&
      respiratory_rate === undefined &&
      blood_glucose === undefined &&
      weight_kg === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one health metric is required",
      });
    }

    /*
    -------------------------------------------------------
    CREATE HEALTH METRIC RECORD
    -------------------------------------------------------
    */

    const result = await query(
      `
      INSERT INTO health_metrics (
        patient_id,
        heart_rate,
        systolic_bp,
        diastolic_bp,
        temperature,
        oxygen_saturation,
        respiratory_rate,
        blood_glucose,
        weight_kg,
        notes
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      RETURNING *
      `,
      [
        patient_id,
        heart_rate ?? null,
        systolic_bp ?? null,
        diastolic_bp ?? null,
        temperature ?? null,
        oxygen_saturation ?? null,
        respiratory_rate ?? null,
        blood_glucose ?? null,
        weight_kg ?? null,
        notes ?? null,
      ]
    );

    /*
    -------------------------------------------------------
    SUCCESS
    -------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message: "Health metrics recorded successfully",
      health_metric: result.rows[0],
    });
  } catch (error) {
    console.error("Create health metric error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record health metrics",
      error: error.message,
    });
  }
};


/*
===========================================================
GET MY HEALTH HISTORY
GET /api/health-metrics
===========================================================
*/

export const getMyHealthMetrics = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await query(
      `
      SELECT
        hm.id,
        hm.patient_id,
        hm.heart_rate,
        hm.systolic_bp,
        hm.diastolic_bp,
        hm.temperature,
        hm.oxygen_saturation,
        hm.respiratory_rate,
        hm.blood_glucose,
        hm.weight_kg,
        hm.recorded_at,
        hm.notes
      FROM health_metrics hm
      INNER JOIN patients p
        ON hm.patient_id = p.id
      WHERE p.user_id = $1
      ORDER BY hm.recorded_at DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      health_metrics: result.rows,
    });
  } catch (error) {
    console.error("Get health metrics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch health metrics",
      error: error.message,
    });
  }
};


/*
===========================================================
GET LATEST HEALTH METRIC
GET /api/health-metrics/latest
===========================================================
*/

export const getLatestHealthMetric = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await query(
      `
      SELECT
        hm.id,
        hm.patient_id,
        hm.heart_rate,
        hm.systolic_bp,
        hm.diastolic_bp,
        hm.temperature,
        hm.oxygen_saturation,
        hm.respiratory_rate,
        hm.blood_glucose,
        hm.weight_kg,
        hm.recorded_at,
        hm.notes
      FROM health_metrics hm
      INNER JOIN patients p
        ON hm.patient_id = p.id
      WHERE p.user_id = $1
      ORDER BY hm.recorded_at DESC
      LIMIT 1
      `,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No health metrics found",
      });
    }

    return res.status(200).json({
      success: true,
      health_metric: result.rows[0],
    });
  } catch (error) {
    console.error("Get latest health metric error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest health metric",
      error: error.message,
    });
  }
};


/*
===========================================================
DELETE HEALTH METRIC
DELETE /api/health-metrics/:id
===========================================================
*/

export const deleteHealthMetric = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await query(
      `
      DELETE FROM health_metrics hm
      USING patients p
      WHERE hm.id = $1
      AND hm.patient_id = p.id
      AND p.user_id = $2
      RETURNING hm.id
      `,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Health metric not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Health metric deleted successfully",
      metric_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Delete health metric error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete health metric",
      error: error.message,
    });
  }
};