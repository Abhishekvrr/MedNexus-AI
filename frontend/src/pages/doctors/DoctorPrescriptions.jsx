import { useEffect, useMemo, useState } from "react";
import {
  Pill,
  Plus,
  Search,
  RefreshCw,
  Printer,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  AlertCircle,
  X,
  FileText,
  Building2,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../../config/api";

function DoctorPrescriptions() {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // New Prescription Form State
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");

  const [medicines, setMedicines] = useState([
    {
      medicine_name: "",
      dosage: "500mg",
      frequency: "1-0-1 (After food)",
      duration: "5 days",
      instructions: "Take with warm water",
    },
  ]);

  const getToken = () => localStorage.getItem("token");

  const loadData = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1. Load Doctor's Prescriptions
      const presRes = await fetch(`${API_BASE_URL}/api/prescriptions/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const presData = await presRes.json();

      // 2. Load Doctor's Assigned Patients
      const patRes = await fetch(`${API_BASE_URL}/api/doctor/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const patData = await patRes.json();

      // 3. Load Doctor Profile
      const docRes = await fetch(`${API_BASE_URL}/api/doctors/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const docData = await docRes.json();

      if (presData.success) {
        setPrescriptions(presData.prescriptions || []);
      }
      if (patData.success) {
        setPatients(patData.patients || []);
        if (patData.patients?.length > 0 && !selectedPatientId) {
          setSelectedPatientId(patData.patients[0].patient_id || patData.patients[0].id);
        }
      }
      if (docData.success) {
        setDoctorProfile(docData.doctor || null);
      }
    } catch (err) {
      console.error("Prescriptions load error:", err);
      setError("Unable to load prescriptions or patient records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add another medicine row
  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      {
        medicine_name: "",
        dosage: "500mg",
        frequency: "1-0-1 (After food)",
        duration: "5 days",
        instructions: "Take after meals",
      },
    ]);
  };

  // Remove medicine row
  const removeMedicineRow = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  // Update specific medicine field
  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  // Submit new prescription
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    const token = getToken();

    if (!selectedPatientId) {
      setError("Please select an assigned patient.");
      return;
    }

    const validMeds = medicines.filter((m) => m.medicine_name.trim() !== "");
    if (validMeds.length === 0) {
      setError("Please add at least one valid medication name.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/prescriptions/batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          diagnosis: diagnosis.trim() || undefined,
          notes: generalNotes.trim() || undefined,
          medicines: validMeds,
          start_date: startDate,
          end_date: endDate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create prescription.");
      }

      setSuccess("Prescription successfully issued to patient.");
      setTimeout(() => setSuccess(""), 4000);

      // Reset Form
      setDiagnosis("");
      setGeneralNotes("");
      setMedicines([
        {
          medicine_name: "",
          dosage: "500mg",
          frequency: "1-0-1 (After food)",
          duration: "5 days",
          instructions: "Take after meals",
        },
      ]);
      setShowCreateModal(false);

      await loadData();
    } catch (err) {
      console.error("Prescription create error:", err);
      setError(err.message || "Unable to issue prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering
  const filteredPrescriptions = useMemo(() => {
    const q = search.trim().toLowerCase();

    return prescriptions.filter((item) => {
      const medName = String(item.medicine_name || "").toLowerCase();
      const patientName = String(item.patient_name || "").toLowerCase();
      const status = String(item.status || "active").toLowerCase();
      const dosage = String(item.dosage || "").toLowerCase();

      const matchesSearch =
        !q || medName.includes(q) || patientName.includes(q) || dosage.includes(q);

      const matchesStatus =
        statusFilter === "All" || status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, search, statusFilter]);

  const formatDate = (val) => {
    if (!val) return "N/A";
    return new Date(val).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="doc-pres-container">
      {/* BULLETPROOF SCOPED CSS */}
      <style>{`
        .doc-pres-container {
          width: 100%;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          box-sizing: border-box;
        }

        .doc-pres-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }

        .doc-pres-eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #059669;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }

        .doc-pres-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .doc-pres-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .doc-pres-actions-header {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .doc-new-pres-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #059669;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
        }

        .doc-new-pres-btn:hover {
          background: #047857;
          transform: translateY(-1px);
        }

        /* STATS GRID */
        .doc-pres-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .doc-pres-stat-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .doc-pres-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .pres-icon-emerald { background: #ecfdf5; color: #059669; }
        .pres-icon-blue { background: #eff6ff; color: #2563eb; }
        .pres-icon-purple { background: #f5f3ff; color: #7c3aed; }

        .doc-pres-stat-val {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .doc-pres-stat-lbl {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin-top: 2px;
        }

        /* MAIN CARD */
        .doc-pres-main-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05);
          padding: 24px;
        }

        .doc-pres-filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid #f1f5f9;
        }

        .doc-pres-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 9px 14px;
          width: 100%;
          max-width: 360px;
        }

        .doc-pres-search input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #0f172a;
          width: 100%;
        }

        .doc-pres-table-wrap {
          width: 100%;
          overflow-x: auto;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
        }

        .doc-pres-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }

        .doc-pres-table thead {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .doc-pres-table th {
          padding: 14px 18px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .doc-pres-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s ease;
        }

        .doc-pres-table tbody tr:hover {
          background: #f8fafc;
        }

        .doc-pres-table td {
          padding: 16px 18px;
          vertical-align: middle;
        }

        .pres-status-pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .pill-active { background: #dcfce7; color: #15803d; }
        .pill-completed { background: #f1f5f9; color: #475569; }
        .pill-cancelled { background: #ffe4e6; color: #be123c; }

        /* MODAL */
        .doc-pres-modal-backdrop {
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

        .doc-pres-modal-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
          border: 1px solid #e2e8f0;
        }

        .med-row-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 12px;
          position: relative;
        }

        .form-label {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 5px;
          display: block;
          text-transform: uppercase;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #0f172a;
          box-sizing: border-box;
          outline: none;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #059669;
        }

        /* PRINTABLE RX SLIP */
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-rx-slip, .printable-rx-slip * {
            visibility: visible;
          }
          .printable-rx-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="doc-pres-header">
        <div>
          <span className="doc-pres-eyebrow">MEDNEXUS AI • CLINICAL PHARMACOLOGY</span>
          <h1 className="doc-pres-title">Prescription Management</h1>
          <p className="doc-pres-subtitle">
            Issue electronic prescriptions, customize dosage regimens, and review historical medication records.
          </p>
        </div>

        <div className="doc-pres-actions-header">
          <button className="doc-new-pres-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>Write Prescription</span>
          </button>
          <button
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "12px",
              padding: "10px 14px",
              cursor: "pointer",
            }}
            onClick={loadData}
          >
            <RefreshCw size={16} className={loading ? "doc-spin" : ""} />
          </button>
        </div>
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

      {/* STATS */}
      <div className="doc-pres-stats">
        <div className="doc-pres-stat-card">
          <div className="doc-pres-stat-icon pres-icon-emerald">
            <Pill size={24} />
          </div>
          <div>
            <div className="doc-pres-stat-val">{prescriptions.length}</div>
            <div className="doc-pres-stat-lbl">Total Prescriptions Issued</div>
          </div>
        </div>

        <div className="doc-pres-stat-card">
          <div className="doc-pres-stat-icon pres-icon-blue">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="doc-pres-stat-val">
              {prescriptions.filter((p) => p.status === "active").length}
            </div>
            <div className="doc-pres-stat-lbl">Active Regimens</div>
          </div>
        </div>

        <div className="doc-pres-stat-card">
          <div className="doc-pres-stat-icon pres-icon-purple">
            <User size={24} />
          </div>
          <div>
            <div className="doc-pres-stat-val">{patients.length}</div>
            <div className="doc-pres-stat-lbl">Patients Under Care</div>
          </div>
        </div>
      </div>

      {/* PRESCRIPTIONS TABLE CARD */}
      <section className="doc-pres-main-card">
        <div className="doc-pres-filter-row">
          <div className="doc-pres-search">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by patient name, medication, dosage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#334155",
                outline: "none",
                cursor: "pointer",
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
            <RefreshCw size={28} className="doc-spin" style={{ margin: "0 auto 12px", color: "#059669" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading prescriptions...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
            <Pill size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>No Prescriptions Found</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Click "+ Write Prescription" above to issue medications to your assigned patients.
            </p>
          </div>
        ) : (
          <div className="doc-pres-table-wrap">
            <table className="doc-pres-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Medication & Dosage</th>
                  <th>Frequency & Duration</th>
                  <th>Instructions</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((pr) => (
                  <tr key={pr.id}>
                    <td>
                      <div>
                        <strong style={{ color: "#0f172a" }}>{pr.patient_name || "Patient"}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{pr.patient_email}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong style={{ color: "#059669", fontSize: "15px" }}>{pr.medicine_name}</strong>
                        <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>{pr.dosage || "Standard"}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{pr.frequency || "As directed"}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{pr.duration || "Course"}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", color: "#475569" }}>
                        {pr.instructions || "None"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>
                        {formatDate(pr.created_at || pr.start_date)}
                      </span>
                    </td>
                    <td>
                      <span className={`pres-status-pill pill-${pr.status || "active"}`}>
                        {pr.status || "active"}
                      </span>
                    </td>
                    <td>
                      <button
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedPrescription(pr)}
                        title="View & Print Official Rx Slip"
                      >
                        <Printer size={13} />
                        <span>Rx Slip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* WRITE PRESCRIPTION MODAL */}
      {showCreateModal && (
        <div className="doc-pres-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="doc-pres-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Pill size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>
                  Write Patient Prescription
                </h3>
              </div>
              <button
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                onClick={() => setShowCreateModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} style={{ padding: "24px" }}>
              {/* PATIENT SELECTION */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Select Assigned Patient *</label>
                <select
                  className="form-select"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                >
                  {patients.map((p) => (
                    <option key={p.patient_id || p.id} value={p.patient_id || p.id}>
                      {p.full_name} ({p.email || "No email"}) — Blood: {p.blood_group || "N/A"}
                    </option>
                  ))}
                </select>
              </div>

              {/* DIAGNOSIS & CLINICAL NOTES */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div>
                  <label className="form-label">Clinical Diagnosis / Reason</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Course Duration & Dates</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="date"
                      className="form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="form-input"
                      placeholder="End Date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* MEDICINES LIST */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label className="form-label" style={{ margin: 0 }}>Medications List ({medicines.length})</label>
                  <button
                    type="button"
                    onClick={addMedicineRow}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={13} />
                    <span>Add Another Medicine</span>
                  </button>
                </div>

                {medicines.map((med, index) => (
                  <div key={index} className="med-row-box">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong style={{ fontSize: "13px", color: "#0f172a" }}>Medicine #{index + 1}</strong>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicineRow(index)}
                          style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr", gap: "10px", marginBottom: "8px" }}>
                      <div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                          value={med.medicine_name}
                          onChange={(e) => handleMedicineChange(index, "medicine_name", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Dosage (e.g. 500mg)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Frequency (e.g. 1-0-1)"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px" }}>
                      <div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Duration (e.g. 5 days)"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Special Advice (e.g. Take with food)"
                          value={med.instructions}
                          onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* GENERAL NOTES */}
              <div style={{ marginBottom: "20px" }}>
                <label className="form-label">General Clinical Advice / Dietary Restrictions</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Increase hydration, avoid strenuous activity for 48 hours, follow up if fever persists."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                />
              </div>

              {/* FOOTER BUTTONS */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}
                  onClick={() => setShowCreateModal(false)}
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
                    background: "#059669",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  {submitting ? "Issuing Prescription..." : "Issue Official Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL RX SLIP MODAL */}
      {selectedPrescription && (
        <div className="doc-pres-modal-backdrop" onClick={() => setSelectedPrescription(null)}>
          <div className="doc-pres-modal-card printable-rx-slip" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
            <div style={{ padding: "24px 30px", borderBottom: "2px solid #059669" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: "0 0 2px", fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                    MedNexus AI Healthcare
                  </h2>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                    Clinical Consultation & Prescription Slip
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: "15px", color: "#059669", display: "block" }}>
                    {doctorProfile?.doctor_name || "Dr. Ananya Sharma"}
                  </strong>
                  <span style={{ fontSize: "12px", color: "#475569" }}>
                    {doctorProfile?.specialization || "Cardiology Specialist"}
                  </span>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Reg No: {doctorProfile?.license_number || "MCI-48920-IND"}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px 30px" }}>
              {/* PATIENT INFO BOX */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>Patient Name:</span>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{selectedPrescription.patient_name}</div>
                </div>
                <div>
                  <span style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>Blood Group:</span>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{selectedPrescription.patient_blood_group || "O+"}</div>
                </div>
                <div>
                  <span style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>Date:</span>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{formatDate(selectedPrescription.created_at)}</div>
                </div>
              </div>

              {/* RX SYMBOL */}
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#059669", fontFamily: "serif", marginBottom: "10px" }}>
                ℞
              </div>

              {/* MEDICATION ITEM */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <tr>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Medicine</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Dosage</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Frequency</th>
                      <th style={{ padding: "10px 14px", textAlign: "left" }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>{selectedPrescription.medicine_name}</td>
                      <td style={{ padding: "12px 14px" }}>{selectedPrescription.dosage || "500mg"}</td>
                      <td style={{ padding: "12px 14px" }}>{selectedPrescription.frequency || "1-0-1"}</td>
                      <td style={{ padding: "12px 14px" }}>{selectedPrescription.duration || "5 days"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedPrescription.instructions && (
                <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", fontSize: "13px", color: "#334155", marginBottom: "20px" }}>
                  <strong>Special Advice:</strong> {selectedPrescription.instructions}
                </div>
              )}

              {/* SIGNATURE */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", textAlign: "center" }}>
                <div>
                  <div style={{ width: "160px", borderBottom: "1px dashed #94a3b8", marginBottom: "6px" }}></div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                    {doctorProfile?.doctor_name || "Dr. Ananya Sharma"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Authorized Clinical Signatory</div>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                onClick={() => setSelectedPrescription(null)}
              >
                Close
              </button>
              <button
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", border: "none", background: "#059669", color: "#ffffff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
                onClick={() => window.print()}
              >
                <Printer size={14} />
                <span>Print Rx Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPrescriptions;