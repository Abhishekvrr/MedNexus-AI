import express from "express";

import {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
} from "../controllers/prescriptionsController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================================
PRESCRIPTION ROUTES
===========================================================
*/

// Create prescription
// POST /api/prescriptions
router.post("/", authenticate, createPrescription);

// Get my prescriptions
// GET /api/prescriptions
router.get("/", authenticate, getMyPrescriptions);

// Get prescription by ID
// GET /api/prescriptions/:id
router.get("/:id", authenticate, getPrescriptionById);

// Update prescription
// PUT /api/prescriptions/:id
router.put("/:id", authenticate, updatePrescription);

// Delete prescription
// DELETE /api/prescriptions/:id
router.delete("/:id", authenticate, deletePrescription);

export default router;