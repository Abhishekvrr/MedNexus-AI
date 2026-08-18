# 🩺 MedNexus AI — Next-Generation Healthcare Intelligence & Clinical Platform

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express.js](https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-LPU_Inference-F05A28?style=for-the-badge&logo=openai&logoColor=white)](https://groq.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deploy_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Tests](https://img.shields.io/badge/Tests-100%25_Passing-brightgreen?style=for-the-badge&logo=checkmarx&logoColor=white)](#-test-suites--quality-assurance)

**An enterprise-grade, full-stack healthcare operating system connecting patients, clinicians, and intelligent AI copilots for seamless clinical workflows, medical records charting, and instant diagnostic triage.**

[Live Demo](#-deployment-guide) • [Architecture](#-system-architecture) • [Features](#-core-features) • [API Documentation](#-api-endpoints-reference) • [Getting Started](#-getting-started) • [Deployment](#-deployment-guide)

---

</div>

## 🌟 Executive Summary

**MedNexus AI** is a state-of-the-art digital health platform engineered to bridge the gap between patient care and clinical practice. Built with a responsive, high-performance **React + Vite** frontend and an enterprise **Node.js Express + PostgreSQL** backend, MedNexus AI integrates **Groq Ultra-Low Latency AI** to deliver real-time clinical intelligence, prescription safety verification, automated symptom triage, and medical record synchronization.

---

## 🏛️ System Architecture

```mermaid
graph TB
    subgraph Client Layer ["🖥️ Frontend Client Layer (React 19 + Vite 8)"]
        A[Patient Portal] 
        B[Doctor Clinical Portal]
        C[AI Symptom & Copilot Chat]
    end

    subgraph Security Layer ["🛡️ Security & Routing Layer"]
        D[JWT Authentication & Role Guards]
        E[Helmet HTTP Headers & CORS]
    end

    subgraph API Layer ["⚡ Backend Services (Node.js Express 5.1)"]
        F[Auth Service]
        G[Appointment Engine]
        H[Clinical Records Service]
        I[Prescription Composer]
        J[Doctor Analytics Service]
        K[AI Orchestration Engine]
    end

    subgraph Intelligence Layer ["🧠 AI Inference (Groq SDK)"]
        L[Patient Triage Model]
        M[Doctor AI Clinical Copilot]
        N[Drug Interaction & Safety Engine]
    end

    subgraph Data Layer ["🗄️ Persistence (PostgreSQL Cloud / Local)"]
        O[(PostgreSQL Relational DB)]
        P[UUID Primary Keys & Constraints]
        Q[Audit Triggers & Timestamps]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F & G & H & I & J & K
    K <--> L & M & N
    F & G & H & I & J --> O
    O --- P & Q
```

---

## 🚀 Core Features

### 👨‍⚕️ 1. Doctor Clinical Portal & Practice Management
- **Interactive Doctor Dashboard:** Real-time patient queues, completed visit counters, today's schedule, and instant monthly consultation earnings calculation.
- **Appointment Lifecycle Management:** Full transition control: `Scheduled` ➔ `Confirmed` ➔ `Completed` / `Cancelled`.
- **Multi-Medicine Prescription Composer:** Fast batch prescription builder supporting custom dosages, frequencies (`1-0-1`, `SOS`), durations, and intake instructions.
- **Longitudinal Patient Records & History:** Direct access to patient vitals, chronic illnesses, active medications, allergy history, and previous encounter logs.
- **Encounter Documentation:** Structured clinical notes recording Chief Complaints, Subjective Symptoms, Objective Examination, Diagnosis, and Treatment Regimens.
- **Doctor Profile & Revenue Analytics:** Clinical profile setup (specializations, qualifications, experience, license number, consultation fee) with lifetime revenue reporting.

### 🤖 2. Doctor AI Clinical Copilot (Groq-Powered)
- **Instant Patient Synthesis:** Aggregates a patient's complete history into an actionable executive summary with a single clinical prompt.
- **Drug-Drug Interaction & Allergy Checks:** Real-time contraindication screening across active patient medications and new prescriptions.
- **Clinical Decision Support:** Context-aware differential diagnosis guidance and evidence-based treatment suggestions.

### 🧑‍💼 3. Patient Health Hub & Telemedicine
- **Personalized Health Dashboard:** Comprehensive health metrics summary, recent prescriptions, upcoming visits, and health scoring.
- **Online & In-Person Appointment Booking:** Search doctor directory by specialization, experience, fees, and book consultation slots.
- **Digital Prescription Wallet:** Access active and historical prescriptions with prescribing doctor credentials, dosage schedules, and instructions.
- **Medical Chart & Encounter History:** Access official medical records, clinical notes, and diagnosis reports issued by healthcare providers.
- **Vital Signs & Health Metrics Tracker:** Log and visualize Blood Pressure, Blood Glucose, Heart Rate, Oxygen Saturation (SpO2), and BMI over time.
- **Lab Reports Portal:** Upload, inspect, and track laboratory test results with status badges (`Normal`, `Abnormal`, `Pending`).
- **Family Health Profiles:** Manage medical profiles for family dependents from a unified dashboard.
- **AI Symptom Checker:** Natural language symptom intake providing instant triage guidance, urgency classification, and specialist recommendations.
- **Notifications & Reminders:** Automatic alerts for appointment status updates, medication reminders, and health notifications.

---

## 💻 Technology Stack

### Frontend
| Technology | Description |
| :--- | :--- |
| **React 19** | Declarative component architecture with modern Hooks |
| **Vite 8.2** | Next-generation frontend tooling and instant HMR |
| **Lucide React** | Cohesive, accessible medical and system iconography |
| **Custom CSS Design System** | Glassmorphism, fluid responsive layouts, CSS tokens, dark/light clinical UI |
| **Vercel Routing** | Pre-configured `vercel.json` SPA rewrite rules |

### Backend
| Technology | Description |
| :--- | :--- |
| **Node.js (ES Modules)** | Asynchronous event-driven JavaScript runtime |
| **Express.js 5.1** | Robust RESTful routing and middleware pipeline |
| **PostgreSQL (pg)** | Relational database with pooled connections and SSL auto-negotiation |
| **JWT & Bcrypt.js** | Stateless authentication, session tokens, and cryptographic password hashing |
| **Helmet & CORS** | HTTP security headers and environment-controlled origin allowlists |
| **Groq SDK** | Enterprise AI inference engine using low-latency LPU architecture |

---

## 📂 Repository Structure

```
MedNexus-AI/
├── DEPLOYMENT_GUIDE.md           # 🚀 5-minute production deployment walkthrough
├── test_real_user_lifecycle.js   # 🧪 Full end-to-end production simulation test suite
├── backend/                      # ⚡ Node.js Express REST API
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies and scripts
│   ├── test_diagnostic.js        # 18-point comprehensive backend API test suite
│   ├── database/
│   │   └── schema.sql            # Complete PostgreSQL schema (tables, triggers, keys)
│   └── src/
│       ├── server.js             # Express application initialization & middleware
│       ├── ai/
│       │   └── groqService.js    # Groq AI SDK integration & clinical prompts
│       ├── config/
│       │   └── database.js       # PostgreSQL client pool & cloud SSL configuration
│       ├── controllers/          # Business logic handlers (Auth, Doctors, AI, etc.)
│       ├── middleware/           # Auth guards & role-based access control
│       └── routes/               # Express API endpoints
└── frontend/                     # 🖥️ React + Vite Client Application
    ├── .env.example              # Frontend environment variables template
    ├── vercel.json               # Vercel deployment & SPA routing rewrites
    ├── package.json              # Frontend dependencies and build scripts
    ├── test_coordination.js      # 16-point frontend-backend coordination test suite
    ├── vite.config.js            # Vite bundler configuration
    ├── public/                   # Static assets & icons
    └── src/
        ├── App.jsx               # Main application router & role switcher
        ├── main.jsx              # Application DOM entrypoint
        ├── config/
        │   └── api.js            # Dynamic API base URL resolver
        ├── components/           # Shared UI components (Nav, Sidebar, Header, etc.)
        ├── pages/
        │   ├── auth/             # Login & Registration views
        │   ├── dashboard/        # Patient Dashboard
        │   ├── doctors/          # Doctor Portal (Dashboard, AI, Patients, Rx, etc.)
        │   ├── appointments/     # Appointment Booking & Management
        │   ├── prescriptions/    # Patient Prescription Wallet
        │   ├── medical-records/  # Medical Encounter Charting
        │   ├── lab-reports/      # Lab Report Manager
        │   ├── health-metrics/   # Vital Signs Tracker
        │   ├── family/           # Family Members Manager
        │   ├── notifications/    # Real-Time Notifications
        │   └── profile/          # Patient Profile & Settings
        └── services/             # API HTTP client integration services
```

---

## 🗄️ Database Schema & Entity Relationships

MedNexus AI uses a relational schema with UUID primary keys and foreign key constraints:

```mermaid
erDiagram
    USERS ||--o| PATIENTS : "profile for"
    USERS ||--o| DOCTORS : "profile for"
    USERS ||--o{ NOTIFICATIONS : "receives"
    PATIENTS ||--o{ APPOINTMENTS : "books"
    DOCTORS ||--o{ APPOINTMENTS : "attends"
    APPOINTMENTS ||--o{ PRESCRIPTIONS : "results in"
    APPOINTMENTS ||--o{ MEDICAL_RECORDS : "documents"
    PATIENTS ||--o{ PRESCRIPTIONS : "prescribed to"
    DOCTORS ||--o{ PRESCRIPTIONS : "issued by"
    PATIENTS ||--o{ MEDICAL_RECORDS : "chart of"
    DOCTORS ||--o{ MEDICAL_RECORDS : "authored by"
    PATIENTS ||--o{ LAB_REPORTS : "contains"
    PATIENTS ||--o{ HEALTH_METRICS : "tracks"
    PATIENTS ||--o{ FAMILY_MEMBERS : "manages"
    PATIENTS ||--o{ AI_RECOMMENDATIONS : "receives"
```

### Table Definitions
- **`users`**: Core authentication, role (`patient`, `doctor`, `admin`), hashed credentials, active status.
- **`patients`**: Demographics, blood group, allergies, chronic conditions, emergency contacts.
- **`doctors`**: Specialization, qualifications, experience, consultation fees, license number, practice bio.
- **`appointments`**: Date, time slot, consultation type (`in_person`, `video`), status (`scheduled`, `confirmed`, `completed`, `cancelled`), symptoms, doctor notes.
- **`prescriptions`**: Diagnosis, medicine name, dosage, frequency (`1-0-1`, `1-0-0`, `SOS`), duration, intake instructions.
- **`medical_records`**: Diagnosis, subjective symptoms, objective exam, treatment plan, clinical notes.
- **`lab_reports`**: Test name, lab facility, status (`Normal`, `Abnormal`, `Pending`), attachments.
- **`health_metrics`**: Metric type (`Blood Pressure`, `Blood Sugar`, `Heart Rate`, `SpO2`, `BMI`), values, recorded timestamp.
- **`notifications`**: User alerts, unread/read states, contextual redirect URLs.

---

## ⚡ API Endpoints Reference

### Authentication & Profiles
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new Patient or Doctor account | No |
| `POST` | `/api/auth/login` | Authenticate and receive JWT session token | No |
| `GET` | `/api/patients/profile` | Retrieve logged-in patient health profile | Yes (Patient) |
| `PUT` | `/api/patients/profile` | Update patient vitals, allergies & emergency info | Yes (Patient) |
| `GET` | `/api/doctors/me` | Retrieve doctor profile and real-time revenue stats | Yes (Doctor) |
| `PUT` | `/api/doctors/me` | Update doctor credentials, fees & bio | Yes (Doctor) |
| `GET` | `/api/doctors` | List all verified doctors for booking | Yes |

### Appointments & Clinical Encounters
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/appointments` | Get appointments for active user (Doctor/Patient) | Yes |
| `POST` | `/api/appointments` | Book new consultation appointment | Yes (Patient) |
| `PUT` | `/api/appointments/:id/confirm` | Doctor confirms appointment request | Yes (Doctor) |
| `PUT` | `/api/appointments/:id/complete` | Doctor marks consultation visit completed | Yes (Doctor) |
| `PUT` | `/api/appointments/:id/cancel` | Cancel consultation appointment | Yes |

### Prescriptions & Medical Records
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/prescriptions` | Retrieve patient prescriptions | Yes (Patient) |
| `GET` | `/api/prescriptions/doctor` | Retrieve all prescriptions issued by doctor | Yes (Doctor) |
| `POST` | `/api/prescriptions/batch` | Batch issue multi-medicine prescription | Yes (Doctor) |
| `GET` | `/api/medical-records` | Retrieve patient medical records history | Yes (Patient) |
| `POST` | `/api/medical-records/doctor` | Log official clinical encounter record | Yes (Doctor) |
| `GET` | `/api/medical-records/patient/:id` | Doctor access to specific patient's chart | Yes (Doctor) |

### AI Clinical Intelligence
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ai/analyze` | Patient Symptom Checker & Triage Classification | Yes |
| `POST` | `/api/ai/doctor-chat` | Doctor AI Clinical Copilot & Safety Review | Yes (Doctor) |

---

## 🧪 Test Suites & Quality Assurance

MedNexus AI includes **44+ automated tests** verifying every layer of the platform with **100% pass rate**:

```
================================================================================
🩺 REAL-WORLD PRODUCTION SIMULATION TEST: NEW DOCTOR & NEW PATIENT LIFECYCLE
================================================================================
[STEP 1] Register New Doctor & Clinical Practice Profile          ✅ PASS
[STEP 2] Register New Patient & Medical History Profile           ✅ PASS
[STEP 3] Patient Books In-Person Consultation Appointment        ✅ PASS
[STEP 4] Doctor Reviews & Confirms Appointment                    ✅ PASS
[STEP 5] Doctor Issues Multi-Medicine Batch Prescription          ✅ PASS
[STEP 6] Doctor Logs Encounter Record & Completes Visit           ✅ PASS
[STEP 7] Doctor AI Copilot Analyzes Real Patient Context          ✅ PASS
[STEP 8] Verify Real-Time Earnings (₹1,200/visit calculated)     ✅ PASS
[STEP 9] Patient Logs in & Verifies Active Prescriptions & Chart ✅ PASS

==================================================
DIAGNOSTIC SUMMARY: 18 Passed, 0 Failed (100% PASS)
COORDINATION SUMMARY: 16 Passed, 0 Failed (100% PASS)
PRODUCTION BUILD: Vite 8.2 Production Bundle (1.04s)
==================================================
```

### Running Tests Locally
```bash
# 1. Run Complete Backend Diagnostic Suite
cd backend
node test_diagnostic.js

# 2. Run Frontend <-> Backend Coordination Suite
cd ../frontend
node test_coordination.js

# 3. Run Real-World End-to-End Production Simulation
cd ..
node test_real_user_lifecycle.js
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **PostgreSQL**: v15.x or higher (or a free cloud database on [Neon.tech](https://neon.tech))
- **Groq API Key**: (Free at [console.groq.com](https://console.groq.com))

### 1. Clone Repository
```bash
git clone https://github.com/Abhishekvrr/MedNexus-AI.git
cd MedNexus-AI
```

### 2. Configure Backend
```bash
cd backend
npm install

# Create .env from template
cp .env.example .env
```
Edit `backend/.env` with your credentials:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/mednexus
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
```

### 3. Initialize Database Schema
```bash
# In PostgreSQL terminal or pgAdmin:
psql -U postgres -d mednexus -f database/schema.sql
```

### 4. Configure Frontend
```bash
cd ../frontend
npm install

# Create .env from template
cp .env.example .env
```
Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 5. Start Development Servers
```bash
# Start Backend (from /backend directory)
npm run dev

# Start Frontend (from /frontend directory in another terminal)
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🚀 Deployment Guide

MedNexus AI is pre-configured for instant cloud deployment:

- **Frontend:** [Vercel](https://vercel.com) (React/Vite with automatic SPA rewrites)
- **Backend:** [Render.com](https://render.com) or [Railway](https://railway.app) (Node.js Express)
- **Database:** [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com) (Serverless Cloud PostgreSQL)

👉 **For the complete 5-minute step-by-step deployment guide, see [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md).**

---

## 🔒 Security & Compliance Design

- **Stateless JWT Tokens:** Cryptographically signed session tokens with role validation.
- **Argon2 / Bcrypt Hashing:** Industry-standard password salt-and-hash encryption.
- **SQL Injection Prevention:** 100% parameterized SQL queries via `pg` pool.
- **Cross-Origin Resource Sharing (CORS):** Strict domain origin white-listing.
- **HTTP Header Hardening:** `Helmet` integration preventing XSS, clickjacking, and MIME-sniffing.
- **SSL-Encrypted Transport:** Automatic SSL negotiation for cloud database connections.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for Modern Healthcare & AI Innovation**

*Empowering clinicians with intelligence. Giving patients clarity and control.*

</div>
