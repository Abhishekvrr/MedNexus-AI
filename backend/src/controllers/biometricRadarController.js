import { simulateHealthRiskTrajectory } from "../ai/groqService.js";
import { query } from "../config/database.js";

/*
===========================================================
BIOMETRIC ORGAN RADAR & 5-YEAR TRAJECTORY FORECASTER
POST /api/health-metrics/biometric-radar
===========================================================
*/
export const getBiometricRadarData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { custom_vitals } = req.body;

    // Get patient
    const patRes = await query(`SELECT * FROM patients WHERE user_id = $1`, [userId]);
    const patient = patRes.rows[0] || {};

    // Get latest vitals
    let vitals = custom_vitals;
    if (!vitals && patient.id) {
      const vitalsRes = await query(
        `SELECT * FROM health_metrics WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
        [patient.id]
      );
      vitals = vitalsRes.rows[0] || {
        systolic_bp: 125,
        diastolic_bp: 82,
        heart_rate: 74,
        oxygen_saturation: 98,
        blood_glucose: 105,
        weight_kg: 70,
      };
    } else if (!vitals) {
      vitals = {
        systolic_bp: 125,
        diastolic_bp: 82,
        heart_rate: 74,
        oxygen_saturation: 98,
        blood_glucose: 105,
        weight_kg: 70,
      };
    }

    const simulation = await simulateHealthRiskTrajectory({
      vitals,
      patient,
    });

    return res.status(200).json({
      success: true,
      data: simulation.trajectory,
      baseline_vitals: vitals,
    });
  } catch (error) {
    console.error("Biometric radar controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate biometric trajectory",
      error: error.message,
    });
  }
};
