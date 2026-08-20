import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { query } from "../config/database.js";
import {
  generate6DigitOTP,
  saveOTP,
  verifyStoredOTP,
  sendOTPEmail,
} from "../services/emailService.js";

/*
===========================================================
GENERATE JWT TOKEN
===========================================================
*/

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "mednexus_production_jwt_secret_key_2026",
    {
      expiresIn: "7d",
    }
  );
};


/*
===========================================================
SEND REGISTRATION EMAIL OTP
POST /api/auth/send-registration-otp
===========================================================
*/

export const sendRegistrationOTP = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      role = "patient",
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    // Check if email already registered
    const existingUser = await query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [email.trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash password in advance
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate and save 6-digit OTP
    const otp = generate6DigitOTP();
    saveOTP(email, otp, "registration", {
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      phone: phone || null,
      role,
    });

    // Send verification email
    const emailResult = await sendOTPEmail(email, otp, "registration");

    return res.status(200).json({
      success: true,
      message: "A 6-digit verification code has been sent to your email",
      email: email.trim().toLowerCase(),
      expires_in_seconds: 600,
      previewOtp: emailResult.previewOtp, // Available in dev for seamless testing
    });

  } catch (error) {
    console.error("Send registration OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification email",
      error: error.message,
    });
  }
};


/*
===========================================================
VERIFY REGISTRATION OTP & CREATE ACCOUNT
POST /api/auth/verify-registration-otp
===========================================================
*/

export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and 6-digit OTP code are required",
      });
    }

    const verification = verifyStoredOTP(email, otp, "registration");
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    const tempUser = verification.tempUserData;
    if (!tempUser) {
      return res.status(400).json({
        success: false,
        message: "Registration session data lost. Please register again.",
      });
    }

    // Create user in database
    const result = await query(
      `
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        phone,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        full_name,
        email,
        phone,
        role,
        is_active,
        created_at
      `,
      [
        tempUser.full_name,
        tempUser.email,
        tempUser.passwordHash,
        tempUser.phone,
        tempUser.role,
      ]
    );

    const user = result.rows[0];

    // Auto-initialize profile by role
    if (user.role === "doctor") {
      await query(
        `
        INSERT INTO doctors (user_id, specialization, consultation_fee, available_for_online)
        VALUES ($1, 'General Medicine', 500, TRUE)
        ON CONFLICT (user_id) DO NOTHING
        `,
        [user.id]
      );
    } else if (user.role === "patient") {
      await query(
        `
        INSERT INTO patients (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
        `,
        [user.id]
      );
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Email verified successfully! Account created.",
      user,
      token,
    });

  } catch (error) {
    console.error("Verify registration OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify registration OTP",
      error: error.message,
    });
  }
};


/*
===========================================================
SEND LOGIN OTP (2FA / PASSWORDLESS)
POST /api/auth/send-login-otp
===========================================================
*/

export const sendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const userResult = await query(
      `
      SELECT id, full_name, email, role, is_active
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [email.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    const user = userResult.rows[0];
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    const otp = generate6DigitOTP();
    saveOTP(email, otp, "login", user);

    const emailResult = await sendOTPEmail(email, otp, "login");

    return res.status(200).json({
      success: true,
      message: "A 6-digit 2FA login code has been sent to your email",
      email: email.trim().toLowerCase(),
      expires_in_seconds: 600,
      previewOtp: emailResult.previewOtp,
    });

  } catch (error) {
    console.error("Send login OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send login verification code",
      error: error.message,
    });
  }
};


/*
===========================================================
VERIFY LOGIN OTP
POST /api/auth/verify-login-otp
===========================================================
*/

export const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and 6-digit OTP code are required",
      });
    }

    const verification = verifyStoredOTP(email, otp, "login");
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    const user = verification.tempUserData;
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication verified. Login successful.",
      user,
      token,
    });

  } catch (error) {
    console.error("Verify login OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify login OTP",
      error: error.message,
    });
  }
};


/*
===========================================================
REGISTER USER (DIRECT FALLBACK)
POST /api/auth/register
===========================================================
*/

export const registerUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      role = "patient",
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    const existingUser = await query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [email.trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        phone,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        full_name,
        email,
        phone,
        role,
        is_active,
        created_at
      `,
      [
        full_name.trim(),
        email.trim().toLowerCase(),
        passwordHash,
        phone || null,
        role,
      ]
    );

    const user = result.rows[0];

    if (role === "doctor") {
      await query(
        `
        INSERT INTO doctors (user_id, specialization, consultation_fee, available_for_online)
        VALUES ($1, 'General Medicine', 500, TRUE)
        ON CONFLICT (user_id) DO NOTHING
        `,
        [user.id]
      );
    } else if (role === "patient") {
      await query(
        `
        INSERT INTO patients (user_id)
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
        `,
        [user.id]
      );
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
      token,
    });

  } catch (error) {
    console.error("Register user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create account",
      error: error.message,
    });
  }
};


/*
===========================================================
LOGIN USER (STANDARD EMAIL + PASSWORD)
POST /api/auth/login
===========================================================
*/

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await query(
      `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        phone,
        role,
        is_active,
        created_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    delete user.password_hash;
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
};