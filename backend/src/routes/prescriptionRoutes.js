import express from "express";

import {
  getMyPrescriptions,
  getDoctorPrescriptions,
  getPatientPrescriptions,
  createPrescription,
  createBatchPrescriptions,
  updatePrescription,
  deletePrescription,
} from "../controllers/prescriptionController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
====================================================
PATIENT
====================================================
*/

// Logged-in patient sees their prescriptions
router.get(
  "/",
  authenticate,
  getMyPrescriptions
);

/*
====================================================
DOCTOR
====================================================
*/

// Doctor sees all their issued prescriptions
router.get(
  "/doctor",
  authenticate,
  getDoctorPrescriptions
);

// Doctor sees prescriptions for a specific patient
// IMPORTANT: keep this BEFORE /:id
router.get(
  "/patient/:patientId",
  authenticate,
  getPatientPrescriptions
);

// Doctor creates batch prescriptions
router.post(
  "/batch",
  authenticate,
  createBatchPrescriptions
);

// Doctor creates single prescription
router.post(
  "/",
  authenticate,
  createPrescription
);

// Doctor updates prescription
router.put(
  "/:id",
  authenticate,
  updatePrescription
);

// Doctor deletes prescription
router.delete(
  "/:id",
  authenticate,
  deletePrescription
);

export default router;