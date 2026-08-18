# 🖥️ MedNexus AI — Frontend Client Application

<div align="center">

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Lucide](https://img.shields.io/badge/Lucide_React-Icons-F56565?style=for-the-badge&logo=feather&logoColor=white)](https://lucide.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**The modern clinical & patient frontend interface for MedNexus AI, engineered with React 19, Vite 8, and a responsive glassmorphic medical design system.**

---

</div>

## 🌟 Overview

The **MedNexus AI Frontend** is a Single Page Application (SPA) designed to provide clinicians and patients with an intuitive, fluid, and responsive user experience. It supports role-based routing, real-time clinical interaction, dynamic analytics charts, digital prescription management, and seamless AI copilot chat.

---

## 🎨 Design System & UI Architecture

- **Glassmorphism & Micro-Interactions:** Modern translucent card layers, subtle borders (`#e2e8f0`), soft shadows, and smooth hover/active transitions.
- **Accessible Color Palette:**
  - **Primary:** Medical Blue (`#2563eb`, `#1d4ed8`)
  - **Success / Completed:** Emerald Green (`#16a34a`, `#22c55e`)
  - **Warning / Pending:** Amber (`#f59e0b`, `#d97706`)
  - **Danger / Critical:** Crimson Red (`#ef4444`, `#dc2626`)
  - **Dark / Contrast:** Slate (`#0f172a`, `#1e293b`, `#64748b`)
- **Responsive Layout:** CSS Grid & Flexbox layouts optimized from 320px mobile screens to 4K ultra-wide monitors.

---

## 📱 Page & Module Hierarchy

### 🧑‍💼 Patient Modules (`/src/pages/`)
- [`dashboard/Dashboard.jsx`](src/pages/dashboard/Dashboard.jsx) — Core health summary, vitals cards, upcoming visits, health score.
- [`appointments/Appointments.jsx`](src/pages/appointments/Appointments.jsx) — Doctor search, in-person/video booking, status tracking.
- [`prescriptions/Prescriptions.jsx`](src/pages/prescriptions/Prescriptions.jsx) — Active medication regimen, dosage timers, PDF exports.
- [`medical-records/MedicalRecords.jsx`](src/pages/medical-records/MedicalRecords.jsx) — Historical encounter charts, clinical diagnoses, notes.
- [`lab-reports/LabReports.jsx`](src/pages/lab-reports/LabReports.jsx) — Diagnostic lab tests, status badges, report attachments.
- [`health-metrics/HealthMetrics.jsx`](src/pages/health-metrics/HealthMetrics.jsx) — Trend charts for BP, Glucose, Heart Rate, SpO2, and BMI.
- [`family/Family.jsx`](src/pages/family/Family.jsx) — Dependent & family member profile management.
- [`profile/Profile.jsx`](src/pages/profile/Profile.jsx) — Emergency contacts, chronic conditions, blood type, allergies.
- [`notifications/Notifications.jsx`](src/pages/notifications/Notifications.jsx) — Real-time notification center with mark-all-read.

### 👨‍⚕️ Doctor Clinical Portal (`/src/pages/doctors/`)
- [`DoctorDashboard.jsx`](src/pages/doctors/DoctorDashboard.jsx) — Live consultation queue, monthly earnings counter, patient stats.
- [`DoctorAppointments.jsx`](src/pages/doctors/DoctorAppointments.jsx) — Appointment status transitions (`Confirm`, `Complete`, `Cancel`).
- [`DoctorPrescriptions.jsx`](src/pages/doctors/DoctorPrescriptions.jsx) — Batch prescription builder with auto dosage schedules.
- [`DoctorMedicalRecords.jsx`](src/pages/doctors/DoctorMedicalRecords.jsx) — Official clinical charting & SOAP encounter logging.
- [`DoctorPatients.jsx`](src/pages/doctors/DoctorPatients.jsx) — Patient roster, history, and medical records viewer.
- [`DoctorProfile.jsx`](src/pages/doctors/DoctorProfile.jsx) — Practice settings, specialization, experience, consultation fees.
- [`DoctorAI.jsx`](src/pages/doctors/DoctorAI.jsx) — Groq AI Clinical Copilot for patient synthesis & drug interaction reviews.

---

## 📁 Source Code Organization

```
frontend/
├── public/                     # Static icons, manifest & logos
├── src/
│   ├── assets/                 # SVGs and static brand assets
│   ├── components/             # Reusable UI widgets
│   │   ├── Navigation.jsx      # Top navigation & user session bar
│   │   ├── Sidebar.jsx         # Role-aware navigation sidebar
│   │   └── ProtectedRoute.jsx  # Route authentication guard
│   ├── config/
│   │   └── api.js              # Centralized backend URL resolver
│   ├── pages/                  # Route-level views (Patient & Doctor)
│   ├── services/               # API service abstractions
│   ├── styles/                 # Global styles & design tokens
│   ├── App.jsx                 # App routing & role switcher
│   ├── index.css               # Base CSS design system
│   └── main.jsx                # React DOM mount point
├── test_coordination.js        # 16-point API coordination test suite
├── vercel.json                 # Vercel SPA rewrite rules
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies & scripts
└── .env.example                # Environment variable template
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `frontend/` directory (or use `.env.example` as a reference):

```env
# URL pointing to your backend Express server
# Local development:
VITE_API_URL=http://localhost:5000

# Production on Vercel:
# VITE_API_URL=https://your-backend-api.onrender.com
```

All API requests dynamically read this environment variable via `src/config/api.js`.

---

## 🚀 Available Scripts

In the `frontend` directory, you can run:

### `npm run dev`
Runs the application in development mode with Hot Module Replacement (HMR).  
Open **`http://localhost:5173`** to view in browser.

### `npm run build`
Bundles the application for production to the `dist/` directory. It optimizes the build for the best performance and minimal bundle size.

### `npm run preview`
Locally preview the production build after running `npm run build`.

### `node test_coordination.js`
Executes the 16-point client-server API contract and integration test suite.

---

## ☁️ Deployment on Vercel

The frontend is fully configured for zero-configuration deployment on **Vercel**:

1. Import your GitHub repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Framework Preset: `Vite` (auto-detected).
4. Add environment variable: `VITE_API_URL = https://your-backend.onrender.com`.
5. Deploy! [`vercel.json`](vercel.json) automatically handles SPA routing rewrites so sub-pages never return 404 on refresh.

---

## 📄 License

Part of the MedNexus AI platform — licensed under the [MIT License](../LICENSE).
