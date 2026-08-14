import express from "express";

import {
  createLabReport,
  getMyLabReports,
  getLabReportById,
  updateLabReport,
  deleteLabReport,
} from "../controllers/labReportsController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================================
LAB REPORT ROUTES
===========================================================
*/

// Create lab report
// POST /api/lab-reports
router.post("/", authenticate, createLabReport);

// Get my lab reports
// GET /api/lab-reports
router.get("/", authenticate, getMyLabReports);

// Get lab report by ID
// GET /api/lab-reports/:id
router.get("/:id", authenticate, getLabReportById);

// Update lab report
// PUT /api/lab-reports/:id
router.put("/:id", authenticate, updateLabReport);

// Delete lab report
// DELETE /api/lab-reports/:id
router.delete("/:id", authenticate, deleteLabReport);

export default router;