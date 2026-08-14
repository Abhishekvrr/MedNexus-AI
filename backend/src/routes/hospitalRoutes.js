import express from "express";

import {
  createHospital,
  getHospitals,
  getHospitalById,
  searchHospitals,
  updateHospital,
  deleteHospital,
} from "../controllers/hospitalController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================================
HOSPITAL ROUTES
===========================================================
*/

// Create hospital
router.post("/", authenticate, createHospital);

// Search hospitals
router.get("/search", authenticate, searchHospitals);

// Get all hospitals
router.get("/", authenticate, getHospitals);

// Get hospital by ID
router.get("/:id", authenticate, getHospitalById);

// Update hospital
router.put("/:id", authenticate, updateHospital);

// Delete hospital
router.delete("/:id", authenticate, deleteHospital);

export default router;