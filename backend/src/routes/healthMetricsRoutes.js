import express from "express";

import {
  createHealthMetric,
  getMyHealthMetrics,
  getLatestHealthMetric,
  deleteHealthMetric,
} from "../controllers/healthMetricsController.js";

import { getBiometricRadarData } from "../controllers/biometricRadarController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================================
HEALTH METRICS ROUTES
===========================================================
*/

// Biometric Organ Radar & 5-Year Trajectory
// POST /api/health-metrics/biometric-radar
router.post("/biometric-radar", authenticate, getBiometricRadarData);

// Record new health metrics
// POST /api/health-metrics
router.post("/", authenticate, createHealthMetric);

// Get my complete health history
// GET /api/health-metrics
router.get("/", authenticate, getMyHealthMetrics);

// Get my latest health reading
// GET /api/health-metrics/latest
router.get("/latest", authenticate, getLatestHealthMetric);

// Delete one of my health readings
// DELETE /api/health-metrics/:id
router.delete("/:id", authenticate, deleteHealthMetric);

export default router;