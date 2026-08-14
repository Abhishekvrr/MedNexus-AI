import express from "express";

import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  cancelAppointment,
} from "../controllers/appointmentController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all appointments for logged-in patient
router.get("/", authenticate, getAppointments);

// Get a single appointment
router.get("/:id", authenticate, getAppointmentById);

// Create a new appointment
router.post("/", authenticate, createAppointment);

// Cancel an appointment
router.put("/:id/cancel", authenticate, cancelAppointment);

export default router;