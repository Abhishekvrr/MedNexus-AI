import { generateAmbientSOAPNote, decodePrescriptionAI } from "../ai/groqService.js";
import { query } from "../config/database.js";

/*
===========================================================
AMBIENT VOICE SCRIBE: TRANSCRIPT TO SOAP NOTE & BATCH RX
POST /api/ai/ambient-scribe
===========================================================
*/
export const processAmbientScribe = async (req, res) => {
  try {
    const { transcript, patient_id } = req.body;
    const userId = req.user.id;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        message: "Consultation transcript or voice text is required",
      });
    }

    // Get doctor info
    const docResult = await query(
      `SELECT d.*, u.full_name as doctor_name FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.user_id = $1`,
      [userId]
    );
    const doctor = docResult.rows[0] || { doctor_name: "Doctor", specialization: "General Medicine" };

    // Get patient info if provided
    let patientName = "Patient";
    if (patient_id) {
      const patResult = await query(
        `SELECT p.*, u.full_name as patient_name FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = $1`,
        [patient_id]
      );
      if (patResult.rows.length > 0) {
        patientName = patResult.rows[0].patient_name;
      }
    }

    const aiResult = await generateAmbientSOAPNote({
      transcript: transcript.trim(),
      doctorName: doctor.doctor_name,
      specialization: doctor.specialization,
      patientName,
    });

    return res.status(200).json({
      success: true,
      message: "Ambient encounter successfully transcribed and structured",
      data: aiResult.soapNote,
    });
  } catch (error) {
    console.error("Ambient scribe controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process ambient voice scribe",
      error: error.message,
    });
  }
};

/*
===========================================================
DECODE PRESCRIPTION: OCR / TEXT TO VOICE EXPLANATION
POST /api/ai/decode-prescription
===========================================================
*/
export const processPrescriptionDecoder = async (req, res) => {
  try {
    const { prescription_text, language = "en" } = req.body;

    if (!prescription_text || !prescription_text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Prescription text or notes are required",
      });
    }

    const aiResult = await decodePrescriptionAI({
      prescriptionText: prescription_text.trim(),
      patientLanguage: language,
    });

    return res.status(200).json({
      success: true,
      message: "Prescription successfully decoded and converted to schedules",
      data: aiResult.decoded,
    });
  } catch (error) {
    console.error("Prescription decoder controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to decode prescription",
      error: error.message,
    });
  }
};
