import express from "express";

import {
  analyzeHealth,
  doctorChat,
  getDiseaseDietPlan,
  explainTabletAndReport,
  getRecoveryCheckIn,
} from "../controllers/aiController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================================
MEDNEXUS AI ROUTES
===========================================================
*/

// Patient Symptom & Health Analysis
// POST /api/ai/analyze
router.post(
  "/analyze",
  authenticate,
  analyzeHealth
);

// Doctor Clinical Copilot Chat
// POST /api/ai/doctor-chat
router.post(
  "/doctor-chat",
  authenticate,
  doctorChat
);

// Disease-Specific Food & Nutrition Diet Plan
// POST /api/ai/diet-plan
router.post(
  "/diet-plan",
  authenticate,
  getDiseaseDietPlan
);

// Natural Language Tablet & Lab Report Explainer
// POST /api/ai/tablet-explain
router.post(
  "/tablet-explain",
  authenticate,
  explainTabletAndReport
);

// Post-Medication Empathetic Recovery Check-in
// POST /api/ai/recovery-checkin
router.post(
  "/recovery-checkin",
  authenticate,
  getRecoveryCheckIn
);

export default router;