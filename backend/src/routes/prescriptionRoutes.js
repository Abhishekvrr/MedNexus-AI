import express from "express";

import {
  getMyPrescriptions,
  getPatientPrescriptions,
  createPrescription,
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

// Doctor sees prescriptions for a specific patient
// IMPORTANT: keep this BEFORE /:id
router.get(
  "/patient/:patientId",
  authenticate,
  getPatientPrescriptions
);

// Doctor creates prescription
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