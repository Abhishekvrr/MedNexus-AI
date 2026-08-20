import { query } from "../config/database.js";

/*
===========================================================
CREATE MEDICAL RECORD
POST /api/medical-records
===========================================================
*/

export const createMedicalRecord = async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      doctor_id,
      appointment_id,
      diagnosis,
      symptoms,
      treatment,
      medical_notes,
      record_date,
    } = req.body;

    /*
    -------------------------------------------------------
    FIND PATIENT FOR AUTHENTICATED USER
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

    if (!diagnosis && !symptoms && !treatment && !medical_notes) {
      return res.status(400).json({
        success: false,
        message: "At least one medical record detail is required",
      });
    }

    /*
    -------------------------------------------------------
    CREATE MEDICAL RECORD
    -------------------------------------------------------
    */

    const result = await query(
      `
      INSERT INTO medical_records (
        patient_id,
        doctor_id,
        appointment_id,
        diagnosis,
        symptoms,
        treatment,
        medical_notes,
        record_date
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        COALESCE($8, CURRENT_DATE)
      )
      RETURNING *
      `,
      [
        patient_id,
        doctor_id || null,
        appointment_id || null,
        diagnosis || null,
        symptoms || null,
        treatment || null,
        medical_notes || null,
        record_date || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      medical_record: result.rows[0],
    });
  } catch (error) {
    console.error("Create medical record error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create medical record",
      error: error.message,
    });
  }
};


/*
===========================================================
GET MY MEDICAL RECORDS
GET /api/medical-records
===========================================================
*/

export const getMyMedicalRecords = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await query(
      `
      SELECT
        mr.id,
        mr.patient_id,
        mr.doctor_id,
        mr.appointment_id,
        mr.diagnosis,
        mr.symptoms,
        mr.treatment,
        mr.medical_notes,
        mr.record_date,
        mr.created_at
      FROM medical_records mr
      INNER JOIN patients p
        ON mr.patient_id = p.id
      WHERE p.user_id = $1
      ORDER BY mr.record_date DESC, mr.created_at DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      medical_records: result.rows,
    });
  } catch (error) {
    console.error("Get medical records error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch medical records",
      error: error.message,
    });
  }
};


/*
===========================================================
GET MEDICAL RECORD BY ID
GET /api/medical-records/:id
===========================================================
*/

export const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await query(
      `
      SELECT
        mr.id,
        mr.patient_id,
        mr.doctor_id,
        mr.appointment_id,
        mr.diagnosis,
        mr.symptoms,
        mr.treatment,
        mr.medical_notes,
        mr.record_date,
        mr.created_at
      FROM medical_records mr
      INNER JOIN patients p
        ON mr.patient_id = p.id
      WHERE mr.id = $1
      AND p.user_id = $2
      `,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    return res.status(200).json({
      success: true,
      medical_record: result.rows[0],
    });
  } catch (error) {
    console.error("Get medical record error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch medical record",
      error: error.message,
    });
  }
};


/*
===========================================================
UPDATE MEDICAL RECORD
PUT /api/medical-records/:id
===========================================================
*/

export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const {
      diagnosis,
      symptoms,
      treatment,
      medical_notes,
      record_date,
    } = req.body;

    const result = await query(
      `
      UPDATE medical_records mr
      SET
        diagnosis = COALESCE($1, mr.diagnosis),
        symptoms = COALESCE($2, mr.symptoms),
        treatment = COALESCE($3, mr.treatment),
        medical_notes = COALESCE($4, mr.medical_notes),
        record_date = COALESCE($5, mr.record_date)
      FROM patients p
      WHERE mr.id = $6
      AND mr.patient_id = p.id
      AND p.user_id = $7
      RETURNING mr.*
      `,
      [
        diagnosis,
        symptoms,
        treatment,
        medical_notes,
        record_date,
        id,
        user_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      medical_record: result.rows[0],
    });
  } catch (error) {
    console.error("Update medical record error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update medical record",
      error: error.message,
    });
  }
};


/*
===========================================================
DELETE MEDICAL RECORD
DELETE /api/medical-records/:id
===========================================================
*/

export const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await query(
      `
      DELETE FROM medical_records mr
      USING patients p
      WHERE mr.id = $1
      AND mr.patient_id = p.id
      AND p.user_id = $2
      RETURNING mr.id
      `,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medical record deleted successfully",
      medical_record_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Delete medical record error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete medical record",
      error: error.message,
    });
  }
};

/*
===========================================================
GET PATIENT RECORDS FOR DOCTOR
GET /api/medical-records/patient/:patientId
===========================================================
*/
export const getPatientRecordsForDoctor = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { patientId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const doctorResult = await query(
      `SELECT id FROM doctors WHERE user_id = $1`,
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const recordsResult = await query(
      `
      SELECT
        mr.id,
        mr.patient_id,
        mr.doctor_id,
        mr.appointment_id,
        mr.diagnosis,
        mr.symptoms,
        mr.treatment,
        mr.medical_notes,
        mr.record_date,
        mr.created_at,
        u.full_name AS doctor_name,
        d.specialization AS doctor_specialization
      FROM medical_records mr
      LEFT JOIN doctors d ON mr.doctor_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE mr.patient_id = $1
      ORDER BY mr.record_date DESC, mr.created_at DESC
      `,
      [patientId]
    );

    // Also fetch associated prescriptions
    const prescriptionsResult = await query(
      `
      SELECT
        pr.*,
        u.full_name AS doctor_name
      FROM prescriptions pr
      LEFT JOIN doctors d ON pr.doctor_id = d.id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE pr.patient_id = $1
      ORDER BY pr.created_at DESC
      `,
      [patientId]
    );

    return res.status(200).json({
      success: true,
      count: recordsResult.rows.length,
      medical_records: recordsResult.rows,
      prescriptions: prescriptionsResult.rows,
    });
  } catch (error) {
    console.error("Get patient records for doctor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient records",
      error: error.message,
    });
  }
};

/*
===========================================================
CREATE DOCTOR MEDICAL RECORD (ENCOUNTER)
POST /api/medical-records/doctor
===========================================================
*/
export const createDoctorMedicalRecord = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const doctorResult = await query(
      `SELECT id FROM doctors WHERE user_id = $1`,
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const doctorId = doctorResult.rows[0].id;
    const {
      patient_id,
      appointment_id,
      diagnosis,
      symptoms,
      treatment,
      medical_notes,
      record_date,
    } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: "patient_id is required",
      });
    }

    const result = await query(
      `
      INSERT INTO medical_records (
        patient_id,
        doctor_id,
        appointment_id,
        diagnosis,
        symptoms,
        treatment,
        medical_notes,
        record_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_DATE))
      RETURNING *
      `,
      [
        patient_id,
        doctorId,
        appointment_id || null,
        diagnosis || null,
        symptoms || null,
        treatment || null,
        medical_notes || null,
        record_date || null,
      ]
    );

    // If appointment_id provided, mark appointment as completed
    if (appointment_id) {
      await query(
        `UPDATE appointments SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [appointment_id]
      );
    }

    return res.status(201).json({
      success: true,
      message: "Patient medical record created successfully",
      medical_record: result.rows[0],
    });
  } catch (error) {
    console.error("Create doctor medical record error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create patient medical record",
      error: error.message,
    });
  }
};
