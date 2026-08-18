import express from "express";

import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  cancelAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all appointments (patient or doctor)
router.get("/", authenticate, getAppointments);

// Get a single appointment
router.get("/:id", authenticate, getAppointmentById);

// Create a new appointment
router.post("/", authenticate, createAppointment);

// Cancel an appointment
router.put("/:id/cancel", authenticate, cancelAppointment);

// Update status with action parameter (/confirm, /complete, /schedule, etc.)
router.put("/:id/status", authenticate, updateAppointmentStatus);
router.put("/:id/:action", authenticate, updateAppointmentStatus);

export default router;