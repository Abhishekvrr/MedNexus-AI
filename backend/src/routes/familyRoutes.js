import express from "express";

import {
  getFamilyMembers,
} from "../controllers/familyController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  getFamilyMembers
);

export default router;