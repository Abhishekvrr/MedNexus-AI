import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

// ============================================================
// LAYOUT
// ============================================================

import DashboardLayout from "./components/layout/DashboardLayout";

// ============================================================
// AUTH
// ============================================================

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// ============================================================
// PATIENT
// ============================================================

import Dashboard from "./pages/dashboard/Dashboard";
import Appointments from "./pages/appointments/Appointments";
import Doctors from "./pages/doctors/Doctors";
import MedicalRecords from "./pages/medical-records/MedicalRecords";
import Prescriptions from "./pages/prescriptions/Prescriptions";
import PrescriptionDecoder from "./pages/prescriptions/PrescriptionDecoder";
import EmergencyPass from "./pages/emergency/EmergencyPass";
import BiometricRadar from "./pages/health-metrics/BiometricRadar";
import LabReports from "./pages/lab-reports/LabReports";
import HealthMetrics from "./pages/health-metrics/HealthMetrics";
import Family from "./pages/family/Family";
import AIAssistant from "./pages/ai/AIAssistant";
import DietPlanner from "./pages/ai/DietPlanner";
import PharmacyCart from "./pages/pharmacy/PharmacyCart";
import Notifications from "./pages/notifications/Notifications";
import Profile from "./pages/profile/Profile";

// ============================================================
// DOCTOR
// ============================================================

import DoctorDashboard from "./pages/doctors/DoctorDashboard";
import DoctorAppointments from "./pages/doctors/DoctorAppointments";
import DoctorMedicalRecords from "./pages/doctors/DoctorMedicalRecords";
import DoctorAI from "./pages/doctors/DoctorAI";
import DoctorVoiceScribe from "./pages/doctors/DoctorVoiceScribe";
import DoctorProfile from "./pages/doctors/DoctorProfile";
import DoctorPatients from "./pages/doctors/DoctorPatients";
import DoctorPrescriptions from "./pages/doctors/DoctorPrescriptions";

// ============================================================
// HELPERS
// ============================================================

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const raw = localStorage.getItem("user");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Unable to parse stored user:", error);
    return null;
  }
}

function getRole() {
  const user = getUser();

  return String(
    user?.role ||
      user?.user_role ||
      user?.type ||
      ""
  )
    .trim()
    .toLowerCase();
}

// ============================================================
// PROTECTED ROUTE
// ============================================================

function ProtectedRoute() {
  const location = useLocation();

  if (!getToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

// ============================================================
// DOCTOR ROUTE
// ============================================================

function DoctorRoute() {
  const location = useLocation();

  if (!getToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  const role = getRole();

  if (
    role &&
    role !== "doctor" &&
    role !== "admin" &&
    role !== "administrator"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}

// ============================================================
// NOT FOUND
// ============================================================

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "40px",
          borderRadius: "20px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          textAlign: "center",
          boxShadow:
            "0 10px 30px rgba(15,23,42,0.08)",
        }}
      >
        <div
          style={{
            fontSize: "52px",
            fontWeight: "900",
            color: "#2563eb",
            marginBottom: "15px",
          }}
        >
          404
        </div>

        <h1
          style={{
            margin: "0 0 10px",
            color: "#0f172a",
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            margin: 0,
            color: "#64748b",
          }}
        >
          This MedNexus page does not exist.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================================
            AUTH
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Public Paramedic First-Responder View (No Auth Required) */}
        <Route
          path="/emergency/:patientId"
          element={<EmergencyPass />}
        />

        {/* ==================================================
            PATIENT PROTECTED AREA
        ================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route element={<DashboardLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/emergency-pass"
              element={<EmergencyPass />}
            />

            <Route
              path="/prescription-decoder"
              element={<PrescriptionDecoder />}
            />

            <Route
              path="/biometric-radar"
              element={<BiometricRadar />}
            />

            <Route
              path="/appointments"
              element={<Appointments />}
            />

            <Route
              path="/doctors"
              element={<Doctors />}
            />

            <Route
              path="/medical-records"
              element={<MedicalRecords />}
            />

            <Route
              path="/prescriptions"
              element={<Prescriptions />}
            />

            <Route
              path="/lab-reports"
              element={<LabReports />}
            />

            <Route
              path="/health-metrics"
              element={<HealthMetrics />}
            />

            <Route
              path="/family"
              element={<Family />}
            />

            <Route
              path="/ai"
              element={<AIAssistant />}
            />

            <Route
              path="/diet-planner"
              element={<DietPlanner />}
            />

            <Route
              path="/pharmacy"
              element={<PharmacyCart />}
            />

            <Route
              path="/pharmacy/cart"
              element={<PharmacyCart />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

          </Route>

        </Route>

        {/* ==================================================
            DOCTOR PROTECTED AREA
        ================================================== */}

        <Route element={<DoctorRoute />}>

          <Route element={<DashboardLayout />}>

            {/* Doctor Dashboard */}
            <Route
              path="/doctor-dashboard"
              element={<DoctorDashboard />}
            />

            {/* Doctor AI Ambient Voice Scribe */}
            <Route
              path="/doctor-voice-scribe"
              element={<DoctorVoiceScribe />}
            />

            {/* Doctor Appointment Management */}
            <Route
              path="/doctor-appointments"
              element={<DoctorAppointments />}
            />

            {/* Doctor Patients */}
            <Route
              path="/doctor-patients"
              element={<DoctorPatients />}
            />

            {/* Doctor Medical Records */}
            <Route
              path="/doctor-medical-records"
              element={<DoctorMedicalRecords />}
            />

            {/* Doctor Prescriptions */}
            <Route
              path="/doctor-prescriptions"
              element={<DoctorPrescriptions />}
            />

            {/* Doctor AI */}
            <Route
              path="/doctor-ai"
              element={<DoctorAI />}
            />

            {/* Doctor Profile */}
            <Route
              path="/doctor-profile"
              element={<DoctorProfile />}
            />

          </Route>

        </Route>

        {/* ==================================================
            ROOT
        ================================================== */}

        <Route
          path="/"
          element={
            getToken() ? (
              getRole() === "doctor" ||
              getRole() === "admin" ||
              getRole() === "administrator" ? (
                <Navigate
                  to="/doctor-dashboard"
                  replace
                />
              ) : (
                <Navigate
                  to="/dashboard"
                  replace
                />
              )
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* ==================================================
            404
        ================================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;