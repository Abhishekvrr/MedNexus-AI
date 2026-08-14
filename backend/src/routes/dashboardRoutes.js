import express from "express";

import { getDashboard } from "../controllers/dashboardController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
GET /api/dashboard

Returns complete patient dashboard data.
*/
router.get("/", authenticate, getDashboard);

export default router;