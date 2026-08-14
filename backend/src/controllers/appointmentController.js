import { query } from "../config/database.js";

// ============================================================
// GET ALL APPOINTMENTS
// GET /api/appointments
//
// PATIENT -> appointments belonging to patient
// DOCTOR  -> appointments belonging to doctor
// ============================================================
export const getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = String(req.user.role || "").trim().toLowerCase();

    console.log("=================================");
    console.log("GET APPOINTMENTS");
    console.log("User ID:", userId);
    console.log("Role:", role);
    console.log("=================================");

    // ========================================================
    // DOCTOR APPOINTMENTS
    // ========================================================
    if (role === "doctor") {
      const doctorResult = await query(
        `
        SELECT id
        FROM doctors
        WHERE user_id = $1
        LIMIT 1
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

      const appointmentsResult = await query(
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

          p.id AS patient_profile_id,

          pu.full_name AS patient_name,
          pu.email AS patient_email,
          pu.phone AS patient_phone,

          p.date_of_birth,
          p.gender,
          p.blood_group,

          h.name AS hospital_name,
          h.address AS hospital_address,
          h.city AS hospital_city

        FROM appointments a

        INNER JOIN patients p
          ON a.patient_id = p.id

        INNER JOIN users pu
          ON p.user_id = pu.id

        LEFT JOIN hospitals h
          ON a.hospital_id = h.id

        WHERE a.doctor_id = $1

        ORDER BY
          a.appointment_date ASC,
          a.appointment_time ASC
        `,
        [doctorId]
      );

      return res.status(200).json({
        success: true,
        message: "Doctor appointments fetched successfully",
        count: appointmentsResult.rows.length,
        appointments: appointmentsResult.rows,
      });
    }

    // ========================================================
    // PATIENT APPOINTMENTS
    // ========================================================

    const patientResult = await query(
      `
      SELECT id
      FROM patients
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const patientId = patientResult.rows[0].id;

    const appointmentsResult = await query(
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

        u.full_name AS doctor_name,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.rating,
        d.available_for_online,

        h.name AS hospital_name,
        h.address AS hospital_address,
        h.city AS hospital_city

      FROM appointments a

      INNER JOIN doctors d
        ON a.doctor_id = d.id

      INNER JOIN users u
        ON d.user_id = u.id

      LEFT JOIN hospitals h
        ON a.hospital_id = h.id

      WHERE a.patient_id = $1

      ORDER BY
        a.appointment_date ASC,
        a.appointment_time ASC
      `,
      [patientId]
    );

    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      count: appointmentsResult.rows.length,
      appointments: appointmentsResult.rows,
    });

  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};


// ============================================================
// GET SINGLE APPOINTMENT
// GET /api/appointments/:id
//
// PATIENT -> only their appointment
// DOCTOR  -> only appointments assigned to them
// ============================================================
export const getAppointmentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = String(req.user.role || "").trim().toLowerCase();
    const appointmentId = req.params.id;

    // ========================================================
    // DOCTOR
    // ========================================================
    if (role === "doctor") {
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

          pu.full_name AS patient_name,
          pu.email AS patient_email,
          pu.phone AS patient_phone,

          p.date_of_birth,
          p.gender,
          p.blood_group,

          du.full_name AS doctor_name,
          d.specialization,
          d.qualification,
          d.experience_years,
          d.consultation_fee,
          d.rating,

          h.name AS hospital_name,
          h.address AS hospital_address,
          h.city AS hospital_city

        FROM appointments a

        INNER JOIN patients p
          ON a.patient_id = p.id

        INNER JOIN users pu
          ON p.user_id = pu.id

        INNER JOIN doctors d
          ON a.doctor_id = d.id

        INNER JOIN users du
          ON d.user_id = du.id

        LEFT JOIN hospitals h
          ON a.hospital_id = h.id

        WHERE a.id = $1
          AND d.user_id = $2

        LIMIT 1
        `,
        [appointmentId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Appointment fetched successfully",
        appointment: result.rows[0],
      });
    }

    // ========================================================
    // PATIENT
    // ========================================================

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

        u.full_name AS doctor_name,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.rating,
        d.available_for_online,

        h.name AS hospital_name,
        h.address AS hospital_address,
        h.city AS hospital_city

      FROM appointments a

      INNER JOIN patients p
        ON a.patient_id = p.id

      INNER JOIN doctors d
        ON a.doctor_id = d.id

      INNER JOIN users u
        ON d.user_id = u.id

      LEFT JOIN hospitals h
        ON a.hospital_id = h.id

      WHERE a.id = $1
        AND p.user_id = $2

      LIMIT 1
      `,
      [appointmentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment fetched successfully",
      appointment: result.rows[0],
    });

  } catch (error) {
    console.error("Get appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
      error: error.message,
    });
  }
};


