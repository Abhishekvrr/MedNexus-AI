import { query } from "../config/database.js";

/*
===========================================================
MEDNEXUS AI - PATIENT CONTEXT SERVICE
===========================================================

Collects the patient's stored healthcare information from
PostgreSQL before sending relevant information to the AI.

Data sources:
1. Patient profile
2. Latest health metrics
3. Medical records
4. Lab reports
5. Active prescriptions

The service does NOT make medical decisions.
It only retrieves and structures existing data.
===========================================================
*/


/*
===========================================================
GET PATIENT PROFILE
===========================================================
*/

const getPatientProfile = async (patientId) => {
  const result = await query(
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
      p.allergies,
      p.chronic_conditions,
      p.current_medications,
      p.emergency_contact_name,
      p.emergency_contact_phone,
      p.emergency_contact_relation

    FROM patients p

    INNER JOIN users u
      ON p.user_id = u.id

    WHERE p.id = $1
    `,
    [patientId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};


/*
===========================================================
GET LATEST HEALTH METRICS
===========================================================
*/

const getLatestHealthMetrics = async (patientId) => {
  const result = await query(
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

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};


/*
===========================================================
GET MEDICAL RECORDS
===========================================================
*/

const getMedicalRecords = async (patientId) => {
  const result = await query(
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

    LIMIT 20
    `,
    [patientId]
  );

  return result.rows;
};


/*
===========================================================
GET LAB REPORTS
===========================================================
*/

const getLabReports = async (patientId) => {
  const result = await query(
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
      notes,
      created_at

    FROM lab_reports

    WHERE patient_id = $1

    ORDER BY test_date DESC, created_at DESC

    LIMIT 20
    `,
    [patientId]
  );

  return result.rows;
};


/*
===========================================================
GET ACTIVE PRESCRIPTIONS
===========================================================
*/

const getActivePrescriptions = async (patientId) => {
  const result = await query(
    `
    SELECT
      id,
      patient_id,
      doctor_id,
      medical_record_id,
      medicine_name,
      dosage,
      frequency,
      duration,
      instructions,
      start_date,
      end_date,
      status,
      created_at

    FROM prescriptions

    WHERE
      patient_id = $1
      AND status = 'active'

    ORDER BY created_at DESC

    LIMIT 20
    `,
    [patientId]
  );

  return result.rows;
};


/*
===========================================================
BUILD COMPLETE PATIENT CONTEXT
===========================================================
*/

export const buildPatientContext = async (patientId) => {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required");
    }

    /*
    Fetch all patient information.
    Promise.all allows the independent database queries
    to execute concurrently.
    */

    const [
      patient,
      healthMetrics,
      medicalRecords,
      labReports,
      prescriptions,
    ] = await Promise.all([
      getPatientProfile(patientId),
      getLatestHealthMetrics(patientId),
      getMedicalRecords(patientId),
      getLabReports(patientId),
      getActivePrescriptions(patientId),
    ]);

    /*
    Patient profile is mandatory.
    */

    if (!patient) {
      return {
        success: false,
        message: "Patient profile not found",
        context: null,
      };
    }

    /*
    Return a clean structure for the AI service.
    */

    return {
      success: true,

      context: {
        patient,
        healthMetrics,
        medicalRecords,
        labReports,
        prescriptions,
      },
    };
  } catch (error) {
    console.error(
      "Build patient context error:",
      error
    );

    throw error;
  }
};