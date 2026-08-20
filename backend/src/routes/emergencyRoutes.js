import express from "express";
import { getMyEmergencyPass, getPublicEmergencyPass, triggerEmergencySOS } from "../controllers/emergencyPassController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Public first-responder emergency lookup (NO AUTH REQUIRED FOR PARAMEDICS)
router.get("/public/:patientId", getPublicEmergencyPass);

// Authenticated Patient Endpoints
router.get("/me", authenticate, getMyEmergencyPass);
router.post("/sos", authenticate, triggerEmergencySOS);

export default router;
