import express from "express";

import {
  analyzeHealth,
} from "../controllers/aiController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================================
MEDNEXUS AI ROUTES
===========================================================
*/

/*
Analyze patient's current health concern

POST /api/ai/analyze
*/
router.post(
  "/analyze",
  authenticate,
  analyzeHealth
);

export default router;