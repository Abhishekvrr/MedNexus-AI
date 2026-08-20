import express from "express";

import {
  registerUser,
  loginUser,
  sendRegistrationOTP,
  verifyRegistrationOTP,
  sendLoginOTP,
  verifyLoginOTP,
} from "../controllers/authController.js";

const router = express.Router();

/*
===========================================================
AUTHENTICATION ROUTES WITH EMAIL OTP VERIFICATION
===========================================================
*/

// Standard Register & Login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Email OTP Registration Handlers
router.post("/send-registration-otp", sendRegistrationOTP);
router.post("/verify-registration-otp", verifyRegistrationOTP);

// 2FA / Passwordless Email OTP Login Handlers
router.post("/send-login-otp", sendLoginOTP);
router.post("/verify-login-otp", verifyLoginOTP);

export default router;