import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  AlertCircle,
  XCircle,
  CalendarDays,
  Stethoscope,
  Activity,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

import API_BASE_URL from "../../config/api";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    doctor_id: "",
    appointment_id: "",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    medical_notes: "",
    record_date: "",
  });

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const loadMedicalRecords = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to view your medical records.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/medical-records`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load medical records."
        );
      }

      setRecords(data.medical_records || []);
    } catch (err) {
      console.error("Medical records error:", err);

      setError(
        err.message || "Unable to load medical records."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      doctor_id: "",
      appointment_id: "",
      diagnosis: "",
      symptoms: "",
      treatment: "",
      medical_notes: "",
      record_date: "",
    });
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  const createMedicalRecord = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to continue.");
      return;
    }

    if (
      !form.diagnosis &&
      !form.symptoms &&
      !form.treatment &&
      !form.medical_notes
    ) {
      setError(
        "Please enter at least one medical record detail."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const body = {
        doctor_id: form.doctor_id
          ? Number(form.doctor_id)
          : null,

        appointment_id: form.appointment_id
          ? Number(form.appointment_id)
          : null,

        diagnosis: form.diagnosis.trim() || null,

        symptoms: form.symptoms.trim() || null,

        treatment: form.treatment.trim() || null,

        medical_notes:
          form.medical_notes.trim() || null,

        record_date:
          form.record_date || null,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/medical-records`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to create medical record."
        );
      }

      setSuccess(
        "Medical record created successfully."
      );

      setShowForm(false);
      resetForm();

      await loadMedicalRecords();
    } catch (err) {
      console.error(
        "Create medical record error:",
        err
      );

      setError(
        err.message ||
          "Unable to create medical record."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="medical-records-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="welcome-row medical-records-header">

        <div>
          <span className="dashboard-eyebrow">
            HEALTHCARE RECORDS
          </span>

          <h1>Medical Records</h1>

          <p>
            View and manage your medical history,
            diagnoses, treatments and clinical notes.
          </p>
        </div>

        <div className="medical-record-header-actions">

          <button
            type="button"
            className="btn medical-refresh-btn"
            onClick={loadMedicalRecords}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "medical-record-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="btn medical-add-btn"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowForm(true);
            }}
          >
            <Plus size={17} />

            Add Medical Record
          </button>

        </div>

      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="medical-alert error">

          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <XCircle size={17} />
          </button>

        </div>
      )}

      {/* =========================
          SUCCESS
      ========================= */}

      {success && (
        <div className="medical-alert success">

          <CheckCircle2 size={18} />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <XCircle size={17} />
          </button>

        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="medical-state-card">

          <RefreshCw
            size={30}
            className="medical-record-spin"
          />

          <h3>
            Loading medical records...
          </h3>

          <p>
            Please wait while we retrieve your
            medical history.
          </p>

        </div>
      )}

      {/* =========================
          EMPTY STATE
      ========================= */}

      {!loading &&
        !error &&
        records.length === 0 && (
          <div className="medical-state-card">

            <div className="medical-empty-icon">
              <FileText size={27} />
            </div>

            <h3>
              No Medical Records Found
            </h3>

            <p>
              Your medical history will appear here
              once a record is added.
            </p>

            <button
              type="button"
              className="medical-primary-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} />

              Add First Record
            </button>

          </div>
        )}

      {/* =========================
          RECORDS
      ========================= */}

      {!loading &&
        !error &&
        records.length > 0 && (
          <div className="medical-records-container">

            <div className="medical-records-summary">

              <div>
                <h2>
                  Your Medical History
                </h2>

                <p>
                  {records.length}{" "}
                  {records.length === 1
                    ? "medical record"
                    : "medical records"}{" "}
                  available
                </p>
              </div>

              <div className="medical-record-count">
                {records.length}
              </div>

            </div>

            <div className="medical-record-grid">

              {records.map((record) => (
                <MedicalRecordCard
                  key={record.id}
                  record={record}
                />
              ))}

            </div>

          </div>
        )}

      {/* =========================
          ADD RECORD MODAL
      ========================= */}

      {showForm && (
        <div
          className="medical-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >

          <div className="medical-modal">

            <div className="medical-modal-header">

              <div>

                <span className="dashboard-eyebrow">
                  HEALTHCARE RECORDS
                </span>

                <h2>
                  Add Medical Record
                </h2>

                <p>
                  Enter the details of your
                  medical history.
                </p>

              </div>

              <button
                type="button"
                className="medical-close-btn"
                onClick={closeForm}
                disabled={saving}
              >
                <XCircle size={21} />
              </button>

            </div>

            <form
              onSubmit={createMedicalRecord}
              className="medical-form"
            >

              <div className="medical-form-grid">

                <MedicalInput
                  label="Doctor ID"
                  name="doctor_id"
                  value={form.doctor_id}
                  onChange={handleChange}
                  placeholder="Optional"
                />

                <MedicalInput
                  label="Appointment ID"
                  name="appointment_id"
                  value={form.appointment_id}
                  onChange={handleChange}
                  placeholder="Optional"
                />

                <MedicalInput
                  label="Diagnosis"
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={handleChange}
                  placeholder="e.g. Viral fever"
                />

                <MedicalInput
                  label="Record Date"
                  name="record_date"
                  value={form.record_date}
                  onChange={handleChange}
                  type="date"
                />

              </div>

              <label className="medical-field">

                <span>
                  Symptoms
                </span>

                <textarea
                  name="symptoms"
                  value={form.symptoms}
                  onChange={handleChange}
                  placeholder="Describe symptoms..."
                  rows="3"
                />

              </label>

              <label className="medical-field">

                <span>
                  Treatment
                </span>

                <textarea
                  name="treatment"
                  value={form.treatment}
                  onChange={handleChange}
                  placeholder="Describe treatment..."
                  rows="3"
                />

              </label>

              <label className="medical-field">

                <span>
                  Medical Notes
                </span>

                <textarea
                  name="medical_notes"
                  value={form.medical_notes}
                  onChange={handleChange}
                  placeholder="Additional medical information..."
                  rows="4"
                />

              </label>

              <div className="medical-form-actions">

                <button
                  type="button"
                  className="medical-secondary-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="medical-primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="medical-record-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />

                      Save Record
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =========================
          PAGE CSS
      ========================= */}

      <style>
        {`

          .medical-records-page {
            width: 100%;
            max-width: none;
            box-sizing: border-box;
          }

          .medical-records-header {
            width: 100%;
            box-sizing: border-box;
          }

          .medical-record-header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .medical-refresh-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            background: #eff6ff;
            color: #2563eb;
            border: 1px solid #dbeafe;
          }

          .medical-add-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            background: #2563eb;
            color: #ffffff;
            border: 1px solid #2563eb;
          }

          .medical-add-btn:hover {
            background: #1d4ed8;
          }

          .medical-alert {
            width: 100%;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
            padding: 13px 15px;
            border-radius: 10px;
            font-size: 13px;
          }

          .medical-alert button {
            margin-left: auto;
            border: 0;
            background: transparent;
            cursor: pointer;
          }

          .medical-alert.error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #b91c1c;
          }

          .medical-alert.success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #15803d;
          }

          .medical-state-card {
            width: 100%;
            min-height: 260px;
            margin-top: 24px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 45px 20px;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            background: #ffffff;
          }

          .medical-state-card h3 {
            margin-top: 14px;
            margin-bottom: 0;
            color: #1e293b;
            font-size: 16px;
          }

          .medical-state-card p {
            margin-top: 7px;
            color: #94a3b8;
            font-size: 12px;
          }

          .medical-empty-icon {
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 13px;
            background: #eff6ff;
            color: #2563eb;
          }

          .medical-records-container {
            width: 100%;
            margin-top: 24px;
          }

          .medical-records-summary {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 15px;
          }

          .medical-records-summary h2 {
            margin: 0;
            color: #1e293b;
            font-size: 17px;
          }

          .medical-records-summary p {
            margin: 5px 0 0;
            color: #94a3b8;
            font-size: 11px;
          }

          .medical-record-count {
            min-width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 9px;
            border-radius: 9px;
            background: #eff6ff;
            color: #2563eb;
            font-size: 13px;
            font-weight: 700;
          }

          /*
          ========================================
          IMPORTANT:
          HORIZONTAL RECORD GRID
          ========================================
          */

          .medical-record-grid {
            width: 100%;
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 15px;
          }

          .medical-record-card {
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
            padding: 19px;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            background: #ffffff;
            transition: all 0.2s ease;
          }

          .medical-record-card:hover {
            transform: translateY(-2px);
            border-color: #bfdbfe;
            box-shadow:
              0 10px 28px
              rgba(15, 23, 42, 0.07);
          }

          .medical-record-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 15px;
          }

          .medical-record-icon {
            width: 43px;
            height: 43px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 11px;
            background: #eff6ff;
            color: #2563eb;
          }

          .medical-record-date {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #64748b;
            font-size: 10px;
            white-space: nowrap;
          }

          .medical-record-title {
            margin: 14px 0 0;
            color: #1e293b;
            font-size: 15px;
            font-weight: 700;
          }

          .medical-record-section {
            margin-top: 14px;
            padding-top: 13px;
            border-top: 1px solid #f1f5f9;
          }

          .medical-record-label {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #94a3b8;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .medical-record-text {
            margin: 6px 0 0;
            color: #475569;
            font-size: 12px;
            line-height: 1.55;
          }

          .medical-record-meta {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-top: 14px;
          }

          .medical-meta-box {
            padding: 10px;
            border-radius: 9px;
            background: #f8fafc;
          }

          .medical-meta-box span {
            display: block;
            color: #94a3b8;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .medical-meta-box strong {
            display: block;
            margin-top: 4px;
            color: #475569;
            font-size: 11px;
          }

          .medical-primary-btn,
          .medical-secondary-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }

          .medical-primary-btn {
            margin-top: 16px;
            border: 0;
            background: #2563eb;
            color: #ffffff;
          }

          .medical-primary-btn:hover {
            background: #1d4ed8;
          }

          .medical-secondary-btn {
            border: 1px solid #e2e8f0;
            background: #ffffff;
            color: #475569;
          }

          .medical-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(15, 23, 42, 0.45);
          }

          .medical-modal {
            width: min(700px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            box-sizing: border-box;
            padding: 24px;
            border-radius: 16px;
            background: #ffffff;
            box-shadow:
              0 25px 70px
              rgba(15, 23, 42, 0.2);
          }

          .medical-modal-header {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 20px;
          }

          .medical-modal-header h2 {
            margin: 5px 0;
            color: #1e293b;
            font-size: 19px;
          }

          .medical-modal-header p {
            margin: 0;
            color: #64748b;
            font-size: 11px;
          }

          .medical-close-btn {
            width: 34px;
            height: 34px;
            flex-shrink: 0;
            border: 0;
            border-radius: 8px;
            background: #f8fafc;
            color: #64748b;
            cursor: pointer;
          }

          .medical-form {
            display: grid;
            gap: 15px;
          }

          .medical-form-grid {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 13px;
          }

          .medical-field {
            display: grid;
            gap: 6px;
          }

          .medical-field span {
            color: #475569;
            font-size: 11px;
            font-weight: 600;
          }

          .medical-field input,
          .medical-field textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 10px 11px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            outline: none;
            background: #ffffff;
            color: #334155;
            font-family: inherit;
            font-size: 12px;
          }

          .medical-field textarea {
            resize: vertical;
          }

          .medical-field input:focus,
          .medical-field textarea:focus {
            border-color: #93c5fd;
            box-shadow:
              0 0 0 3px #eff6ff;
          }

          .medical-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 9px;
            margin-top: 3px;
          }

          .medical-form-actions
            .medical-primary-btn {
            margin-top: 0;
          }

          .medical-primary-btn:disabled,
          .medical-secondary-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .medical-record-spin {
            animation:
              mednexus-medical-spin
              1s linear infinite;
          }

          @keyframes mednexus-medical-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 1000px) {

            .medical-record-grid {
              grid-template-columns: 1fr;
            }

          }

          @media (max-width: 700px) {

            .medical-records-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .medical-record-header-actions {
              width: 100%;
            }

            .medical-refresh-btn,
            .medical-add-btn {
              flex: 1;
            }

            .medical-form-grid {
              grid-template-columns: 1fr;
            }

          }

          @media (max-width: 500px) {

            .medical-record-header-actions {
              flex-direction: column;
            }

            .medical-refresh-btn,
            .medical-add-btn {
              width: 100%;
            }

            .medical-record-meta {
              grid-template-columns: 1fr;
            }

          }

        `}
      </style>

    </section>
  );
}