// ============================================================
// CREATE APPOINTMENT
// POST /api/appointments
//
// Only patients can book appointments.
// ============================================================
export const createAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = String(req.user.role || "").trim().toLowerCase();

    if (role === "doctor") {
      return res.status(403).json({
        success: false,
        message: "Doctors cannot book patient appointments",
      });
    }

    const {
      doctor_id,
      hospital_id,
      appointment_date,
      appointment_time,
      appointment_type = "in_person",
      reason,
      notes,
    } = req.body;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
      !doctor_id ||
      !appointment_date ||
      !appointment_time
    ) {
      return res.status(400).json({
        success: false,
        message:
          "doctor_id, appointment_date and appointment_time are required",
      });
    }

    // --------------------------------------------------------
    // FIND PATIENT
    // --------------------------------------------------------

    const patientResult = await query(
      `
      SELECT id
      FROM patients
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const patientId = patientResult.rows[0].id;

    // --------------------------------------------------------
    // VERIFY DOCTOR
    // --------------------------------------------------------

    const doctorResult = await query(
      `
      SELECT
        d.id,
        d.user_id,
        d.hospital_id,
        d.specialization,
        d.available_for_online
      FROM doctors d
      WHERE d.id = $1
      LIMIT 1
      `,
      [doctor_id]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const doctor = doctorResult.rows[0];

    // --------------------------------------------------------
    // ONLINE APPOINTMENT VALIDATION
    // --------------------------------------------------------

    if (
      appointment_type === "online" &&
      !doctor.available_for_online
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This doctor is not available for online consultations",
      });
    }

    // --------------------------------------------------------
    // CHECK TIME SLOT
    // --------------------------------------------------------

    const existingAppointment = await query(
      `
      SELECT id
      FROM appointments
      WHERE doctor_id = $1
        AND appointment_date = $2
        AND appointment_time = $3
        AND LOWER(status) IN ('scheduled', 'confirmed')
      LIMIT 1
      `,
      [
        doctor_id,
        appointment_date,
        appointment_time,
      ]
    );

    if (existingAppointment.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This appointment time is already booked",
      });
    }

    // --------------------------------------------------------
    // CREATE APPOINTMENT
    // --------------------------------------------------------

    const appointmentResult = await query(
      `
      INSERT INTO appointments (
        patient_id,
        doctor_id,
        hospital_id,
        appointment_date,
        appointment_time,
        appointment_type,
        reason,
        status,
        notes
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        'scheduled',
        $8
      )
      RETURNING *
      `,
      [
        patientId,
        doctor_id,
        hospital_id || doctor.hospital_id || null,
        appointment_date,
        appointment_time,
        appointment_type,
        reason || null,
        notes || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: appointmentResult.rows[0],
    });

  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message,
    });
  }
};


// ============================================================
// CANCEL APPOINTMENT
// PUT /api/appointments/:id/cancel
//
// Patient can cancel their own appointment.
// Doctor can cancel an appointment assigned to them.
// ============================================================
export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = String(req.user.role || "").trim().toLowerCase();
    const appointmentId = req.params.id;

    // ========================================================
    // DOCTOR CANCEL
    // ========================================================
    if (role === "doctor") {
      const result = await query(
        `
        UPDATE appointments a

        SET
          status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP

        FROM doctors d

        WHERE a.doctor_id = d.id
          AND d.user_id = $1
          AND a.id = $2
          AND LOWER(a.status) IN ('scheduled', 'confirmed')

        RETURNING
          a.id,
          a.patient_id,
          a.doctor_id,
          a.appointment_date,
          a.appointment_time,
          a.status,
          a.updated_at
        `,
        [userId, appointmentId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found or cannot be cancelled",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Appointment cancelled successfully",
        appointment: result.rows[0],
      });
    }

    // ========================================================
    // PATIENT CANCEL
    // ========================================================

    const result = await query(
      `
      UPDATE appointments a

      SET
        status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP

      FROM patients p

      WHERE a.patient_id = p.id
        AND p.user_id = $1
        AND a.id = $2
        AND LOWER(a.status) IN ('scheduled', 'confirmed')

      RETURNING
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.updated_at
      `,
      [userId, appointmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found or cannot be cancelled",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: result.rows[0],
    });

  } catch (error) {
    console.error("Cancel appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};