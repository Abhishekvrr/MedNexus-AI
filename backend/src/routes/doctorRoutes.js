import express from "express";
import pool from "../config/database.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * ============================================================
 * GET DOCTOR'S PATIENTS
 * ============================================================
 *
 * GET /api/doctor/patients
 *
 * Returns all patients who have appointments with
 * the currently authenticated doctor.
 *
 * Authentication:
 * Required
 *
 * Role:
 * Doctor
 */
router.get("/patients", authenticate, async (req, res) => {
    try {
        console.log("=================================");
        console.log("DOCTOR PATIENTS REQUEST");
        console.log("Authenticated user:", req.user);

        // -------------------------------------------------------
        // Validate authenticated user
        // -------------------------------------------------------
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const doctorUserId = req.user.id;

        // -------------------------------------------------------
        // SQL QUERY
        //
        // users      -> stores full_name, email, phone, etc.
        // doctors    -> connects doctor user to appointments
        // patients   -> stores patient medical/profile details
        // appointments -> connects doctor and patient
        // -------------------------------------------------------
        const query = `
            SELECT
                p.id AS patient_id,

                -- User information
                u.full_name,
                u.email,
                u.phone,
                u.profile_image,

                -- Patient information
                p.date_of_birth,
                p.gender,
                p.blood_group,
                p.height_cm,
                p.weight_kg,
                p.allergies,
                p.chronic_conditions,
                p.current_medications,

                -- Appointment information
                MAX(
                    a.appointment_date + a.appointment_time
                ) AS last_appointment,

                COUNT(a.id)::integer AS appointment_count

            FROM appointments a

            INNER JOIN doctors d
                ON d.id = a.doctor_id

            INNER JOIN patients p
                ON p.id = a.patient_id

            INNER JOIN users u
                ON u.id = p.user_id

            WHERE d.user_id = $1

            GROUP BY
                p.id,
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.profile_image,
                p.date_of_birth,
                p.gender,
                p.blood_group,
                p.height_cm,
                p.weight_kg,
                p.allergies,
                p.chronic_conditions,
                p.current_medications

            ORDER BY
                last_appointment DESC NULLS LAST;
        `;

        // -------------------------------------------------------
        // Execute query
        // -------------------------------------------------------
        const result = await pool.query(query, [doctorUserId]);

        console.log(`✅ Found ${result.rows.length} patients`);

        // -------------------------------------------------------
        // Send response
        // -------------------------------------------------------
        return res.status(200).json({
            success: true,
            count: result.rows.length,
            patients: result.rows
        });

    } catch (error) {
        console.error("=================================");
        console.error("❌ DOCTOR PATIENTS ERROR");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to load doctor patients",
            error: error.message
        });
    }
});


/**
 * ============================================================
 * GET SINGLE PATIENT
 * ============================================================
 *
 * GET /api/doctor/patients/:patientId
 *
 * Returns detailed information about one patient,
 * but only if that patient has an appointment with
 * the authenticated doctor.
 */
router.get("/patients/:patientId", authenticate, async (req, res) => {
    try {
        console.log("=================================");
        console.log("SINGLE DOCTOR PATIENT REQUEST");

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const doctorUserId = req.user.id;
        const { patientId } = req.params;

        // -------------------------------------------------------
        // Validate patient ID
        // -------------------------------------------------------
        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient ID is required"
            });
        }

        const query = `
            SELECT
                p.id AS patient_id,

                u.full_name,
                u.email,
                u.phone,
                u.profile_image,

                p.date_of_birth,
                p.gender,
                p.blood_group,
                p.height_cm,
                p.weight_kg,
                p.emergency_contact_name,
                p.emergency_contact_phone,
                p.emergency_contact_relation,
                p.allergies,
                p.chronic_conditions,
                p.current_medications,

                MAX(
                    a.appointment_date + a.appointment_time
                ) AS last_appointment,

                COUNT(a.id)::integer AS appointment_count

            FROM appointments a

            INNER JOIN doctors d
                ON d.id = a.doctor_id

            INNER JOIN patients p
                ON p.id = a.patient_id

            INNER JOIN users u
                ON u.id = p.user_id

            WHERE
                d.user_id = $1
                AND p.id = $2

            GROUP BY
                p.id,
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.profile_image,
                p.date_of_birth,
                p.gender,
                p.blood_group,
                p.height_cm,
                p.weight_kg,
                p.emergency_contact_name,
                p.emergency_contact_phone,
                p.emergency_contact_relation,
                p.allergies,
                p.chronic_conditions,
                p.current_medications;
        `;

        const result = await pool.query(query, [
            doctorUserId,
            patientId
        ]);

        // -------------------------------------------------------
        // Patient not found / not associated with doctor
        // -------------------------------------------------------
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Patient not found or not associated with this doctor"
            });
        }

        console.log("✅ Patient found");

        return res.status(200).json({
            success: true,
            patient: result.rows[0]
        });

    } catch (error) {
        console.error("=================================");
        console.error("❌ SINGLE PATIENT ERROR");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to load patient",
            error: error.message
        });
    }
});


/**
 * ============================================================
 * GET DOCTOR PATIENT STATISTICS
 * ============================================================
 *
 * GET /api/doctor/patients/stats
 *
 * Returns basic statistics for the doctor's dashboard.
 */
router.get("/patients/stats", authenticate, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const doctorUserId = req.user.id;

        const query = `
            SELECT
                COUNT(DISTINCT a.patient_id)::integer AS total_patients,

                COUNT(a.id)::integer AS total_appointments,

                COUNT(
                    CASE
                        WHEN a.status = 'scheduled'
                        THEN 1
                    END
                )::integer AS scheduled_appointments,

                COUNT(
                    CASE
                        WHEN a.status = 'completed'
                        THEN 1
                    END
                )::integer AS completed_appointments,

                COUNT(
                    CASE
                        WHEN a.status = 'cancelled'
                        THEN 1
                    END
                )::integer AS cancelled_appointments

            FROM appointments a

            INNER JOIN doctors d
                ON d.id = a.doctor_id

            WHERE d.user_id = $1;
        `;

        const result = await pool.query(query, [doctorUserId]);

        return res.status(200).json({
            success: true,
            stats: result.rows[0]
        });

    } catch (error) {
        console.error("❌ DOCTOR PATIENT STATS ERROR");
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to load doctor statistics",
            error: error.message
        });
    }
});


/**
 * ============================================================
 * EXPORT ROUTER
 * ============================================================
 */
export default router;