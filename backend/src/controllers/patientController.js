import { query } from "../config/database.js";

/*
===========================================================
CREATE PATIENT PROFILE
POST /api/patients
===========================================================
*/

export const createPatient = async (req, res) => {
  try {
    /*
    -------------------------------------------------------
    GET AUTHENTICATED USER ID FROM JWT
    -------------------------------------------------------
    */

    const user_id = req.user.id;

    /*
    -------------------------------------------------------
    GET PATIENT DATA FROM REQUEST BODY
    -------------------------------------------------------
    */

    const {
      date_of_birth,
      gender,
      blood_group,
      height_cm,
      weight_kg,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      allergies,
      chronic_conditions,
      current_medications,
    } = req.body;

    /*
    -------------------------------------------------------
    VERIFY USER EXISTS
    -------------------------------------------------------
    */

    const userResult = await query(
      `
      SELECT id, full_name, email
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    /*
    -------------------------------------------------------
    CHECK EXISTING PATIENT PROFILE
    -------------------------------------------------------
    */

    const existingPatient = await query(
      `
      SELECT id
      FROM patients
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (existingPatient.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Patient profile already exists for this user",
        patient_id: existingPatient.rows[0].id,
      });
    }

    /*
    -------------------------------------------------------
    CREATE PATIENT PROFILE
    -------------------------------------------------------
    */

    const result = await query(
      `
      INSERT INTO patients (
        user_id,
        date_of_birth,
        gender,
        blood_group,
        height_cm,
        weight_kg,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relation,
        allergies,
        chronic_conditions,
        current_medications
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
        $11,
        $12
      )
      RETURNING *
      `,
      [
        user_id,
        date_of_birth || null,
        gender || null,
        blood_group || null,
        height_cm || null,
        weight_kg || null,
        emergency_contact_name || null,
        emergency_contact_phone || null,
        emergency_contact_relation || null,
        allergies || null,
        chronic_conditions || null,
        current_medications || null,
      ]
    );

    /*
    -------------------------------------------------------
    SUCCESS RESPONSE
    -------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message: "Patient profile created successfully",
      patient: result.rows[0],
    });
  } catch (error) {
    console.error("Create patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create patient profile",
      error: error.message,
    });
  }
};


/*
===========================================================
GET ALL PATIENTS
GET /api/patients
===========================================================
*/

export const getPatients = async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        p.id,
        p.user_id,
        u.full_name,
        u.email,
        u.phone,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.height_cm,
        p.weight_kg,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.emergency_contact_relation,
        p.allergies,
        p.chronic_conditions,
        p.current_medications,
        p.created_at,
        p.updated_at
      FROM patients p
      INNER JOIN users u
        ON p.user_id = u.id
      ORDER BY p.created_at DESC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      patients: result.rows,
    });
  } catch (error) {
    console.error("Get patients error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
};


/*
===========================================================
GET PATIENT BY ID
GET /api/patients/:id
===========================================================
*/

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT
        p.id,
        p.user_id,
        u.full_name,
        u.email,
        u.phone,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.height_cm,
        p.weight_kg,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.emergency_contact_relation,
        p.allergies,
        p.chronic_conditions,
        p.current_medications,
        p.created_at,
        p.updated_at
      FROM patients p
      INNER JOIN users u
        ON p.user_id = u.id
      WHERE p.id = $1
      AND p.user_id = $2
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      patient: result.rows[0],
    });
  } catch (error) {
    console.error("Get patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
      error: error.message,
    });
  }
};


/*
===========================================================
UPDATE PATIENT
PUT /api/patients/:id
===========================================================
*/

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      date_of_birth,
      gender,
      blood_group,
      height_cm,
      weight_kg,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relation,
      allergies,
      chronic_conditions,
      current_medications,
    } = req.body;

    /*
    -------------------------------------------------------
    UPDATE ONLY THE LOGGED-IN USER'S PATIENT PROFILE
    -------------------------------------------------------
    */

    const result = await query(
      `
      UPDATE patients
      SET
        date_of_birth = COALESCE($1, date_of_birth),
        gender = COALESCE($2, gender),
        blood_group = COALESCE($3, blood_group),
        height_cm = COALESCE($4, height_cm),
        weight_kg = COALESCE($5, weight_kg),
        emergency_contact_name = COALESCE($6, emergency_contact_name),
        emergency_contact_phone = COALESCE($7, emergency_contact_phone),
        emergency_contact_relation = COALESCE($8, emergency_contact_relation),
        allergies = COALESCE($9, allergies),
        chronic_conditions = COALESCE($10, chronic_conditions),
        current_medications = COALESCE($11, current_medications),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      AND user_id = $13
      RETURNING *
      `,
      [
        date_of_birth,
        gender,
        blood_group,
        height_cm,
        weight_kg,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relation,
        allergies,
        chronic_conditions,
        current_medications,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      patient: result.rows[0],
    });
  } catch (error) {
    console.error("Update patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update patient profile",
      error: error.message,
    });
  }
};


/*
===========================================================
DELETE PATIENT
DELETE /api/patients/:id
===========================================================
*/

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    /*
    -------------------------------------------------------
    DELETE ONLY THE LOGGED-IN USER'S PATIENT PROFILE
    -------------------------------------------------------
    */

    const result = await query(
      `
      DELETE FROM patients
      WHERE id = $1
      AND user_id = $2
      RETURNING id
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient profile deleted successfully",
      patient_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Delete patient error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete patient profile",
      error: error.message,
    });
  }
};