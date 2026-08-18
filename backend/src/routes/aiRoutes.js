import express from "express";

import {
  analyzeHealth,
  doctorChat,
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

export default router;