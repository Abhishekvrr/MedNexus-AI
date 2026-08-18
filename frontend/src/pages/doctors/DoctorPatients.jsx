import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  UserRound,
  HeartPulse,
  Droplets,
  Activity,
  ChevronRight,
  FileText,
  AlertCircle,
  Pill,
  ShieldAlert,
  Clock,
  Building2,
  X,
  ExternalLink,
  Plus,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../../config/api";

function DoctorPatients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("All");

  const [selectedPatient, setSelectedPatient] = useState(null);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/doctor/patients`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load patient records.");
      }

      setPatients(data.patients || []);
    } catch (err) {
      console.error("Doctor patients error:", err);
      setError(err.message || "Unable to load patient records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? null : age;
  };

  const formatDate = (date) => {
    if (!date) return "No prior visits";
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const name = String(patient.full_name || "").toLowerCase();
      const email = String(patient.email || "").toLowerCase();
      const phone = String(patient.phone || "").toLowerCase();
      const gender = String(patient.gender || "").toLowerCase();
      const blood = String(patient.blood_group || "").toLowerCase();
      const conditions = String(patient.chronic_conditions || "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        conditions.includes(query);

      const matchesGender =
        genderFilter === "All" || gender === genderFilter.toLowerCase();

      const matchesBlood =
        bloodGroupFilter === "All" || blood === bloodGroupFilter.toLowerCase();

      return matchesSearch && matchesGender && matchesBlood;
    });
  }, [patients, search, genderFilter, bloodGroupFilter]);

  return (
    <div className="doc-patients-page-container">
      {/* BULLETPROOF EMBEDDED CSS */}
      <style>{`
        .doc-patients-page-container {
          width: 100%;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          box-sizing: border-box;
        }

        .doc-pat-header {
          background: linear-gradient(135deg, #047857 0%, #059669 60%, #10b981 100%);
          border-radius: 20px;
          padding: 30px 34px;
          color: #ffffff;
          margin-bottom: 26px;
          box-shadow: 0 12px 30px -10px rgba(5, 150, 105, 0.35);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .doc-pat-header h1 {
          font-size: 26px;
          font-weight: 800;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .doc-pat-header p {
          font-size: 14px;
          color: #d1fae5;
          margin: 0;
        }

        .doc-pat-sync-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .doc-pat-sync-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .doc-pat-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .doc-pat-stat-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .doc-pat-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pat-icon-emerald { background: #ecfdf5; color: #059669; }
        .pat-icon-blue { background: #eff6ff; color: #2563eb; }
        .pat-icon-purple { background: #f5f3ff; color: #7c3aed; }
        .pat-icon-rose { background: #fff1f2; color: #e11d48; }

        .doc-pat-stat-val {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .doc-pat-stat-lbl {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin-top: 2px;
        }

        /* CARD WRAPPER */
        .doc-pat-main-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05);
          padding: 24px;
        }

        /* FILTER BAR */
        .doc-pat-filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 22px;
          padding-bottom: 18px;
          border-bottom: 1px solid #f1f5f9;
        }

        .doc-pat-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 9px 14px;
          width: 100%;
          max-width: 380px;
        }

        .doc-pat-search input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #0f172a;
          width: 100%;
        }

        .doc-pat-selects {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .doc-pat-select {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          outline: none;
          cursor: pointer;
        }

        /* PATIENT CARDS GRID */
        .doc-patients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .doc-single-pat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .doc-single-pat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
          border-color: #cbd5e1;
        }

        .pat-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }

        .pat-avatar-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #059669, #10b981);
          color: #ffffff;
          font-weight: 800;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pat-main-name {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .pat-sub-id {
          font-size: 12px;
          color: #64748b;
        }

        .pat-details-list {
          background: #f8fafc;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
          border: 1px solid #f1f5f9;
          font-size: 13px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pat-detail-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
        }

        .pat-detail-row strong {
          color: #0f172a;
        }

        .pat-badges-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .pat-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .pill-blood { background: #fee2e2; color: #b91c1c; }
        .pill-gender { background: #e0f2fe; color: #0369a1; }
        .pill-age { background: #fef3c7; color: #92400e; }
        .pill-visits { background: #ecfdf5; color: #047857; }

        .pat-card-footer {
          border-top: 1px solid #f1f5f9;
          padding-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pat-last-visit {
          font-size: 12px;
          color: #64748b;
        }

        .pat-view-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #059669;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .pat-view-btn:hover {
          background: #047857;
        }

        /* MODAL */
        .pat-modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .pat-modal-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
          border: 1px solid #e2e8f0;
        }
      `}</style>

      {/* HEADER */}
      <header className="doc-pat-header">
        <div>
          <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a7f3d0" }}>
            MEDNEXUS AI • DOCTOR PORTAL
          </span>
          <h1>Assigned Patients Directory</h1>
          <p>
            Comprehensive clinical registry of all patients under your consultation and medical care.
          </p>
        </div>

        <button className="doc-pat-sync-btn" onClick={loadPatients} disabled={loading}>
          <RefreshCw size={16} className={loading ? "doc-spin" : ""} />
          <span>Sync Patients</span>
        </button>
      </header>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #f87171",
            color: "#991b1b",
            padding: "14px 18px",
            borderRadius: "12px",
            marginBottom: "20px",
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

      {/* STATS */}
      <div className="doc-pat-stats-grid">
        <div className="doc-pat-stat-card">
          <div className="doc-pat-stat-icon pat-icon-emerald">
            <Users size={24} />
          </div>
          <div>
            <div className="doc-pat-stat-val">{patients.length}</div>
            <div className="doc-pat-stat-lbl">Active Patients</div>
          </div>
        </div>

        <div className="doc-pat-stat-card">
          <div className="doc-pat-stat-icon pat-icon-blue">
            <Activity size={24} />
          </div>
          <div>
            <div className="doc-pat-stat-val">
              {patients.reduce((acc, p) => acc + Number(p.appointment_count || 0), 0)}
            </div>
            <div className="doc-pat-stat-lbl">Consultation History</div>
          </div>
        </div>

        <div className="doc-pat-stat-card">
          <div className="doc-pat-stat-icon pat-icon-purple">
            <HeartPulse size={24} />
          </div>
          <div>
            <div className="doc-pat-stat-val">
              {patients.filter((p) => p.chronic_conditions).length}
            </div>
            <div className="doc-pat-stat-lbl">Chronic Monitored</div>
          </div>
        </div>

        <div className="doc-pat-stat-card">
          <div className="doc-pat-stat-icon pat-icon-rose">
            <Droplets size={24} />
          </div>
          <div>
            <div className="doc-pat-stat-val">
              {patients.filter((p) => p.blood_group).length}
            </div>
            <div className="doc-pat-stat-lbl">Biometrics Recorded</div>
          </div>
        </div>
      </div>

      {/* PATIENT REGISTRY CONTAINER */}
      <section className="doc-pat-main-card">
        {/* FILTER BAR */}
        <div className="doc-pat-filter-row">
          <div className="doc-pat-search">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by patient name, email, phone, or condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="doc-pat-selects">
            <select
              className="doc-pat-select"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="doc-pat-select"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
            >
              <option value="All">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
            <RefreshCw size={28} className="doc-spin" style={{ margin: "0 auto 12px", color: "#059669" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading patient records...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
            <Users size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>No Patients Found</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>
              {search ? "No patients match your search filter." : "Patients will appear here once they book appointments with you."}
            </p>
          </div>
        ) : (
          <div className="doc-patients-grid">
            {filteredPatients.map((patient) => {
              const initials = String(patient.full_name || "P")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const age = calculateAge(patient.date_of_birth);

              return (
                <div key={patient.patient_id || patient.id} className="doc-single-pat-card">
                  <div>
                    <div className="pat-card-header">
                      <div className="pat-avatar-box">{initials}</div>
                      <div>
                        <div className="pat-main-name">{patient.full_name || "Patient"}</div>
                        <div className="pat-sub-id">ID: {String(patient.patient_id || patient.id).slice(0, 8)}...</div>
                      </div>
                    </div>

                    {/* BADGES */}
                    <div className="pat-badges-row">
                      {patient.blood_group && (
                        <span className="pat-pill pill-blood">
                          <Droplets size={11} /> {patient.blood_group}
                        </span>
                      )}
                      {patient.gender && (
                        <span className="pat-pill pill-gender">
                          <UserRound size={11} /> {patient.gender}
                        </span>
                      )}
                      {age !== null && (
                        <span className="pat-pill pill-age">
                          <Calendar size={11} /> {age} yrs
                        </span>
                      )}
                      <span className="pat-pill pill-visits">
                        <Activity size={11} /> {patient.appointment_count || 1} Visits
                      </span>
                    </div>

                    {/* CONTACT & VITALS */}
                    <div className="pat-details-list">
                      {patient.email && (
                        <div className="pat-detail-row">
                          <Mail size={14} color="#64748b" />
                          <span>{patient.email}</span>
                        </div>
                      )}
                      {patient.phone && (
                        <div className="pat-detail-row">
                          <Phone size={14} color="#64748b" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      {patient.chronic_conditions && (
                        <div className="pat-detail-row">
                          <HeartPulse size={14} color="#dc2626" />
                          <span>Condition: <strong>{patient.chronic_conditions}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="pat-card-footer">
                    <div className="pat-last-visit">
                      <span>Last Visit:</span> <strong>{formatDate(patient.last_appointment)}</strong>
                    </div>

                    <button
                      className="pat-view-btn"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <span>Clinical Profile</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PATIENT DETAILS MODAL */}
      {selectedPatient && (
        <div className="pat-modal-backdrop" onClick={() => setSelectedPatient(null)}>
          <div className="pat-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                Patient Comprehensive Health Profile
              </h3>
              <button
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setSelectedPatient(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {/* TOP HEADER */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", background: "#f8fafc", borderRadius: "14px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#059669", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "18px" }}>
                  {String(selectedPatient.full_name || "P").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: "0 0 3px", fontSize: "17px", fontWeight: 700 }}>{selectedPatient.full_name}</h4>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    {selectedPatient.email} • {selectedPatient.phone || "No phone provided"}
                  </div>
                </div>
              </div>

              {/* STATS GRID */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Blood Group</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{selectedPatient.blood_group || "Not Recorded"}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Gender & Age</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                    {selectedPatient.gender || "Unspecified"}{calculateAge(selectedPatient.date_of_birth) ? `, ${calculateAge(selectedPatient.date_of_birth)} yrs` : ""}
                  </div>
                </div>
                <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Height / Weight</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                    {selectedPatient.height_cm ? `${selectedPatient.height_cm} cm` : "N/A"} / {selectedPatient.weight_kg ? `${selectedPatient.weight_kg} kg` : "N/A"}
                  </div>
                </div>
                <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Total Appointments</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{selectedPatient.appointment_count || 1} consultation(s)</div>
                </div>
              </div>

              {/* CLINICAL INFO */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Allergies</div>
                  <div style={{ fontSize: "13px", color: "#334155" }}>{selectedPatient.allergies || "None reported"}</div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Chronic Conditions</div>
                  <div style={{ fontSize: "13px", color: "#334155" }}>{selectedPatient.chronic_conditions || "None documented"}</div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "4px" }}>Current Medications</div>
                  <div style={{ fontSize: "13px", color: "#334155" }}>{selectedPatient.current_medications || "None recorded"}</div>
                </div>
              </div>

              {/* EMERGENCY CONTACT */}
              {selectedPatient.emergency_contact_name && (
                <div style={{ background: "#fff1f2", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fecdd3" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#9f1239", marginBottom: "4px" }}>Emergency Contact</div>
                  <div style={{ fontSize: "13px", color: "#881337" }}>
                    <strong>{selectedPatient.emergency_contact_name}</strong> ({selectedPatient.emergency_contact_relation || "Relation unlisted"}) — {selectedPatient.emergency_contact_phone || "No phone"}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: "16px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                onClick={() => setSelectedPatient(null)}
              >
                Close
              </button>
              <button
                style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#059669", color: "#ffffff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                onClick={() => {
                  setSelectedPatient(null);
                  navigate(`/doctor-prescriptions`);
                }}
              >
                Write Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPatients;