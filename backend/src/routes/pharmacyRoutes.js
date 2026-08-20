import express from "express";
import { createPharmacyOrder, getPharmacyOrders } from "../controllers/pharmacyController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Pharmacy Order from Prescriptions / Cart
// POST /api/pharmacy/order
router.post("/order", authenticate, createPharmacyOrder);

// Get Patient's Orders
// GET /api/pharmacy/orders
router.get("/orders", authenticate, getPharmacyOrders);

export default router;
