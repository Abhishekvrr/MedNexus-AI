import { query } from "../config/database.js";

/*
====================================================
GET MY DOCTOR PROFILE
GET /api/doctors/me
====================================================
*/
export const getMyDoctorProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await query(
      `
      SELECT
        d.id,
        d.user_id,
        u.full_name AS doctor_name,
        u.email,
        u.phone,
        d.hospital_id,
        h.name AS hospital_name,
        h.address AS hospital_address,
        h.city AS hospital_city,
        h.state AS hospital_state,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.license_number,
        d.bio,
        d.available_for_online,
        d.rating,
        d.total_consultations,
        d.created_at
      FROM doctors d
      INNER JOIN users u
        ON d.user_id = u.id
      LEFT JOIN hospitals h
        ON d.hospital_id = h.id
      WHERE d.user_id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor: result.rows[0],
    });
  } catch (error) {
    console.error("Get my doctor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile",
      error: error.message,
    });
  }
};


/*
====================================================
GET MY PATIENTS
GET /api/doctors/my-patients
====================================================
*/
export const getMyPatients = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const doctorResult = await query(
      `
      SELECT id
      FROM doctors
      WHERE user_id = $1
      `,
      [userId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const doctorId = doctorResult.rows[0].id;

    const result = await query(
      `
      SELECT DISTINCT
        p.id,
        p.user_id,
        u.full_name,
        u.email,
        u.phone,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.address,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.emergency_contact_relation
      FROM appointments a
      INNER JOIN patients p
        ON a.patient_id = p.id
      INNER JOIN users u
        ON p.user_id = u.id
      WHERE a.doctor_id = $1
      ORDER BY u.full_name ASC
      `,
      [doctorId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      patients: result.rows,
    });
  } catch (error) {
    console.error("Get my patients error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
};


/*
====================================================
GET MY APPOINTMENTS
GET /api/doctors/my-appointments
====================================================
*/
export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await query(
      `
      SELECT
        a.id,
        a.patient_id,
        a.doctor_id,
        a.hospital_id,
        a.appointment_date,
        a.appointment_time,
        a.appointment_type,
        a.reason,
        a.status,
        a.notes,
        a.created_at,
        a.updated_at,

        u.full_name AS patient_name,
        u.email AS patient_email,
        u.phone AS patient_phone,

        p.date_of_birth,
        p.gender,
        p.blood_group

      FROM appointments a

      INNER JOIN doctors d
        ON a.doctor_id = d.id

      INNER JOIN patients p
        ON a.patient_id = p.id

      INNER JOIN users u
        ON p.user_id = u.id

      WHERE d.user_id = $1

      ORDER BY
        a.appointment_date DESC,
        a.appointment_time DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      appointments: result.rows,
    });
  } catch (error) {
    console.error("Get doctor appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};


/*
====================================================
CREATE DOCTOR PROFILE
POST /api/doctors
====================================================
*/
export const createDoctor = async (req, res) => {
  try {
    const {
      user_id,
      hospital_id,
      specialization,
      qualification,
      experience_years,
      consultation_fee,
      license_number,
      bio,
      available_for_online,
      rating,
    } = req.body;

    if (!user_id || !specialization) {
      return res.status(400).json({
        success: false,
        message: "user_id and specialization are required",
      });
    }

    const userResult = await query(
      `
      SELECT id, full_name, email, role
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userResult.rows[0].role !== "doctor") {
      return res.status(400).json({
        success: false,
        message: "User must have doctor role",
      });
    }

    const existingDoctor = await query(
      `
      SELECT id
      FROM doctors
      WHERE user_id = $1
      `,
      [user_id]
    );

    if (existingDoctor.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Doctor profile already exists for this user",
      });
    }

    if (hospital_id) {
      const hospitalResult = await query(
        `
        SELECT id
        FROM hospitals
        WHERE id = $1
        `,
        [hospital_id]
      );

      if (hospitalResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Hospital not found",
        });
      }
    }

    const result = await query(
      `
      INSERT INTO doctors (
        user_id,
        hospital_id,
        specialization,
        qualification,
        experience_years,
        consultation_fee,
        license_number,
        bio,
        available_for_online,
        rating
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10
      )
      RETURNING *
      `,
      [
        user_id,
        hospital_id || null,
        specialization,
        qualification || null,
        experience_years ?? 0,
        consultation_fee || null,
        license_number || null,
        bio || null,
        available_for_online ?? true,
        rating || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Doctor profile created successfully",
      doctor: {
        ...result.rows[0],
        full_name: userResult.rows[0].full_name,
        email: userResult.rows[0].email,
      },
    });
  } catch (error) {
    console.error("Create doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create doctor profile",
      error: error.message,
    });
  }
};


/*
====================================================
GET ALL DOCTORS
GET /api/doctors
====================================================
*/
export const getDoctors = async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        d.id,
        d.user_id,
        u.full_name AS doctor_name,
        u.full_name,
        u.email,
        u.phone,
        d.hospital_id,
        h.name AS hospital_name,
        h.address AS hospital_address,
        h.city AS hospital_city,
        h.state AS hospital_state,
        h.phone AS hospital_phone,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.license_number,
        d.bio,
        d.available_for_online,
        d.rating,
        d.total_consultations,
        d.created_at
      FROM doctors d
      INNER JOIN users u
        ON d.user_id = u.id
      LEFT JOIN hospitals h
        ON d.hospital_id = h.id
      ORDER BY
        d.rating DESC NULLS LAST,
        d.experience_years DESC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      doctors: result.rows,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};


/*
====================================================
GET DOCTOR BY ID
GET /api/doctors/:id
====================================================
*/
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT
        d.id,
        d.user_id,
        u.full_name AS doctor_name,
        u.full_name,
        u.email,
        u.phone,
        d.hospital_id,
        h.name AS hospital_name,
        h.address AS hospital_address,
        h.city AS hospital_city,
        h.state AS hospital_state,
        h.phone AS hospital_phone,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.license_number,
        d.bio,
        d.available_for_online,
        d.rating,
        d.total_consultations,
        d.created_at
      FROM doctors d
      INNER JOIN users u
        ON d.user_id = u.id
      LEFT JOIN hospitals h
        ON d.hospital_id = h.id
      WHERE d.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor: result.rows[0],
    });
  } catch (error) {
    console.error("Get doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
      error: error.message,
    });
  }
};


/*
====================================================
SEARCH DOCTORS
GET /api/doctors/search
====================================================
*/
export const searchDoctors = async (req, res) => {
  try {
    const { specialization, city } = req.query;

    const conditions = [];
    const values = [];
    let parameterIndex = 1;

    if (specialization) {
      conditions.push(
        `LOWER(d.specialization) LIKE LOWER($${parameterIndex})`
      );
      values.push(`%${specialization}%`);
      parameterIndex++;
    }

    if (city) {
      conditions.push(
        `LOWER(h.city) = LOWER($${parameterIndex})`
      );
      values.push(city);
      parameterIndex++;
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const result = await query(
      `
      SELECT
        d.id,
        d.user_id,
        u.full_name AS doctor_name,
        u.full_name,
        u.email,
        u.phone,
        d.hospital_id,
        h.name AS hospital_name,
        h.address AS hospital_address,
        h.city AS hospital_city,
        h.state AS hospital_state,
        h.phone AS hospital_phone,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.license_number,
        d.bio,
        d.available_for_online,
        d.rating,
        d.total_consultations
      FROM doctors d
      INNER JOIN users u
        ON d.user_id = u.id
      LEFT JOIN hospitals h
        ON d.hospital_id = h.id
      ${whereClause}
      ORDER BY
        d.rating DESC NULLS LAST,
        d.experience_years DESC
      `,
      values
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      doctors: result.rows,
    });
  } catch (error) {
    console.error("Search doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search doctors",
      error: error.message,
    });
  }
};


/*
====================================================
GET DOCTORS BY HOSPITAL
GET /api/doctors/hospital/:hospitalId
====================================================
*/
export const getDoctorsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    const result = await query(
      `
      SELECT
        d.id,
        d.user_id,
        u.full_name AS doctor_name,
        u.full_name,
        u.email,
        u.phone,
        d.hospital_id,
        h.name AS hospital_name,
        h.address AS hospital_address,
        h.city AS hospital_city,
        h.state AS hospital_state,
        h.phone AS hospital_phone,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.license_number,
        d.bio,
        d.available_for_online,
        d.rating,
        d.total_consultations,
        d.created_at
      FROM doctors d
      INNER JOIN users u
        ON d.user_id = u.id
      INNER JOIN hospitals h
        ON d.hospital_id = h.id
      WHERE d.hospital_id = $1
      ORDER BY
        d.rating DESC NULLS LAST,
        d.experience_years DESC
      `,
      [hospitalId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      doctors: result.rows,
    });
  } catch (error) {
    console.error("Get doctors by hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors by hospital",
      error: error.message,
    });
  }
};


/*
====================================================
UPDATE DOCTOR
PUT /api/doctors/:id
====================================================
*/
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      hospital_id,
      specialization,
      qualification,
      experience_years,
      consultation_fee,
      license_number,
      bio,
      available_for_online,
      rating,
    } = req.body;

    const result = await query(
      `
      UPDATE doctors
      SET
        hospital_id = COALESCE($1, hospital_id),
        specialization = COALESCE($2, specialization),
        qualification = COALESCE($3, qualification),
        experience_years = COALESCE($4, experience_years),
        consultation_fee = COALESCE($5, consultation_fee),
        license_number = COALESCE($6, license_number),
        bio = COALESCE($7, bio),
        available_for_online = COALESCE($8, available_for_online),
        rating = COALESCE($9, rating)
      WHERE id = $10
      RETURNING *
      `,
      [
        hospital_id,
        specialization,
        qualification,
        experience_years,
        consultation_fee,
        license_number,
        bio,
        available_for_online,
        rating,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      doctor: result.rows[0],
    });
  } catch (error) {
    console.error("Update doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message,
    });
  }
};


/*
====================================================
DELETE DOCTOR
DELETE /api/doctors/:id
====================================================
*/
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      DELETE FROM doctors
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor profile deleted successfully",
      doctor_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Delete doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: error.message,
    });
  }
};