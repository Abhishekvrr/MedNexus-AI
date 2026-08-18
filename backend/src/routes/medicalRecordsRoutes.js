import express from "express";

import {
  createMedicalRecord,
  createDoctorMedicalRecord,
  getMyMedicalRecords,
  getPatientRecordsForDoctor,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "../controllers/medicalRecordsController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================================
MEDICAL RECORD ROUTES
===========================================================
*/

// Create medical record by doctor for a patient
// POST /api/medical-records/doctor
router.post("/doctor", authenticate, createDoctorMedicalRecord);

// Get medical records for a specific patient (Doctor view)
// GET /api/medical-records/patient/:patientId
router.get("/patient/:patientId", authenticate, getPatientRecordsForDoctor);

// Create medical record (Patient view)
// POST /api/medical-records
router.post("/", authenticate, createMedicalRecord);

// Get my medical records (Patient view)
// GET /api/medical-records
router.get("/", authenticate, getMyMedicalRecords);

// Get medical record by ID
// GET /api/medical-records/:id
router.get("/:id", authenticate, getMedicalRecordById);

// Update medical record
// PUT /api/medical-records/:id
router.put("/:id", authenticate, updateMedicalRecord);

// Delete medical record
// DELETE /api/medical-records/:id
router.delete("/:id", authenticate, deleteMedicalRecord);

export default router;