/* =====================================================
   MEDICAL RECORD CARD
===================================================== */

function MedicalRecordCard({ record }) {
  return (
    <article className="medical-record-card">

      <div className="medical-record-card-header">

        <div className="medical-record-icon">
          <FileText size={21} />
        </div>

        <div className="medical-record-date">
          <CalendarDays size={13} />

          {formatDate(record.record_date)}
        </div>

      </div>

      <h3 className="medical-record-title">
        {record.diagnosis ||
          "Medical Record"}
      </h3>

      {record.symptoms && (
        <div className="medical-record-section">

          <div className="medical-record-label">
            <Activity size={12} />

            Symptoms
          </div>

          <p className="medical-record-text">
            {record.symptoms}
          </p>

        </div>
      )}

      {record.treatment && (
        <div className="medical-record-section">

          <div className="medical-record-label">
            <Stethoscope size={12} />

            Treatment
          </div>

          <p className="medical-record-text">
            {record.treatment}
          </p>

        </div>
      )}

      {record.medical_notes && (
        <div className="medical-record-section">

          <div className="medical-record-label">
            <ClipboardList size={12} />

            Medical Notes
          </div>

          <p className="medical-record-text">
            {record.medical_notes}
          </p>

        </div>
      )}

      <div className="medical-record-meta">

        <div className="medical-meta-box">

          <span>
            Doctor ID
          </span>

          <strong>
            {record.doctor_id || "Not assigned"}
          </strong>

        </div>

        <div className="medical-meta-box">

          <span>
            Appointment ID
          </span>

          <strong>
            {record.appointment_id ||
              "Not linked"}
          </strong>

        </div>

      </div>

    </article>
  );
}

/* =====================================================
   INPUT
===================================================== */

function MedicalInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="medical-field">

      <span>{label}</span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

    </label>
  );
}

/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default MedicalRecords;