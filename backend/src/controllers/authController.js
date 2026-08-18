import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { query } from "../config/database.js";

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
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


/*
===========================================================
REGISTER USER
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

    /*
    -------------------------------------------------------
    VALIDATION
    -------------------------------------------------------
    */

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters",
      });
    }

    /*
    -------------------------------------------------------
    CHECK EMAIL
    -------------------------------------------------------
    */

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
        message:
          "An account with this email already exists",
      });
    }

    /*
    -------------------------------------------------------
    HASH PASSWORD
    -------------------------------------------------------
    */

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    /*
    -------------------------------------------------------
    CREATE USER
    -------------------------------------------------------
    */

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

    /*
    -------------------------------------------------------
    AUTO-INITIALIZE PROFILE BY ROLE
    -------------------------------------------------------
    */
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

    /*
    -------------------------------------------------------
    CREATE JWT
    -------------------------------------------------------
    */

    const token = generateToken(user);

    /*
    -------------------------------------------------------
    RESPONSE
    -------------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully",

      user,

      token,
    });

  } catch (error) {
    console.error(
      "Register user error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create account",

      error: error.message,
    });
  }
};


/*
===========================================================
LOGIN USER
POST /api/auth/login
===========================================================
*/

export const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    /*
    -------------------------------------------------------
    VALIDATION
    -------------------------------------------------------
    */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    /*
    -------------------------------------------------------
    FIND USER
    -------------------------------------------------------
    */

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
        message:
          "Invalid email or password",
      });
    }

    const user = result.rows[0];

    /*
    -------------------------------------------------------
    CHECK ACCOUNT STATUS
    -------------------------------------------------------
    */

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "This account has been deactivated",
      });
    }

    /*
    -------------------------------------------------------
    VERIFY PASSWORD
    -------------------------------------------------------
    */

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    /*
    -------------------------------------------------------
    REMOVE PASSWORD HASH FROM RESPONSE
    -------------------------------------------------------
    */

    delete user.password_hash;

    /*
    -------------------------------------------------------
    CREATE JWT
    -------------------------------------------------------
    */

    const token = generateToken(user);

    /*
    -------------------------------------------------------
    RESPONSE
    -------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message:
        "Login successful",

      user,

      token,
    });
  } catch (error) {
    console.error(
      "Login user error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to login",

      error: error.message,
    });
  }
};