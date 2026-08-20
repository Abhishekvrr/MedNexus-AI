import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarCheck,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Video,
  Building2,
  Bot,
  FileText,
  Pill,
  Star,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  HeartPulse,
  Mic,
  Sparkles,
} from "lucide-react";

import API_BASE_URL from "../../config/api";

function DoctorDashboard() {
  const navigate = useNavigate();

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    total_patients: 0,
    total_appointments: 0,
    scheduled_appointments: 0,
    completed_appointments: 0,
    cancelled_appointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  // Get user from localStorage
  const storedUser = localStorage.getItem("user");
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (err) {
    console.error("Failed to parse user:", err);
  }

  const doctorName =
    user?.full_name || doctorProfile?.doctor_name || "Doctor";

  // Dynamic Greeting based on current time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", emoji: "☀️" };
    if (hour < 17) return { text: "Good Afternoon", emoji: "🌤️" };
    return { text: "Good Evening", emoji: "🌙" };
  }, []);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const loadDoctorDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Parallel data fetching for instant response
      const [apptsRes, patientsRes, statsRes, docProfileRes] =
        await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/appointments`, { headers }),
          fetch(`${API_BASE_URL}/api/doctor/patients`, { headers }),
          fetch(`${API_BASE_URL}/api/doctor/patients/stats`, { headers }),
          fetch(`${API_BASE_URL}/api/doctors/me`, { headers }),
        ]);

      // Parse Appointments
      if (apptsRes.status === "fulfilled" && apptsRes.value.ok) {
        const data = await apptsRes.value.json();
        setAppointments(data.appointments || []);
      }

      // Parse Patients
      if (patientsRes.status === "fulfilled" && patientsRes.value.ok) {
        const data = await patientsRes.value.json();
        setPatients(data.patients || []);
      }

      // Parse Stats
      if (statsRes.status === "fulfilled" && statsRes.value.ok) {
        const data = await statsRes.value.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }

      // Parse Doctor Profile
      if (docProfileRes.status === "fulfilled" && docProfileRes.value.ok) {
        const data = await docProfileRes.value.json();
        if (data.doctor) {
          setDoctorProfile(data.doctor);
        }
      }
    } catch (err) {
      console.error("Doctor Dashboard error:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorDashboardData();
  }, []);

  // Filter today's & upcoming appointments
  const upcomingAppointments = useMemo(() => {
    return appointments.slice(0, 5);
  }, [appointments]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}/${newStatus}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        // Refresh dashboard data
        loadDoctorDashboardData();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleAiSearch = (e) => {
    e.preventDefault();
    if (aiPrompt.trim()) {
      navigate(`/doctor-ai?query=${encodeURIComponent(aiPrompt.trim())}`);
    } else {
      navigate("/doctor-ai");
    }
  };

  return (
    <div className="doc-dash-container">
      {/* INLINE STYLES FOR ISOLATED, BULLETPROOF DESIGN */}
      <style>{`
        .doc-dash-container {
          width: 100%;
          min-height: 100%;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          box-sizing: border-box;
        }

        .doc-dash-header {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
          border-radius: 20px;
          padding: 32px 36px;
          color: #ffffff;
          margin-bottom: 28px;
          box-shadow: 0 12px 30px -10px rgba(37, 99, 235, 0.35);
          position: relative;
          overflow: hidden;
        }

        .doc-dash-header::after {
          content: "";
          position: absolute;
          top: -40px;
          right: -40px;
          width: 240px;
          height: 240px;
          background: radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .doc-dash-header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .doc-greeting-title {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .doc-greeting-sub {
          font-size: 15px;
          color: #e0e7ff;
          margin: 0;
          line-height: 1.5;
        }

        .doc-badge-group {
          display: flex;
          gap: 10px;
          margin-top: 18px;
          flex-wrap: wrap;
        }

        .doc-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 30px;
          font-size: 13px;
          font-weight: 500;
          color: #ffffff;
        }

        .doc-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.18);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .doc-refresh-btn:hover {
          background: rgba(255, 255, 255, 0.28);
          transform: translateY(-1px);
        }

        .doc-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* METRIC CARDS */
        .doc-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .doc-metric-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 22px 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .doc-metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px -4px rgba(15, 23, 42, 0.08);
        }

        .doc-metric-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .doc-icon-blue { background: #eff6ff; color: #2563eb; }
        .doc-icon-green { background: #ecfdf5; color: #059669; }
        .doc-icon-purple { background: #f5f3ff; color: #7c3aed; }
        .doc-icon-amber { background: #fffbeb; color: #d97706; }

        .doc-metric-num {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 4px;
        }

        .doc-metric-label {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
        }

        /* MAIN CONTENT LAYOUT */
        .doc-main-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 28px;
        }

        @media (max-width: 1024px) {
          .doc-main-grid {
            grid-template-columns: 1fr;
          }
        }

        .doc-section-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 26px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.04);
          margin-bottom: 24px;
        }

        .doc-card-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .doc-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .doc-view-all-link {
          font-size: 13px;
          font-weight: 600;
          color: #2563eb;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: gap 0.2s ease;
        }

        .doc-view-all-link:hover {
          gap: 7px;
        }

        /* APPOINTMENTS LIST */
        .doc-appt-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          margin-bottom: 12px;
          background: #f8fafc;
          transition: all 0.2s ease;
          flex-wrap: wrap;
          gap: 12px;
        }

        .doc-appt-item:hover {
          background: #ffffff;
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }

        .doc-appt-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .doc-patient-avatar {
          width: 44px;
          height: 44px;
          background: #e2e8f0;
          color: #1e293b;
          font-weight: 700;
          font-size: 15px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .doc-patient-name {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 3px;
        }

        .doc-patient-meta {
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .doc-appt-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-scheduled { background: #dbeafe; color: #1d4ed8; }
        .status-confirmed { background: #dcfce7; color: #15803d; }
        .status-completed { background: #f3e8ff; color: #7e22ce; }
        .status-cancelled { background: #ffe4e6; color: #be123c; }

        .doc-btn-sm {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .doc-btn-confirm { background: #059669; color: #ffffff; }
        .doc-btn-confirm:hover { background: #047857; }

        .doc-btn-complete { background: #2563eb; color: #ffffff; }
        .doc-btn-complete:hover { background: #1d4ed8; }

        /* AI COPILOT CARD */
        .doc-ai-box {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          border-radius: 20px;
          padding: 26px;
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }

        .doc-ai-input-wrap {
          display: flex;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 6px 6px 6px 14px;
          margin-top: 14px;
          align-items: center;
        }

        .doc-ai-input {
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 14px;
          flex: 1;
        }

        .doc-ai-input::placeholder {
          color: #94a3b8;
        }

        .doc-ai-submit {
          background: #3b82f6;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        /* PROFILE CARD RIGHT */
        .doc-side-profile {
          text-align: center;
          padding: 20px 0;
        }

        .doc-profile-avatar-lg {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #ffffff;
          font-size: 28px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
          border: 4px solid #eff6ff;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
        }

        .doc-quick-link-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 8px;
          color: #1e293b;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .doc-quick-link-btn:hover {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #2563eb;
          transform: translateX(3px);
        }
      `}</style>

      {/* HEADER / WISH THE DOCTOR */}
      <header className="doc-dash-header">
        <div className="doc-dash-header-top">
          <div>
            <h1 className="doc-greeting-title">
              <span>{greeting.emoji}</span>
              <span>{greeting.text}, {doctorName}!</span>
            </h1>
            <p className="doc-greeting-sub">
              Welcome back to your MedNexus AI clinical command center. Today is <strong>{todayFormatted}</strong>.
            </p>

            <div className="doc-badge-group">
              <span className="doc-header-badge">
                <ShieldCheck size={14} />
                {doctorProfile?.specialization || "General Physician / Specialist"}
              </span>
              <span className="doc-header-badge">
                <Building2 size={14} />
                {doctorProfile?.hospital_name || "Apollo Super Speciality Hospital"}
              </span>
              <span className="doc-header-badge" style={{ background: "rgba(16, 185, 129, 0.25)" }}>
                ● Active on Duty
              </span>
            </div>
          </div>

          <button
            className="doc-refresh-btn"
            onClick={loadDoctorDashboardData}
            disabled={loading}
            title="Refresh dashboard"
          >
            <RefreshCw size={16} className={loading ? "doc-spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </header>

      {/* ERROR ALERT */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #f87171",
            color: "#991b1b",
            padding: "14px 18px",
            borderRadius: "12px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* METRIC SUMMARY CARDS */}
      <div className="doc-metrics-grid">
        <div className="doc-metric-card">
          <div className="doc-metric-icon-box doc-icon-blue">
            <Users size={26} />
          </div>
          <div>
            <div className="doc-metric-num">
              {stats.total_patients || patients.length || 0}
            </div>
            <div className="doc-metric-label">Assigned Patients</div>
          </div>
        </div>

        <div className="doc-metric-card">
          <div className="doc-metric-icon-box doc-icon-amber">
            <CalendarCheck size={26} />
          </div>
          <div>
            <div className="doc-metric-num">
              {appointments.filter(a => a.status === "scheduled").length}
            </div>
            <div className="doc-metric-label">Scheduled Visits</div>
          </div>
        </div>

        <div className="doc-metric-card">
          <div className="doc-metric-icon-box doc-icon-green">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="doc-metric-num">
              {appointments.filter(a => a.status === "confirmed").length}
            </div>
            <div className="doc-metric-label">Confirmed Consultations</div>
          </div>
        </div>

        <div className="doc-metric-card">
          <div className="doc-metric-icon-box doc-icon-purple">
            <Activity size={26} />
          </div>
          <div>
            <div className="doc-metric-num">
              {appointments.filter(a => a.status === "completed").length}
            </div>
            <div className="doc-metric-label">Completed Sessions</div>
          </div>
        </div>
      </div>

      {/* AMBIENT CLINICAL VOICE SCRIBE BANNER */}
      <div
        style={{
          background: "#f5f3ff",
          border: "1px solid #ddd6fe",
          borderRadius: "16px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
          boxShadow: "0 2px 10px rgba(124, 58, 237, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "14px",
              background: "#ede9fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Mic size={26} color="#7c3aed" />
          </div>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "800", marginBottom: "4px" }}>
              <Sparkles size={12} />
              NEW: REAL-TIME AMBIENT SCRIBE
            </div>
            <div style={{ fontSize: "17px", fontWeight: "800", color: "#1e1b4b" }}>Live Doctor-Patient Consultation Voice Scribe</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Auto-convert spoken dialogue into structured SOAP clinical notes and auto-sync prescriptions.</div>
          </div>
        </div>

        <Link
          to="/doctor-voice-scribe"
          style={{
            background: "#7c3aed",
            color: "white",
            textDecoration: "none",
            padding: "12px 22px",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
          }}
        >
          <Mic size={16} />
          Launch Live Scribe
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="doc-main-grid">
        {/* LEFT COLUMN */}
        <div>
          {/* APPOINTMENTS QUEUE */}
          <div className="doc-section-card">
            <div className="doc-card-title-row">
              <h2 className="doc-card-title">
                <CalendarCheck size={20} color="#2563eb" />
                Upcoming Consultation Schedule
              </h2>
              <Link to="/doctor-appointments" className="doc-view-all-link">
                <span>Manage All ({appointments.length})</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "36px 20px",
                  color: "#64748b",
                }}
              >
                <CalendarCheck size={36} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No appointments currently in queue</p>
                <p style={{ fontSize: "13px", margin: "4px 0 0" }}>
                  New bookings by patients will automatically show up here.
                </p>
              </div>
            ) : (
              <div>
                {upcomingAppointments.map((appt) => {
                  const status = String(appt.status || "scheduled").toLowerCase();
                  const initials = String(appt.patient_name || "P")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const isOnline = appt.appointment_type === "online";

                  return (
                    <div key={appt.id} className="doc-appt-item">
                      <div className="doc-appt-left">
                        <div className="doc-patient-avatar">{initials}</div>
                        <div>
                          <div className="doc-patient-name">
                            {appt.patient_name || "Patient"}
                          </div>
                          <div className="doc-patient-meta">
                            <span>
                              <Clock size={12} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                              {String(appt.appointment_date).slice(0, 10)} @ {String(appt.appointment_time).slice(0, 5)}
                            </span>
                            <span>•</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                              {isOnline ? <Video size={12} /> : <Building2 size={12} />}
                              {isOnline ? "Online Video" : "Clinic In-person"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="doc-appt-actions">
                        <span className={`status-pill status-${status}`}>
                          {status}
                        </span>

                        {status !== "confirmed" && status !== "completed" && (
                          <button
                            className="doc-btn-sm doc-btn-confirm"
                            onClick={() => handleUpdateStatus(appt.id, "confirm")}
                            title="Confirm appointment"
                          >
                            Confirm
                          </button>
                        )}

                        {status !== "completed" && (
                          <button
                            className="doc-btn-sm doc-btn-complete"
                            onClick={() => handleUpdateStatus(appt.id, "complete")}
                            title="Mark as completed"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI CLINICAL COPILOT SEARCH */}
          <div className="doc-ai-box">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{ background: "#3b82f6", padding: "6px", borderRadius: "8px" }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>
                MedNexus Clinical AI Copilot
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.5 }}>
              Ask clinical questions, review drug-to-drug interactions, or request diagnostic differential suggestions grounded in medical reference databases.
            </p>

            <form onSubmit={handleAiSearch} className="doc-ai-input-wrap">
              <input
                type="text"
                placeholder="Ask clinical assistant (e.g. 'Dosage adjustment for Metformin in stage 3 CKD')..."
                className="doc-ai-input"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button type="submit" className="doc-ai-submit">
                Analyze
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* DOCTOR PROFILE SUMMARY */}
          <div className="doc-section-card">
            <div className="doc-side-profile">
              <div className="doc-profile-avatar-lg">
                {doctorName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                {doctorName}
              </h3>
              <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#2563eb", fontWeight: 600 }}>
                {doctorProfile?.specialization || "Cardiology Specialist"}
              </p>

              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "12px",
                  fontSize: "12px",
                  color: "#64748b",
                  textAlign: "left",
                  lineHeight: 1.6,
                }}
              >
                <div><strong>Qualification:</strong> {doctorProfile?.qualification || "MBBS, MD"}</div>
                <div><strong>Experience:</strong> {doctorProfile?.experience_years || 8}+ Years</div>
                <div><strong>Rating:</strong> ⭐ {doctorProfile?.rating || "4.9"} / 5.0</div>
              </div>
            </div>
          </div>

          {/* QUICK CLINICAL SHORTCUTS */}
          <div className="doc-section-card">
            <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
              Clinical Shortcuts
            </h3>

            <Link to="/doctor-appointments" className="doc-quick-link-btn">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarCheck size={16} color="#2563eb" />
                Manage Appointments
              </span>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>

            <Link to="/doctor-patients" className="doc-quick-link-btn">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={16} color="#059669" />
                Patient Directory
              </span>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>

            <Link to="/doctor-prescriptions" className="doc-quick-link-btn">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Pill size={16} color="#7c3aed" />
                Write Prescriptions
              </span>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>

            <Link to="/doctor-medical-records" className="doc-quick-link-btn">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={16} color="#d97706" />
                Medical Records
              </span>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>

            <Link to="/doctor-ai" className="doc-quick-link-btn">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bot size={16} color="#ec4899" />
                Clinical Decision Support
              </span>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
