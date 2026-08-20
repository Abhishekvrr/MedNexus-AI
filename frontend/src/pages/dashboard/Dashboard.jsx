import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartPulse,
  Activity,
  Droplets,
  Thermometer,
  Wind,
  Weight,
  FileText,
  CalendarDays,
  Pill,
  RefreshCw,
  AlertCircle,
  UserRound,
  Clock3,
  MapPin,
  ShieldAlert,
  Sparkles,
  Volume2,
  ShoppingBag,
  Salad,
} from "lucide-react";

import API_BASE_URL from "../../config/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to continue.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load dashboard."
        );
      }

      setDashboard(data.dashboard);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(
        err.message || "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const patient = dashboard?.patient;
  const health = dashboard?.latest_health_metrics;
  const records = dashboard?.recent_medical_records || [];
  const prescriptions =
    dashboard?.active_prescriptions || [];
  const appointments =
    dashboard?.upcoming_appointments || [];
  const labs = dashboard?.recent_lab_reports || [];
  const aiRecommendation =
    dashboard?.latest_ai_recommendation;

  return (
    <section
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="dashboard-eyebrow">
            MEDNEXUS AI
          </span>

          <h1
            style={{
              margin: "6px 0 6px",
              fontSize: "32px",
              lineHeight: "1.15",
              color: "#0f172a",
            }}
          >
            Welcome, {patient?.full_name || "Patient"}
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Monitor your health and medical activity
            in one secure place.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={loadDashboard}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#eff6ff",
            color: "#2563eb",
            border: "1px solid #dbeafe",
            padding: "10px 14px",
            borderRadius: "10px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          <RefreshCw
            size={16}
            style={{
              animation: loading
                ? "mednexus-dashboard-spin 1s linear infinite"
                : "none",
            }}
          />
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            marginTop: "20px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div
          className="dashboard-card"
          style={{
            marginTop: "24px",
            padding: "50px 20px",
            textAlign: "center",
          }}
        >
          <RefreshCw
            size={30}
            style={{
              color: "#2563eb",
              animation:
                "mednexus-dashboard-spin 1s linear infinite",
            }}
          />

          <p
            style={{
              marginTop: "12px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Loading your health dashboard...
          </p>
        </div>
      )}

      {/* DASHBOARD */}
      {!loading && dashboard && (
        <>
          {/* UNIQUE MARKET INNOVATIONS QUICK HUB */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "14px",
              marginTop: "20px",
            }}
          >
            {/* EMERGENCY PASS CARD */}
            <Link
              to="/emergency-pass"
              style={{
                textDecoration: "none",
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                borderRadius: "14px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 2px 8px rgba(225,29,72,0.06)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#ffe4e6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldAlert size={22} color="#e11d48" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#9f1239" }}>🚨 Emergency "Beacon" QR Pass</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>First-responder scannable card & 1-tap SOS</div>
              </div>
            </Link>

            {/* AI PRESCRIPTION DECODER CARD */}
            <Link
              to="/prescription-decoder"
              style={{
                textDecoration: "none",
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                borderRadius: "14px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 2px 8px rgba(79,70,229,0.06)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Volume2 size={22} color="#4f46e5" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#3730a3" }}>🎙️ AI Rx Decoder & Voice</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Multilingual spoken dosage explainer</div>
              </div>
            </Link>

            {/* BIOMETRIC RADAR CARD */}
            <Link
              to="/biometric-radar"
              style={{
                textDecoration: "none",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: "14px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 2px 8px rgba(5,150,105,0.06)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Activity size={22} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#065f46" }}>🫀 Biometric Organ 5Y Radar</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Interactive organ stress & risk simulator</div>
              </div>
            </Link>

            {/* APOLLO PHARMACY DELIVERY CARD */}
            <Link
              to="/pharmacy"
              style={{
                textDecoration: "none",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "14px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 2px 8px rgba(22,163,74,0.06)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShoppingBag size={22} color="#16a34a" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#166534" }}>🛒 Apollo Pharmacy Delivery</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>1-Click prescription medicine order & tracking</div>
              </div>
            </Link>

            {/* DIET & NUTRITION PLANNER CARD */}
            <Link
              to="/diet-planner"
              style={{
                textDecoration: "none",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "14px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 2px 8px rgba(217,119,6,0.06)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Salad size={22} color="#d97706" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#92400e" }}>🥗 Disease Food & Nutrition Diet</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>AI personalized meals, foods to eat & avoid</div>
              </div>
            </Link>
          </div>

          {/* TOP SECTION */}
          <div
            className="dashboard-top-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(230px, 0.8fr) minmax(0, 2fr) minmax(230px, 0.8fr)",
              gap: "16px",
              marginTop: "20px",
              alignItems: "stretch",
              width: "100%",
              minWidth: 0,
            }}
          >
            {/* PATIENT PROFILE */}
            <div className="dashboard-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div className="profile-avatar">
                  <UserRound size={22} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      color: "#0f172a",
                    }}
                  >
                    {patient?.full_name ||
                      "Patient"}
                  </h3>

                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#94a3b8",
                      fontSize: "11px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {patient?.email || ""}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <ProfileItem
                  label="Gender"
                  value={
                    patient?.gender || "Not provided"
                  }
                />

                <ProfileItem
                  label="Blood Group"
                  value={
                    patient?.blood_group ||
                    "Not provided"
                  }
                />

                <ProfileItem
                  label="Height"
                  value={
                    patient?.height_cm
                      ? `${patient.height_cm} cm`
                      : "Not recorded"
                  }
                />

                <ProfileItem
                  label="Weight"
                  value={
                    patient?.weight_kg
                      ? `${patient.weight_kg} kg`
                      : "Not recorded"
                  }
                />
              </div>
            </div>

            {/* HEALTH METRICS */}
            <div
              className="metrics-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: "16px",
                minWidth: 0,
              }}
            >
              <MetricCard
                icon={<HeartPulse size={20} />}
                title="Heart Rate"
                value={
                  health?.heart_rate ?? "--"
                }
                unit="bpm"
              />

              <MetricCard
                icon={<Activity size={20} />}
                title="Blood Pressure"
                value={
                  health?.systolic_bp != null
                    ? `${health.systolic_bp}/${health.diastolic_bp}`
                    : "--"
                }
                unit="mmHg"
              />

              <MetricCard
                icon={<Droplets size={20} />}
                title="Oxygen"
                value={
                  health?.oxygen_saturation ?? "--"
                }
                unit="%"
              />

              <MetricCard
                icon={<Thermometer size={20} />}
                title="Temperature"
                value={
                  health?.temperature ?? "--"
                }
                unit="°C"
              />

              <MetricCard
                icon={<Wind size={20} />}
                title="Respiratory Rate"
                value={
                  health?.respiratory_rate ?? "--"
                }
                unit="breaths/min"
              />

              <MetricCard
                icon={<Weight size={20} />}
                title="Weight"
                value={
                  health?.weight_kg ?? "--"
                }
                unit="kg"
              />
            </div>

            {/* HEALTH SUMMARY */}
            <div className="dashboard-card">
              <h3
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "18px",
                }}
              >
                Health Summary
              </h3>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                Latest recorded measurements.
              </p>

              <div
                style={{
                  marginTop: "16px",
                }}
              >
                <SummaryRow
                  icon={<HeartPulse size={16} />}
                  label="Heart Rate"
                  value={
                    health?.heart_rate
                      ? `${health.heart_rate} bpm`
                      : "Not recorded"
                  }
                />

                <SummaryRow
                  icon={<Droplets size={16} />}
                  label="Blood Glucose"
                  value={
                    health?.blood_glucose
                      ? `${health.blood_glucose} mg/dL`
                      : "Not recorded"
                  }
                />

                <SummaryRow
                  icon={<Activity size={16} />}
                  label="Blood Pressure"
                  value={
                    health?.systolic_bp != null
                      ? `${health.systolic_bp}/${health.diastolic_bp} mmHg`
                      : "Not recorded"
                  }
                />

                <SummaryRow
                  icon={<Weight size={16} />}
                  label="Weight"
                  value={
                    health?.weight_kg
                      ? `${health.weight_kg} kg`
                      : "Not recorded"
                  }
                />

                <SummaryRow
                  icon={<CalendarDays size={16} />}
                  label="Last Recorded"
                  value={
                    health?.recorded_at
                      ? formatDate(
                          health.recorded_at
                        )
                      : "Not recorded"
                  }
                  last
                />
              </div>
            </div>
          </div>

          {/* LOWER SECTION */}
          <div
            className="dashboard-bottom-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.4fr) minmax(280px, 0.8fr)",
              gap: "16px",
              marginTop: "16px",
              width: "100%",
              minWidth: 0,
            }}
          >
            {/* MEDICAL RECORDS */}
            <div className="dashboard-card">
              <SectionHeader
                title="Recent Medical Records"
                description="Latest entries from your medical history."
                icon={<FileText size={21} />}
              />

              {records.length === 0 ? (
                <EmptyState
                  icon={<FileText size={22} />}
                  text="No medical records available."
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    marginTop: "18px",
                  }}
                >
                  {records
                    .slice(0, 4)
                    .map((record) => (
                      <div
                        key={record.id}
                        className="record-item"
                      >
                        <div className="record-icon">
                          <FileText size={16} />
                        </div>

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <strong>
                            {record.diagnosis ||
                              "Medical Record"}
                          </strong>

                          <p>
                            {record.treatment ||
                              record.medical_notes ||
                              "No additional details."}
                          </p>

                          <span>
                            {record.record_date
                              ? formatDate(
                                  record.record_date
                                )
                              : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* UPCOMING APPOINTMENTS */}
            <div className="dashboard-card">
              <SectionHeader
                title="Upcoming Appointments"
                description="Your scheduled consultations."
                icon={<CalendarDays size={21} />}
              />

              {appointments.length === 0 ? (
                <EmptyState
                  icon={<CalendarDays size={22} />}
                  text="No upcoming appointments."
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    marginTop: "18px",
                  }}
                >
                  {appointments
                    .slice(0, 3)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="appointment-item"
                      >
                        <div className="appointment-icon">
                          <Clock3 size={16} />
                        </div>

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <strong>
                            {appointment.doctor_name ||
                              "Doctor"}
                          </strong>

                          <p>
                            {appointment.specialization ||
                              "Medical Consultation"}
                          </p>

                          <span>
                            {formatDate(
                              appointment.appointment_date
                            )}

                            {appointment.appointment_time
                              ? ` • ${appointment.appointment_time}`
                              : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* THIRD SECTION */}
          <div
            className="dashboard-bottom-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {/* PRESCRIPTIONS */}
            <div className="dashboard-card">
              <SectionHeader
                title="Active Prescriptions"
                description="Current medications prescribed to you."
                icon={<Pill size={21} />}
              />

              {prescriptions.length === 0 ? (
                <EmptyState
                  icon={<Pill size={22} />}
                  text="No active prescriptions."
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    marginTop: "18px",
                  }}
                >
                  {prescriptions
                    .slice(0, 4)
                    .map((medicine) => (
                      <div
                        key={medicine.id}
                        className="record-item"
                      >
                        <div className="record-icon">
                          <Pill size={16} />
                        </div>

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          <strong>
                            {medicine.medicine_name}
                          </strong>

                          <p>
                            {medicine.dosage} •{" "}
                            {medicine.frequency}
                          </p>

                          <span>
                            {medicine.duration ||
                              "Active prescription"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* LAB REPORTS */}
            <div className="dashboard-card">
              <SectionHeader
                title="Recent Lab Reports"
                description="Latest diagnostic test results."
                icon={<FileText size={21} />}
              />

              {labs.length === 0 ? (
                <EmptyState
                  icon={<FileText size={22} />}
                  text="No lab reports available."
                />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    marginTop: "18px",
                  }}
                >
                  {labs
                    .slice(0, 4)
                    .map((lab) => (
                      <div
                        key={lab.id}
                        className="record-item"
                      >
                        <div className="record-icon">
                          <FileText size={16} />
                        </div>

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          <strong>
                            {lab.test_name}
                          </strong>

                          <p>
                            {lab.result_value
                              ? `${lab.result_value} ${
                                  lab.unit || ""
                                }`
                              : "Result pending"}
                          </p>

                          <span>
                            {lab.test_date
                              ? formatDate(
                                  lab.test_date
                                )
                              : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* AI RECOMMENDATION */}
          {aiRecommendation && (
            <div
              className="dashboard-card ai-recommendation-card"
              style={{
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "15px",
                }}
              >
                <div>
                  <span className="dashboard-eyebrow">
                    MEDNEXUS AI
                  </span>

                  <h3
                    style={{
                      margin:
                        "5px 0 5px",
                      fontSize: "18px",
                    }}
                  >
                    Latest AI Recommendation
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: "12px",
                    }}
                  >
                    {aiRecommendation.input_summary ||
                      "AI-generated health recommendation"}
                  </p>
                </div>

                <span
                  className={`risk-badge ${
                    aiRecommendation.risk_level ||
                    "unknown"
                  }`}
                >
                  {aiRecommendation.risk_level ||
                    "N/A"}
                </span>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "14px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                {aiRecommendation.recommendation ||
                  "No recommendation details available."}
              </div>

              {aiRecommendation.disclaimer && (
                <p
                  style={{
                    margin:
                      "12px 0 0",
                    color: "#94a3b8",
                    fontSize: "10px",
                  }}
                >
                  {aiRecommendation.disclaimer}
                </p>
              )}
            </div>
          )}
        </>
      )}

      <style>
        {`
          @keyframes mednexus-dashboard-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .dashboard-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 20px;
            box-sizing: border-box;
            min-width: 0;
            overflow: hidden;
          }

          .profile-avatar {
            width: 44px;
            height: 44px;
            min-width: 44px;
            border-radius: 12px;
            background: #eff6ff;
            color: #2563eb;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .dashboard-eyebrow {
            color: #0891b2;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.12em;
          }

          .record-item,
          .appointment-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 13px;
            border-radius: 11px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }

          .record-icon,
          .appointment-icon {
            width: 34px;
            height: 34px;
            min-width: 34px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eff6ff;
            color: #2563eb;
          }

          .record-item strong,
          .appointment-item strong {
            display: block;
            color: #334155;
            font-size: 13px;
          }

          .record-item p,
          .appointment-item p {
            margin: 4px 0 0;
            color: #64748b;
            font-size: 11px;
            line-height: 1.5;
          }

          .record-item span,
          .appointment-item span {
            display: block;
            margin-top: 5px;
            color: #94a3b8;
            font-size: 10px;
          }

          .ai-recommendation-card {
            border-color: #dbeafe;
            background: linear-gradient(
              135deg,
              #ffffff,
              #f8fbff
            );
          }

          .risk-badge {
            padding: 6px 10px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            background: #fef3c7;
            color: #92400e;
          }

          @media (max-width: 1250px) {
            .dashboard-top-grid {
              grid-template-columns:
                minmax(220px, 0.8fr)
                minmax(0, 1.8fr) !important;
            }

            .dashboard-top-grid > :last-child {
              grid-column: 1 / -1;
            }
          }

          @media (max-width: 900px) {
            .dashboard-top-grid {
              grid-template-columns:
                1fr !important;
            }

            .dashboard-top-grid > :last-child {
              grid-column: auto;
            }

            .metrics-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr)) !important;
            }

            .dashboard-bottom-grid {
              grid-template-columns:
                1fr !important;
            }
          }

          @media (max-width: 600px) {
            .metrics-grid {
              grid-template-columns:
                1fr !important;
            }

            .dashboard-header h1 {
              font-size: 26px !important;
            }
          }
        `}
      </style>
    </section>
  );
}

/* ---------------------------------------------------------
   METRIC CARD
--------------------------------------------------------- */

function MetricCard({
  icon,
  title,
  value,
  unit,
}) {
  return (
    <div
      className="dashboard-card"
      style={{
        minHeight: "155px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "11px",
            background: "#eff6ff",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>

        <span
          style={{
            color: "#94a3b8",
            fontSize: "9px",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          Latest
        </span>
      </div>

      <p
        style={{
          margin:
            "15px 0 4px",
          color: "#94a3b8",
          fontSize: "11px",
        }}
      >
        {title}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "5px",
          flexWrap: "wrap",
        }}
      >
        <strong
          style={{
            color: "#1e293b",
            fontSize: "25px",
            lineHeight: 1,
          }}
        >
          {value}
        </strong>

        {unit && (
          <span
            style={{
              color: "#64748b",
              fontSize: "10px",
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PROFILE ITEM
--------------------------------------------------------- */

function ProfileItem({ label, value }) {
  return (
    <div
      style={{
        padding: "10px",
        borderRadius: "9px",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: "9px",
          fontWeight: 800,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#334155",
          fontSize: "12px",
          marginTop: "3px",
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SUMMARY ROW
--------------------------------------------------------- */

function SummaryRow({
  icon,
  label,
  value,
  last = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding:
          "10px 0",
        borderBottom: last
          ? "none"
          : "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          color: "#2563eb",
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            color: "#94a3b8",
            fontSize: "9px",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#334155",
            fontSize: "11px",
            marginTop: "3px",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SECTION HEADER
--------------------------------------------------------- */

function SectionHeader({
  title,
  description,
  icon,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "17px",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: "6px 0 0",
            color: "#94a3b8",
            fontSize: "11px",
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          color: "#2563eb",
        }}
      >
        {icon}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   EMPTY STATE
--------------------------------------------------------- */

function EmptyState({ icon, text }) {
  return (
    <div
      style={{
        padding: "28px 10px",
        textAlign: "center",
        color: "#94a3b8",
        fontSize: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "8px",
          opacity: 0.7,
        }}
      >
        {icon}
      </div>

      {text}
    </div>
  );
}

/* ---------------------------------------------------------
   DATE FORMAT
--------------------------------------------------------- */

function formatDate(date) {
  if (!date) return "";

  try {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "";
  }
}

export default Dashboard;