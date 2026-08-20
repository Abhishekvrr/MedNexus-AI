import express from "express";
import { processAmbientScribe, processPrescriptionDecoder } from "../controllers/aiVoiceScribeController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Ambient scribe (Doctors)
router.post("/ambient-scribe", authenticate, processAmbientScribe);

// Prescription decoder (Patients / Anyone authenticated)
router.post("/decode-prescription", authenticate, processPrescriptionDecoder);

export default router;
