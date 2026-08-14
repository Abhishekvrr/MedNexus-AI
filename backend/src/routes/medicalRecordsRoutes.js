import express from "express";

import {
  createMedicalRecord,
  getMyMedicalRecords,
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

// Create medical record
// POST /api/medical-records
router.post("/", authenticate, createMedicalRecord);

// Get my medical records
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