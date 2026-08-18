import express from "express";

import {
  getDoctors,
  getDoctorById,
  searchDoctors,
  getDoctorsByHospital,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  getMyPatients,
  getMyAppointments,
} from "../controllers/doctorController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===================================================
DOCTORS ROUTES (/api/doctors)
===================================================
*/

// Search doctors
router.get("/search", authenticate, searchDoctors);

// Get my doctor profile
router.get("/me", authenticate, getMyDoctorProfile);

// Update my doctor profile
router.put("/me", authenticate, updateMyDoctorProfile);
router.put("/profile", authenticate, updateMyDoctorProfile);


// Get my doctor patients
router.get("/my-patients", authenticate, getMyPatients);

// Get my doctor appointments
router.get("/my-appointments", authenticate, getMyAppointments);

// Get doctors by hospital
router.get("/hospital/:hospitalId", authenticate, getDoctorsByHospital);

// Get all doctors (for patient booking & doctor directory)
router.get("/", authenticate, getDoctors);

// Get doctor by ID
router.get("/:id", authenticate, getDoctorById);

// Create doctor profile
router.post("/", authenticate, createDoctor);

// Update doctor profile
router.put("/:id", authenticate, updateDoctor);

// Delete doctor profile
router.delete("/:id", authenticate, deleteDoctor);

export default router;
