-- ============================================================
-- MEDNEXUS AI
-- Healthcare Intelligence Platform
-- PostgreSQL Database Schema
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- USERS
-- Central authentication and account table
-- ============================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    phone VARCHAR(20),

    role VARCHAR(30) NOT NULL DEFAULT 'patient',

    profile_image TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT users_role_check
        CHECK (role IN ('patient', 'doctor', 'admin'))
);


-- ============================================================
-- HOSPITALS
-- Hospitals and healthcare facilities
-- ============================================================

CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(200) NOT NULL,

    address TEXT NOT NULL,

    city VARCHAR(100) NOT NULL,

    state VARCHAR(100),

    postal_code VARCHAR(20),

    phone VARCHAR(20),

    email VARCHAR(255),

    website TEXT,

    latitude DECIMAL(10, 7),

    longitude DECIMAL(10, 7),

    emergency_services BOOLEAN DEFAULT FALSE,

    rating DECIMAL(3, 2),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- PATIENTS
-- Patient-specific health profile
-- ============================================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL,

    date_of_birth DATE,

    gender VARCHAR(30),

    blood_group VARCHAR(10),

    height_cm DECIMAL(5, 2),

    weight_kg DECIMAL(5, 2),

    emergency_contact_name VARCHAR(150),

    emergency_contact_phone VARCHAR(20),

    emergency_contact_relation VARCHAR(50),

    allergies TEXT,

    chronic_conditions TEXT,

    current_medications TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_patient_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- DOCTORS
-- Doctor professional information
-- ============================================================

CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL,

    hospital_id UUID,

    specialization VARCHAR(150) NOT NULL,

    qualification VARCHAR(255),

    experience_years INTEGER DEFAULT 0,

    consultation_fee DECIMAL(10, 2),

    license_number VARCHAR(100) UNIQUE,

    bio TEXT,

    available_for_online BOOLEAN DEFAULT TRUE,

    rating DECIMAL(3, 2),

    total_consultations INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_doctor_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_doctor_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id)
        ON DELETE SET NULL,

    CONSTRAINT doctors_experience_check
        CHECK (experience_years >= 0)
);


-- ============================================================
-- APPOINTMENTS
-- Patient ↔ Doctor appointment management
-- ============================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL,

    doctor_id UUID NOT NULL,

    hospital_id UUID,

    appointment_date DATE NOT NULL,

    appointment_time TIME NOT NULL,

    appointment_type VARCHAR(30) DEFAULT 'in_person',

    reason TEXT,

    status VARCHAR(30) DEFAULT 'scheduled',

    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointment_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_appointment_hospital
        FOREIGN KEY (hospital_id)
        REFERENCES hospitals(id)
        ON DELETE SET NULL,

    CONSTRAINT appointment_type_check
        CHECK (
            appointment_type IN (
                'in_person',
                'online'
            )
        ),

    CONSTRAINT appointment_status_check
        CHECK (
            status IN (
                'scheduled',
                'confirmed',
                'completed',
                'cancelled',
                'no_show'
            )
        )
);


-- ============================================================
-- MEDICAL RECORDS
-- Patient medical history
-- ============================================================

CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL,

    doctor_id UUID,

    appointment_id UUID,

    diagnosis TEXT,

    symptoms TEXT,

    treatment TEXT,

    medical_notes TEXT,

    record_date DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_record_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_record_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_record_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(id)
        ON DELETE SET NULL
);


-- ============================================================
-- LAB REPORTS
-- Patient diagnostic/laboratory information
-- ============================================================

CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL,

    doctor_id UUID,

    test_name VARCHAR(200) NOT NULL,

    test_date DATE NOT NULL,

    result_value VARCHAR(255),

    unit VARCHAR(50),

    reference_range VARCHAR(100),

    status VARCHAR(30) DEFAULT 'normal',

    report_file_url TEXT,

    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lab_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lab_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE SET NULL,

    CONSTRAINT lab_status_check
        CHECK (
            status IN (
                'normal',
                'abnormal',
                'critical',
                'pending'
            )
        )
);


-- ============================================================
-- PRESCRIPTIONS
-- Medicines prescribed to patients
-- ============================================================

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL,

    doctor_id UUID,

    medical_record_id UUID,

    medicine_name VARCHAR(200) NOT NULL,

    dosage VARCHAR(100),

    frequency VARCHAR(100),

    duration VARCHAR(100),

    instructions TEXT,

    start_date DATE,

    end_date DATE,

    status VARCHAR(30) DEFAULT 'active',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_prescription_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_prescription_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_prescription_record
        FOREIGN KEY (medical_record_id)
        REFERENCES medical_records(id)
        ON DELETE SET NULL,

    CONSTRAINT prescription_status_check
        CHECK (
            status IN (
                'active',
                'completed',
                'cancelled'
            )
        )
);


-- ============================================================
-- HEALTH METRICS
-- Vital signs and health measurements
-- ============================================================

CREATE TABLE health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL,

    heart_rate INTEGER,

    systolic_bp INTEGER,

    diastolic_bp INTEGER,

    temperature DECIMAL(4, 1),

    oxygen_saturation DECIMAL(5, 2),

    respiratory_rate INTEGER,

    blood_glucose DECIMAL(6, 2),

    weight_kg DECIMAL(5, 2),

    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    notes TEXT,

    CONSTRAINT fk_metrics_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE
);


-- ============================================================
-- AI RECOMMENDATIONS
-- AI-generated health insights
-- ============================================================

CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    patient_id UUID NOT NULL,

    recommendation_type VARCHAR(50) NOT NULL,

    input_summary TEXT,

    recommendation TEXT NOT NULL,

    risk_level VARCHAR(30),

    confidence_score DECIMAL(5, 2),

    disclaimer TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE,

    CONSTRAINT ai_risk_level_check
        CHECK (
            risk_level IS NULL OR
            risk_level IN (
                'low',
                'moderate',
                'high',
                'critical'
            )
        )
);


-- ============================================================
-- NOTIFICATIONS
-- System and appointment notifications
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT NOT NULL,

    notification_type VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_patients_user_id
ON patients(user_id);

CREATE INDEX idx_doctors_hospital_id
ON doctors(hospital_id);

CREATE INDEX idx_doctors_specialization
ON doctors(specialization);

CREATE INDEX idx_appointments_patient_id
ON appointments(patient_id);

CREATE INDEX idx_appointments_doctor_id
ON appointments(doctor_id);

CREATE INDEX idx_appointments_date
ON appointments(appointment_date);

CREATE INDEX idx_medical_records_patient_id
ON medical_records(patient_id);

CREATE INDEX idx_lab_reports_patient_id
ON lab_reports(patient_id);

CREATE INDEX idx_prescriptions_patient_id
ON prescriptions(patient_id);

CREATE INDEX idx_health_metrics_patient_id
ON health_metrics(patient_id);

CREATE INDEX idx_ai_recommendations_patient_id
ON ai_recommendations(patient_id);

CREATE INDEX idx_notifications_user_id
ON notifications(user_id);


-- ============================================================
-- COMPLETION
-- ============================================================

SELECT
    'MedNexus AI database schema created successfully'
    AS status;