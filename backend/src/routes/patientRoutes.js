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
      WHERE user_id = $12
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

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

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