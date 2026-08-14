import { query } from "../config/database.js";

/*
===========================================================
CREATE LAB REPORT
POST /api/lab-reports
===========================================================
*/

export const createLabReport = async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      doctor_id,
      test_name,
      test_date,
      result_value,
      unit,
      reference_range,
      status,
      report_file_url,
      notes,
    } = req.body;

    /*
    -------------------------------------------------------
    VALIDATE REQUIRED FIELD
    -------------------------------------------------------
    */

    if (!test_name || !test_date) {
      return res.status(400).json({
        success: false,
        message: "test_name and test_date are required",
      });
    }

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
        message:
          "Patient profile not found. Create your patient profile first.",
      });
    }

    const patient_id = patientResult.rows[0].id;

    /*
    -------------------------------------------------------
    CREATE LAB REPORT
    -------------------------------------------------------
    */

    const result = await query(
      `
      INSERT INTO lab_reports (
        patient_id,
        doctor_id,
        test_name,
        test_date,
        result_value,
        unit,
        reference_range,
        status,
        report_file_url,
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
        COALESCE($8, 'normal'),
        $9,
        $10
      )
      RETURNING *
      `,
      [
        patient_id,
        doctor_id || null,
        test_name,
        test_date,
        result_value || null,
        unit || null,
        reference_range || null,
        status || null,
        report_file_url || null,
        notes || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Lab report created successfully",
      lab_report: result.rows[0],
    });
  } catch (error) {
    console.error("Create lab report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create lab report",
      error: error.message,
    });
  }
};


/*
===========================================================
GET MY LAB REPORTS
GET /api/lab-reports
===========================================================
*/

export const getMyLabReports = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await query(
      `
      SELECT
        lr.id,
        lr.patient_id,
        lr.doctor_id,
        lr.test_name,
        lr.test_date,
        lr.result_value,
        lr.unit,
        lr.reference_range,
        lr.status,
        lr.report_file_url,
        lr.notes,
        lr.created_at
      FROM lab_reports lr
      INNER JOIN patients p
        ON lr.patient_id = p.id
      WHERE p.user_id = $1
      ORDER BY lr.test_date DESC, lr.created_at DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      lab_reports: result.rows,
    });
  } catch (error) {
    console.error("Get lab reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lab reports",
      error: error.message,
    });
  }
};


/*
===========================================================
GET LAB REPORT BY ID
GET /api/lab-reports/:id
===========================================================
*/

export const getLabReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await query(
      `
      SELECT
        lr.id,
        lr.patient_id,
        lr.doctor_id,
        lr.test_name,
        lr.test_date,
        lr.result_value,
        lr.unit,
        lr.reference_range,
        lr.status,
        lr.report_file_url,
        lr.notes,
        lr.created_at
      FROM lab_reports lr
      INNER JOIN patients p
        ON lr.patient_id = p.id
      WHERE lr.id = $1
      AND p.user_id = $2
      `,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab report not found",
      });
    }

    return res.status(200).json({
      success: true,
      lab_report: result.rows[0],
    });
  } catch (error) {
    console.error("Get lab report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lab report",
      error: error.message,
    });
  }
};


/*
===========================================================
UPDATE LAB REPORT
PUT /api/lab-reports/:id
===========================================================
*/

export const updateLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const {
      test_name,
      test_date,
      result_value,
      unit,
      reference_range,
      status,
      report_file_url,
      notes,
    } = req.body;

    const result = await query(
      `
      UPDATE lab_reports lr
      SET
        test_name = COALESCE($1, lr.test_name),
        test_date = COALESCE($2, lr.test_date),
        result_value = COALESCE($3, lr.result_value),
        unit = COALESCE($4, lr.unit),
        reference_range = COALESCE($5, lr.reference_range),
        status = COALESCE($6, lr.status),
        report_file_url = COALESCE($7, lr.report_file_url),
        notes = COALESCE($8, lr.notes)
      FROM patients p
      WHERE lr.id = $9
      AND lr.patient_id = p.id
      AND p.user_id = $10
      RETURNING lr.*
      `,
      [
        test_name,
        test_date,
        result_value,
        unit,
        reference_range,
        status,
        report_file_url,
        notes,
        id,
        user_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lab report updated successfully",
      lab_report: result.rows[0],
    });
  } catch (error) {
    console.error("Update lab report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update lab report",
      error: error.message,
    });
  }
};


/*
===========================================================
DELETE LAB REPORT
DELETE /api/lab-reports/:id
===========================================================
*/

export const deleteLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await query(
      `
      DELETE FROM lab_reports lr
      USING patients p
      WHERE lr.id = $1
      AND lr.patient_id = p.id
      AND p.user_id = $2
      RETURNING lr.id
      `,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lab report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lab report deleted successfully",
      lab_report_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Delete lab report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete lab report",
      error: error.message,
    });
  }
};