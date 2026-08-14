import express from "express";

import {
  createAIRecommendation,
  getAIRecommendationsByPatient,
  getLatestAIRecommendation,
  getAIRecommendationById,
} from "../controllers/aiRecommendationController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
====================================================
AI RECOMMENDATION ROUTES
====================================================
*/

/*
Save AI recommendation
POST /api/ai-recommendations
*/
router.post(
  "/",
  authenticate,
  createAIRecommendation
);

/*
Get all recommendations for patient
GET /api/ai-recommendations/patient/:patientId
*/
router.get(
  "/patient/:patientId",
  authenticate,
  getAIRecommendationsByPatient
);

/*
Get latest recommendation
GET /api/ai-recommendations/patient/:patientId/latest
*/
router.get(
  "/patient/:patientId/latest",
  authenticate,
  getLatestAIRecommendation
);

/*
Get recommendation by ID
GET /api/ai-recommendations/:id
*/
router.get(
  "/:id",
  authenticate,
  getAIRecommendationById
);

export default router;