import { query } from "../config/database.js";

/*
===========================================================
CREATE PRESCRIPTION
POST /api/prescriptions
===========================================================
*/

export const createPrescription = async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      doctor_id,
      medical_record_id,
      medicine_name,
      dosage,
      frequency,
      duration,
      instructions,
      start_date,
      end_date,
      status,
    } = req.body;

    /*
    -------------------------------------------------------
    VALIDATION
    -------------------------------------------------------
    */

    if (!medicine_name) {
      return res.status(400).json({
        success: false,
        message: "medicine_name is required",
      });
    }

    /*
    -------------------------------------------------------
    FIND AUTHENTICATED PATIENT
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
        message:
          "Patient profile not found. Create your patient profile first.",
      });
    }

    const patient_id = patientResult.rows[0].id;

    /*
    -------------------------------------------------------
    CREATE PRESCRIPTION
    -------------------------------------------------------
    */

    const result = await query(
      `
      INSERT INTO prescriptions (
        patient_id,
        doctor_id,
        medical_record_id,
        medicine_name,
        dosage,
        frequency,
        duration,
        instructions,
        start_date,
        end_date,
        status
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
        $10,
        COALESCE($11, 'active')
      )
      RETURNING *
      `,
      [
        patient_id,
        doctor_id || null,
        medical_record_id || null,
        medicine_name,
        dosage || null,
        frequency || null,
        duration || null,
        instructions || null,
        start_date || null,
        end_date || null,
        status || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription: result.rows[0],
    });
  } catch (error) {
    console.error("Create prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message,
    });
  }
};


/*
===========================================================
GET MY PRESCRIPTIONS
GET /api/prescriptions
===========================================================
*/

export const getMyPrescriptions = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await query(
      `
      SELECT
        p.id,
        p.patient_id,
        p.doctor_id,
        p.medical_record_id,
        p.medicine_name,
        p.dosage,
        p.frequency,
        p.duration,
        p.instructions,
        p.start_date,
        p.end_date,
        p.status,
        p.created_at
      FROM prescriptions p
      INNER JOIN patients pt
        ON p.patient_id = pt.id
      WHERE pt.user_id = $1
      ORDER BY p.created_at DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      prescriptions: result.rows,
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
      error: error.message,
    });
  }
};


/*
===========================================================
GET PRESCRIPTION BY ID
GET /api/prescriptions/:id
===========================================================
*/

export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await query(
      `
      SELECT
        p.id,
        p.patient_id,
        p.doctor_id,
        p.medical_record_id,
        p.medicine_name,
        p.dosage,
        p.frequency,
        p.duration,
        p.instructions,
        p.start_date,
        p.end_date,
        p.status,
        p.created_at
      FROM prescriptions p
      INNER JOIN patients pt
        ON p.patient_id = pt.id
      WHERE p.id = $1
      AND pt.user_id = $2
      `,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      prescription: result.rows[0],
    });
  } catch (error) {
    console.error("Get prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
      error: error.message,
    });
  }
};


/*
===========================================================
UPDATE PRESCRIPTION
PUT /api/prescriptions/:id
===========================================================
*/

export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const {
      medicine_name,
      dosage,
      frequency,
      duration,
      instructions,
      start_date,
      end_date,
      status,
    } = req.body;

    const result = await query(
      `
      UPDATE prescriptions p
      SET
        medicine_name = COALESCE($1, p.medicine_name),
        dosage = COALESCE($2, p.dosage),
        frequency = COALESCE($3, p.frequency),
        duration = COALESCE($4, p.duration),
        instructions = COALESCE($5, p.instructions),
        start_date = COALESCE($6, p.start_date),
        end_date = COALESCE($7, p.end_date),
        status = COALESCE($8, p.status)
      FROM patients pt
      WHERE p.id = $9
      AND p.patient_id = pt.id
      AND pt.user_id = $10
      RETURNING p.*
      `,
      [
        medicine_name,
        dosage,
        frequency,
        duration,
        instructions,
        start_date,
        end_date,
        status,
        id,
        user_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully",
      prescription: result.rows[0],
    });
  } catch (error) {
    console.error("Update prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update prescription",
      error: error.message,
    });
  }
};


/*
===========================================================
DELETE PRESCRIPTION
DELETE /api/prescriptions/:id
===========================================================
*/

export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await query(
      `
      DELETE FROM prescriptions p
      USING patients pt
      WHERE p.id = $1
      AND p.patient_id = pt.id
      AND pt.user_id = $2
      RETURNING p.id
      `,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
      prescription_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Delete prescription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete prescription",
      error: error.message,
    });
  }
};