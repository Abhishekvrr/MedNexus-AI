import { query } from "../config/database.js";

/*
=======================================================
MEDNEXUS AI - DOCTOR RECOMMENDATION SERVICE

Flow:

AI Health Assessment
        ↓
Recommended Specialty
        ↓
Real Doctors in PostgreSQL
        ↓
Hospital Information
        ↓
Ranking
        ↓
Patient Recommendations

IMPORTANT:
The AI never invents doctors or hospitals.
All doctors and hospitals come from PostgreSQL.
=======================================================
*/

export const findRecommendedDoctors = async ({
  specialty,
  city = null,
  consultationMode = null,
}) => {
  try {
    /*
    ===================================================
    1. VALIDATE SPECIALTY
    ===================================================
    */

    if (!specialty || !specialty.trim()) {
      return {
        success: false,
        message: "Medical specialty is required",
        count: 0,
        doctors: [],
      };
    }

    /*
    ===================================================
    2. BUILD SEARCH CONDITIONS
    ===================================================
    */

    const values = [];
    const conditions = [];

    /*
    ---------------------------------------------------
    Specialty matching
    ---------------------------------------------------

    We use case-insensitive partial matching instead of
    exact matching.

    Example:

    "General Physician"
    can match:

    "General Physician"
    "General Medicine"
    "General Medical Practice"
    ---------------------------------------------------
    */

    values.push(`%${specialty.trim()}%`);

    conditions.push(`
      (
        LOWER(d.specialization) LIKE LOWER($1)
        OR LOWER($1) LIKE '%' || LOWER(d.specialization) || '%'
      )
    `);

    /*
    ===================================================
    3. CITY FILTER
    ===================================================
    */

    if (city && city.trim()) {
      values.push(city.trim());

      conditions.push(`
        LOWER(h.city) = LOWER($${values.length})
      `);
    }

    /*
    ===================================================
    4. CONSULTATION MODE FILTER
    ===================================================

    Supported:

    online
    in_person

    If nothing is provided, both are returned.
    ===================================================
    */

    if (
      consultationMode === "online"
    ) {
      conditions.push(`
        d.available_for_online = TRUE
      `);
    }

    /*
    ===================================================
    5. BUILD QUERY
    ===================================================
    */

    const result = await query(
      `
      SELECT
        d.id AS doctor_id,

        u.full_name AS doctor_name,
        u.email AS doctor_email,

        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.bio,

        d.available_for_online,
        d.rating,
        d.total_consultations,

        h.id AS hospital_id,
        h.name AS hospital_name,
        h.address AS hospital_address,
        h.city AS hospital_city,
        h.state AS hospital_state,
        h.postal_code AS hospital_postal_code,
        h.phone AS hospital_phone,
        h.email AS hospital_email,
        h.website AS hospital_website,

        h.latitude AS hospital_latitude,
        h.longitude AS hospital_longitude,

        h.emergency_services

      FROM doctors d

      INNER JOIN users u
        ON d.user_id = u.id

      LEFT JOIN hospitals h
        ON d.hospital_id = h.id

      WHERE
        ${conditions.join("\n        AND ")}

      ORDER BY
        d.rating DESC NULLS LAST,
        d.experience_years DESC,
        d.total_consultations DESC

      LIMIT 20
      `,
      values
    );

    /*
    ===================================================
    6. RETURN DOCTORS
    ===================================================
    */

    return {
      success: true,
      count: result.rows.length,
      doctors: result.rows,
    };
  } catch (error) {
    console.error(
      "Doctor recommendation service error:",
      error
    );

    throw error;
  }
};