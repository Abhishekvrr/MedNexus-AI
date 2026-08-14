import { query } from "../config/database.js";

export const getDashboard = async (req, res) => {
  try {
    // User ID comes from the JWT authentication middleware
    const userId = req.user.id;

    // ---------------------------------------------------------
    // 1. PATIENT PROFILE
    // ---------------------------------------------------------
    const patientResult = await query(
      `
      SELECT
        p.id,
        p.user_id,
        u.full_name,
        u.email,
        u.phone,
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
        p.created_at,
        p.updated_at
      FROM patients p
      INNER JOIN users u
        ON p.user_id = u.id
      WHERE p.user_id = $1
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

    const patient = patientResult.rows[0];
    const patientId = patient.id;

    // ---------------------------------------------------------
    // 2. LATEST HEALTH METRICS
    // ---------------------------------------------------------
    const healthMetricsResult = await query(
      `
      SELECT
        id,
        patient_id,
        heart_rate,
        systolic_bp,
        diastolic_bp,
        temperature,
        oxygen_saturation,
        respiratory_rate,
        blood_glucose,
        weight_kg,
        recorded_at,
        notes
      FROM health_metrics
      WHERE patient_id = $1
      ORDER BY recorded_at DESC
      LIMIT 1
      `,
      [patientId]
    );

    // ---------------------------------------------------------
    // 3. RECENT MEDICAL RECORDS
    // ---------------------------------------------------------
    const medicalRecordsResult = await query(
      `
      SELECT
        mr.id,
        mr.patient_id,
        mr.doctor_id,
        mr.appointment_id,
        mr.diagnosis,
        mr.symptoms,
        mr.treatment,
        mr.medical_notes,
        mr.record_date,
        mr.created_at,

        u.full_name AS doctor_name

      FROM medical_records mr

      LEFT JOIN doctors d
        ON mr.doctor_id = d.id

      LEFT JOIN users u
        ON d.user_id = u.id

      WHERE mr.patient_id = $1
      ORDER BY mr.record_date DESC, mr.created_at DESC
      LIMIT 5
      `,
      [patientId]
    );

    // ---------------------------------------------------------
    // 4. RECENT LAB REPORTS
    // ---------------------------------------------------------
    const labReportsResult = await query(
      `
      SELECT
        id,
        patient_id,
        doctor_id,
        test_name,
        test_date,
        result_value,
        unit,
        reference_range,
        status,
        report_file_url,
        notes,
        created_at
      FROM lab_reports
      WHERE patient_id = $1
      ORDER BY test_date DESC, created_at DESC
      LIMIT 5
      `,
      [patientId]
    );

    // ---------------------------------------------------------
    // 5. ACTIVE PRESCRIPTIONS
    // ---------------------------------------------------------
    const prescriptionsResult = await query(
      `
      SELECT
        p.id,
        p.patient_id,
        p.doctor_id,
        p.medical_record_id,
        p.medicine_name,
        p.dosage,
        p.frequency,
        p.duration,
        p.instructions,
        p.start_date,
        p.end_date,
        p.status,
        p.created_at,

        u.full_name AS doctor_name

      FROM prescriptions p

      LEFT JOIN doctors d
        ON p.doctor_id = d.id

      LEFT JOIN users u
        ON d.user_id = u.id

      WHERE p.patient_id = $1
        AND LOWER(p.status) = 'active'

      ORDER BY p.created_at DESC
      `,
      [patientId]
    );

    // ---------------------------------------------------------
    // 6. UPCOMING APPOINTMENTS
    // ---------------------------------------------------------
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

        u.full_name AS doctor_name,
        d.specialization,

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
        AND a.appointment_date >= CURRENT_DATE
        AND LOWER(a.status) IN ('scheduled', 'confirmed')

      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT 5
      `,
      [patientId]
    );

    // ---------------------------------------------------------
    // 7. UNREAD NOTIFICATIONS
    // ---------------------------------------------------------
    const notificationsResult = await query(
      `
      SELECT
        id,
        user_id,
        title,
        message,
        notification_type,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
        AND is_read = false
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [userId]
    );

    // ---------------------------------------------------------
    // 8. LATEST AI RECOMMENDATION
    // ---------------------------------------------------------
    const aiRecommendationResult = await query(
      `
      SELECT
        id,
        patient_id,
        recommendation_type,
        input_summary,
        recommendation,
        risk_level,
        confidence_score,
        disclaimer,
        created_at
      FROM ai_recommendations
      WHERE patient_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [patientId]
    );

    // ---------------------------------------------------------
    // 9. DASHBOARD RESPONSE
    // ---------------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Patient dashboard data fetched successfully",

      dashboard: {
        patient,

        latest_health_metrics:
          healthMetricsResult.rows[0] || null,

        recent_medical_records:
          medicalRecordsResult.rows,

        recent_lab_reports:
          labReportsResult.rows,

        active_prescriptions:
          prescriptionsResult.rows,

        upcoming_appointments:
          appointmentsResult.rows,

        unread_notifications:
          notificationsResult.rows,

        latest_ai_recommendation:
          aiRecommendationResult.rows[0] || null,

        summary: {
          medical_records: medicalRecordsResult.rows.length,
          lab_reports: labReportsResult.rows.length,
          active_prescriptions: prescriptionsResult.rows.length,
          upcoming_appointments: appointmentsResult.rows.length,
          unread_notifications: notificationsResult.rows.length,
          has_ai_recommendation:
            aiRecommendationResult.rows.length > 0,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};