import express from "express";

import {
  getAIRecommendations,
} from "../controllers/recommendationController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================================
AI RECOMMENDATION ROUTES
===========================================================
*/

/*
POST /api/recommendations
*/

router.post(
  "/",
  authenticate,
  getAIRecommendations
);

export default router;