import { query } from "../config/database.js";

/*
====================================================
GET MY PRESCRIPTIONS
GET /api/prescriptions
====================================================
*/
export const getMyPrescriptions = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await query(
      `
      SELECT
        pr.id,
        pr.patient_id,
        pr.doctor_id,
        pr.medical_record_id,
        pr.medicine_name,
        pr.dosage,
        pr.frequency,
        pr.duration,
        pr.instructions,
        pr.start_date,
        pr.end_date,
        pr.status,

        u.full_name AS doctor_name

      FROM prescriptions pr

      INNER JOIN doctors d
        ON pr.doctor_id = d.id

      INNER JOIN users u
        ON d.user_id = u.id

      INNER JOIN patients p
        ON pr.patient_id = p.id

      WHERE p.user_id = $1

      ORDER BY
        pr.start_date DESC NULLS LAST
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      prescriptions: result.rows,
    });
  } catch (error) {
    console.error("Get my prescriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
    });
  }
};


/*
====================================================
GET PRESCRIPTIONS FOR MY PATIENT
GET /api/prescriptions/patient/:patientId
====================================================
*/
export const getPatientPrescriptions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { patientId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /*
    Find logged-in doctor
    */
    const doctorResult = await query(
      `
      SELECT id
      FROM doctors
      WHERE user_id = $1
      `,
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const doctorId = doctorResult.rows[0].id;

    /*
    Only allow doctor to see prescriptions
    for their own patient.
    */
    const result = await query(
      `
      SELECT
        pr.id,
        pr.patient_id,
        pr.doctor_id,
        pr.medical_record_id,
        pr.medicine_name,
        pr.dosage,
        pr.frequency,
        pr.duration,
        pr.instructions,
        pr.start_date,
        pr.end_date,
        pr.status
      FROM prescriptions pr
      WHERE pr.patient_id = $1
      AND pr.doctor_id = $2
      ORDER BY pr.start_date DESC NULLS LAST
      `,
      [patientId, doctorId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      prescriptions: result.rows,
    });
  } catch (error) {
    console.error(
      "Get patient prescriptions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient prescriptions",
    });
  }
};


/*
====================================================
CREATE PRESCRIPTION
POST /api/prescriptions
====================================================
*/
export const createPrescription = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      patient_id,
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

    if (!patient_id || !medicine_name) {
      return res.status(400).json({
        success: false,
        message:
          "patient_id and medicine_name are required",
      });
    }

    /*
    Find logged-in doctor
    */
    const doctorResult = await query(
      `
      SELECT id
      FROM doctors
      WHERE user_id = $1
      `,
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const doctorId = doctorResult.rows[0].id;

    /*
    Verify that patient has an appointment
    with this doctor.
    */
    const patientResult = await query(
      `
      SELECT DISTINCT p.id
      FROM patients p
      INNER JOIN appointments a
        ON a.patient_id = p.id
      WHERE p.id = $1
      AND a.doctor_id = $2
      `,
      [patient_id, doctorId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "You can only prescribe medicine to your patients",
      });
    }

    /*
    Create prescription
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
        doctorId,
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
      message:
        "Prescription created successfully",
      prescription: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create prescription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message,
    });
  }
};


/*
====================================================
UPDATE PRESCRIPTION
PUT /api/prescriptions/:id
====================================================
*/
export const updatePrescription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

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
      UPDATE prescriptions pr

      SET
        medicine_name =
          COALESCE($1, pr.medicine_name),

        dosage =
          COALESCE($2, pr.dosage),

        frequency =
          COALESCE($3, pr.frequency),

        duration =
          COALESCE($4, pr.duration),

        instructions =
          COALESCE($5, pr.instructions),

        start_date =
          COALESCE($6, pr.start_date),

        end_date =
          COALESCE($7, pr.end_date),

        status =
          COALESCE($8, pr.status)

      FROM doctors d

      WHERE pr.id = $9
      AND pr.doctor_id = d.id
      AND d.user_id = $10

      RETURNING pr.*
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
        userId,
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
      message:
        "Prescription updated successfully",
      prescription: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update prescription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update prescription",
    });
  }
};


/*
====================================================
DELETE PRESCRIPTION
DELETE /api/prescriptions/:id
====================================================
*/
export const deletePrescription = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await query(
      `
      DELETE FROM prescriptions pr
      USING doctors d
      WHERE pr.id = $1
      AND pr.doctor_id = d.id
      AND d.user_id = $2
      RETURNING pr.id
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Prescription deleted successfully",
      prescription_id: result.rows[0].id,
    });
  } catch (error) {
    console.error(
      "Delete prescription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete prescription",
    });
  }
};