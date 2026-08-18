import express from "express";

import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

import { query } from "../config/database.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================================
CREATE PATIENT PROFILE
POST /api/patients
===========================================================
*/
router.post("/", authenticate, createPatient);

/*
===========================================================
GET MY PROFILE
GET /api/patients/profile
===========================================================
*/
router.get("/profile", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

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
      WHERE p.user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile: result.rows[0],
      patient: result.rows[0],
    });
  } catch (error) {
    console.error("Get my profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
});

/*
===========================================================
UPDATE MY PROFILE
PUT /api/patients/profile
===========================================================
*/
router.put("/profile", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

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
        $12,
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
        $11
      )
      ON CONFLICT (user_id) DO UPDATE
      SET
        date_of_birth = COALESCE(EXCLUDED.date_of_birth, patients.date_of_birth),
        gender = COALESCE(EXCLUDED.gender, patients.gender),
        blood_group = COALESCE(EXCLUDED.blood_group, patients.blood_group),
        height_cm = COALESCE(EXCLUDED.height_cm, patients.height_cm),
        weight_kg = COALESCE(EXCLUDED.weight_kg, patients.weight_kg),
        emergency_contact_name = COALESCE(EXCLUDED.emergency_contact_name, patients.emergency_contact_name),
        emergency_contact_phone = COALESCE(EXCLUDED.emergency_contact_phone, patients.emergency_contact_phone),
        emergency_contact_relation = COALESCE(EXCLUDED.emergency_contact_relation, patients.emergency_contact_relation),
        allergies = COALESCE(EXCLUDED.allergies, patients.allergies),
        chronic_conditions = COALESCE(EXCLUDED.chronic_conditions, patients.chronic_conditions),
        current_medications = COALESCE(EXCLUDED.current_medications, patients.current_medications),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [
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
        userId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: result.rows[0],
      patient: result.rows[0],
    });

  } catch (error) {
    console.error("Update my profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

/*
===========================================================
GET ALL PATIENTS
GET /api/patients
===========================================================
*/
router.get("/", authenticate, getPatients);

/*
===========================================================
GET PATIENT BY ID
GET /api/patients/:id
===========================================================
*/
router.get("/:id", authenticate, getPatientById);

/*
===========================================================
UPDATE PATIENT BY ID
PUT /api/patients/:id
===========================================================
*/
router.put("/:id", authenticate, updatePatient);

/*
===========================================================
DELETE PATIENT
DELETE /api/patients/:id
===========================================================
*/
router.delete("/:id", authenticate, deletePatient);

export default router;