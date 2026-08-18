import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  UserRound,
  RefreshCw,
  Plus,
  Calendar,
  Activity,
  HeartPulse,
  Droplets,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Pill,
  Clock,
  ChevronRight,
  X,
  FileCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../../config/api";

function DoctorMedicalRecords() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  // New Encounter Form State
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);

  const getToken = () => localStorage.getItem("token");

  // 1. Load Assigned Patients
  const loadPatients = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoadingPatients(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/doctor/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load assigned patients.");
      }

      const patList = data.patients || [];
      setPatients(patList);

      if (patList.length > 0 && !selectedPatientId) {
        const firstId = patList[0].patient_id || patList[0].id;
        setSelectedPatientId(firstId);
        loadPatientRecords(firstId);
      }
    } catch (err) {
      console.error("Doctor patients load error:", err);
      setError("Unable to load assigned patients.");
    } finally {
      setLoadingPatients(false);
    }
  };

  // 2. Load Selected Patient's Medical Records
  const loadPatientRecords = async (patientId) => {
    if (!patientId) return;
    const token = getToken();

    try {
      setLoadingRecords(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/medical-records/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setRecords(data.medical_records || []);
        setPrescriptions(data.prescriptions || []);
      }
    } catch (err) {
      console.error("Patient medical records error:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    loadPatientRecords(patientId);
  };

  // 3. Create Clinical Encounter Record
  const handleCreateRecord = async (e) => {
    e.preventDefault();
    const token = getToken();

    if (!selectedPatientId) {
      setError("Please select a patient.");
      return;
    }

    if (!diagnosis.trim() && !symptoms.trim() && !treatment.trim()) {
      setError("Please fill in diagnosis, symptoms, or treatment plan.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/medical-records/doctor`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          diagnosis: diagnosis.trim() || undefined,
          symptoms: symptoms.trim() || undefined,
          treatment: treatment.trim() || undefined,
          medical_notes: medicalNotes.trim() || undefined,
          record_date: recordDate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create medical record.");
      }

      setSuccess("Clinical encounter record successfully saved to patient chart.");
      setTimeout(() => setSuccess(""), 4000);

      // Reset form
      setDiagnosis("");
      setSymptoms("");
      setTreatment("");
      setMedicalNotes("");
      setShowAddModal(false);

      await loadPatientRecords(selectedPatientId);
    } catch (err) {
      console.error("Create medical record error:", err);
      setError(err.message || "Unable to save medical record.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPatient = patients.find(
    (p) => (p.patient_id || p.id) === selectedPatientId
  );

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

  const formatDate = (val) => {
    if (!val) return "N/A";
    return new Date(val).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="doc-medrec-container">
      {/* BULLETPROOF SCOPED CSS */}
      <style>{`
        .doc-medrec-container {
          width: 100%;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          box-sizing: border-box;
        }

        .doc-medrec-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }

        .doc-medrec-eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #2563eb;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }

        .doc-medrec-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .doc-medrec-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .doc-new-rec-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }

        .doc-new-rec-btn:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        /* TWO COLUMN LAYOUT */
        .doc-medrec-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 22px;
        }

        @media (max-width: 900px) {
          .doc-medrec-grid {
            grid-template-columns: 1fr;
          }
        }

        /* PATIENT SELECTOR SIDEBAR */
        .doc-pat-sidebar {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .doc-pat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .doc-pat-item:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .doc-pat-item.active {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        .pat-item-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #e2e8f0;
          color: #1e293b;
          font-weight: 800;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .doc-pat-item.active .pat-item-avatar {
          background: #2563eb;
          color: #ffffff;
        }

        /* MAIN CONTENT AREA */
        .doc-medrec-main {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .doc-pat-vitals-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .vitals-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 12px;
        }

        .vitals-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .vitals-val {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2px;
        }

        /* TIMELINE RECORDS */
        .doc-timeline-wrap {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
        }

        .timeline-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 16px;
          background: #ffffff;
          transition: border-color 0.15s ease;
        }

        .timeline-card:hover {
          border-color: #cbd5e1;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 10px;
        }

        /* MODAL */
        .doc-modal-backdrop {
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

        .doc-modal-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
          border: 1px solid #e2e8f0;
        }

        .form-label {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 5px;
          display: block;
          text-transform: uppercase;
        }

        .form-input, .form-textarea {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 14px;
          color: #0f172a;
          box-sizing: border-box;
          outline: none;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: #2563eb;
          background: #ffffff;
        }
      `}</style>

      {/* HEADER */}
      <header className="doc-medrec-header">
        <div>
          <span className="doc-medrec-eyebrow">MEDNEXUS AI • CLINICAL DOCUMENTATION</span>
          <h1 className="doc-medrec-title">Patient Medical Records</h1>
          <p className="doc-medrec-subtitle">
            Longitudinal electronic health records, consultation encounter notes, and diagnostic history.
          </p>
        </div>

        <button className="doc-new-rec-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>Add Clinical Encounter</span>
        </button>
      </header>

      {/* SUCCESS / ERROR */}
      {success && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "12px 16px", borderRadius: "12px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", padding: "12px 16px", borderRadius: "12px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {/* GRID */}
      <div className="doc-medrec-grid">
        {/* PATIENTS SIDEBAR */}
        <aside className="doc-pat-sidebar">
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
            Assigned Patients ({patients.length})
          </div>

          {loadingPatients ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
              <RefreshCw size={20} className="doc-spin" style={{ margin: "0 auto 8px", color: "#2563eb" }} />
              <p style={{ margin: 0, fontSize: "13px" }}>Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#64748b" }}>No assigned patients found.</p>
          ) : (
            patients.map((p) => {
              const pid = p.patient_id || p.id;
              const isActive = pid === selectedPatientId;
              const initials = String(p.full_name || "P").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

              return (
                <div
                  key={pid}
                  className={`doc-pat-item ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectPatient(pid)}
                >
                  <div className="pat-item-avatar">{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: "14px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.full_name}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Blood: {p.blood_group || "N/A"} • {p.gender || "Patient"}
                    </span>
                  </div>
                  <ChevronRight size={15} color={isActive ? "#2563eb" : "#cbd5e1"} />
                </div>
              );
            })
          )}
        </aside>

        {/* MAIN MEDICAL CHART */}
        <main className="doc-medrec-main">
          {selectedPatient && (
            <section className="doc-pat-vitals-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: "0 0 2px", fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                    {selectedPatient.full_name}
                  </h3>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    {selectedPatient.email} • {selectedPatient.phone || "No phone"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }}>
                    Active Patient Chart
                  </span>
                </div>
              </div>

              <div className="vitals-grid">
                <div className="vitals-item">
                  <div className="vitals-label">Age & Gender</div>
                  <div className="vitals-val">
                    {calculateAge(selectedPatient.date_of_birth) ? `${calculateAge(selectedPatient.date_of_birth)} yrs` : "N/A"}, {selectedPatient.gender || "Unspecified"}
                  </div>
                </div>

                <div className="vitals-item">
                  <div className="vitals-label">Blood Group</div>
                  <div className="vitals-val" style={{ color: "#dc2626" }}>
                    {selectedPatient.blood_group || "Unknown"}
                  </div>
                </div>

                <div className="vitals-item">
                  <div className="vitals-label">Allergies</div>
                  <div className="vitals-val" style={{ fontSize: "12px" }}>
                    {selectedPatient.allergies || "None reported"}
                  </div>
                </div>

                <div className="vitals-item">
                  <div className="vitals-label">Chronic Conditions</div>
                  <div className="vitals-val" style={{ fontSize: "12px" }}>
                    {selectedPatient.chronic_conditions || "None documented"}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TIMELINE RECORDS */}
          <section className="doc-timeline-wrap">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                Clinical Encounter History ({records.length})
              </h3>
              <button
                style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                onClick={() => loadPatientRecords(selectedPatientId)}
              >
                <RefreshCw size={13} className={loadingRecords ? "doc-spin" : ""} />
              </button>
            </div>

            {loadingRecords ? (
              <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                <RefreshCw size={24} className="doc-spin" style={{ margin: "0 auto 8px", color: "#2563eb" }} />
                <p style={{ margin: 0, fontSize: "13px" }}>Loading patient records timeline...</p>
              </div>
            ) : records.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 20px", color: "#64748b" }}>
                <FileText size={36} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
                <h4 style={{ margin: "0 0 4px", color: "#0f172a" }}>No Clinical Encounters Documented</h4>
                <p style={{ margin: 0, fontSize: "13px" }}>
                  Click "+ Add Clinical Encounter" to log this patient's consultation notes, diagnosis, and treatment.
                </p>
              </div>
            ) : (
              records.map((rec) => (
                <div key={rec.id} className="timeline-card">
                  <div className="timeline-header">
                    <div>
                      <strong style={{ fontSize: "16px", color: "#0f172a" }}>
                        {rec.diagnosis || "General Clinical Encounter"}
                      </strong>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        Attending: {rec.doctor_name || "Dr. Ananya Sharma"} ({rec.doctor_specialization || "Cardiology"})
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} />
                      {formatDate(rec.record_date || rec.created_at)}
                    </span>
                  </div>

                  {rec.symptoms && (
                    <div style={{ marginBottom: "8px", fontSize: "13px" }}>
                      <span style={{ color: "#64748b", fontWeight: 600 }}>Presenting Symptoms:</span>{" "}
                      <span style={{ color: "#1e293b" }}>{rec.symptoms}</span>
                    </div>
                  )}

                  {rec.treatment && (
                    <div style={{ marginBottom: "8px", fontSize: "13px" }}>
                      <span style={{ color: "#059669", fontWeight: 600 }}>Treatment & Plan:</span>{" "}
                      <span style={{ color: "#1e293b" }}>{rec.treatment}</span>
                    </div>
                  )}

                  {rec.medical_notes && (
                    <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", color: "#475569", marginTop: "10px" }}>
                      <strong>Doctor Notes:</strong> {rec.medical_notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </section>

          {/* ATTACHED PRESCRIPTIONS HISTORY */}
          {prescriptions.length > 0 && (
            <section className="doc-timeline-wrap">
              <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                Patient Medications & Prescriptions ({prescriptions.length})
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                {prescriptions.map((pr) => (
                  <div key={pr.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <strong style={{ color: "#059669", fontSize: "14px" }}>{pr.medicine_name}</strong>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "10px" }}>
                        {pr.status || "active"}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569" }}>
                      Dosage: <strong>{pr.dosage || "Standard"}</strong> • {pr.frequency || "As directed"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                      Duration: {pr.duration || "Course"} • Issued {formatDate(pr.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ADD CLINICAL ENCOUNTER MODAL */}
      {showAddModal && (
        <div className="doc-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="doc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Stethoscope size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                  Log Clinical Encounter Record
                </h3>
              </div>
              <button
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} style={{ padding: "24px" }}>
              {/* PATIENT SELECTION */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Patient</label>
                <select
                  className="form-input"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                >
                  {patients.map((p) => (
                    <option key={p.patient_id || p.id} value={p.patient_id || p.id}>
                      {p.full_name} ({p.email || "No email"})
                    </option>
                  ))}
                </select>
              </div>

              {/* DIAGNOSIS */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Clinical Diagnosis *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Type 2 Diabetes Mellitus with peripheral neuropathy"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </div>

              {/* SYMPTOMS */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Presenting Symptoms & Chief Complaints</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bilateral foot numbness, fatigue, polydipsia"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              {/* TREATMENT */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Treatment Plan & Clinical Interventions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HbA1c testing, initiate Metformin 500mg, diabetic dietary counseling"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                />
              </div>

              {/* MEDICAL NOTES */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Confidential Clinical Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Physician consultation notes, physical examination observations, follow-up recommendations..."
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                />
              </div>

              {/* RECORD DATE */}
              <div style={{ marginBottom: "20px" }}>
                <label className="form-label">Record Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                />
              </div>

              {/* ACTIONS */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  {submitting ? "Saving Record..." : "Save Encounter to Chart"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorMedicalRecords;