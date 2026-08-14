import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  HeartPulse,
  Droplets,
  Thermometer,
  Wind,
  TestTube2,
  Scale,
  CalendarDays,
  FileText,
  RefreshCw,
  AlertCircle,
  XCircle,
  Plus,
  CheckCircle2,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

function HealthMetrics() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    heart_rate: "",
    systolic_bp: "",
    diastolic_bp: "",
    temperature: "",
    oxygen_saturation: "",
    respiratory_rate: "",
    blood_glucose: "",
    weight_kg: "",
    notes: "",
  });

  useEffect(() => {
    loadHealthMetrics();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // =========================
  // LOAD HEALTH METRICS
  // =========================
  const loadHealthMetrics = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to view your health metrics.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/health-metrics`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load health metrics."
        );
      }

      setMetrics(data.health_metrics || []);
    } catch (err) {
      console.error("Health metrics error:", err);

      setError(
        err.message || "Unable to load health metrics."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET LATEST METRIC
  // =========================
  const latestMetric = useMemo(() => {
    if (!metrics.length) {
      return null;
    }

    return [...metrics].sort(
      (a, b) =>
        new Date(b.recorded_at || 0) -
        new Date(a.recorded_at || 0)
    )[0];
  }, [metrics]);

  // =========================
  // FORM CHANGE
  // =========================
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setForm({
      heart_rate: "",
      systolic_bp: "",
      diastolic_bp: "",
      temperature: "",
      oxygen_saturation: "",
      respiratory_rate: "",
      blood_glucose: "",
      weight_kg: "",
      notes: "",
    });
  };

  // =========================
  // CLOSE FORM
  // =========================
  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  // =========================
  // ADD HEALTH METRIC
  // =========================
  const addHealthMetric = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to continue.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const body = {
        heart_rate:
          form.heart_rate !== ""
            ? Number(form.heart_rate)
            : null,

        systolic_bp:
          form.systolic_bp !== ""
            ? Number(form.systolic_bp)
            : null,

        diastolic_bp:
          form.diastolic_bp !== ""
            ? Number(form.diastolic_bp)
            : null,

        temperature:
          form.temperature !== ""
            ? Number(form.temperature)
            : null,

        oxygen_saturation:
          form.oxygen_saturation !== ""
            ? Number(form.oxygen_saturation)
            : null,

        respiratory_rate:
          form.respiratory_rate !== ""
            ? Number(form.respiratory_rate)
            : null,

        blood_glucose:
          form.blood_glucose !== ""
            ? Number(form.blood_glucose)
            : null,

        weight_kg:
          form.weight_kg !== ""
            ? Number(form.weight_kg)
            : null,

        notes: form.notes.trim(),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/health-metrics`,
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
            "Unable to save health measurement."
        );
      }

      setSuccess(
        "Health measurement recorded successfully."
      );

      setShowForm(false);
      resetForm();

      await loadHealthMetrics();
    } catch (err) {
      console.error(
        "Add health metric error:",
        err
      );

      setError(
        err.message ||
          "Unable to save health measurement."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dashboard-section">
      {/* =========================
          HEADER
      ========================== */}
      <div className="welcome-row">
        <div>
          <span className="dashboard-eyebrow">
            Health Monitoring
          </span>

          <h1>Health Metrics</h1>

          <p>
            Track and monitor your vital health
            measurements and recent readings.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "9px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="btn"
            onClick={loadHealthMetrics}
            disabled={loading}
            style={{
              background: "#eff6ff",
              color: "#2563eb",
              border: "1px solid #dbeafe",
            }}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "health-metric-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowForm(true);
            }}
            style={{
              background: "#2563eb",
              color: "#ffffff",
              border: "1px solid #2563eb",
            }}
          >
            <Plus size={16} />

            Add Measurement
          </button>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================== */}
      {error && (
        <div className="health-alert error">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* =========================
          SUCCESS
      ========================== */}
      {success && (
        <div className="health-alert success">
          <CheckCircle2 size={18} />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* =========================
          LOADING
      ========================== */}
      {loading ? (
        <div
          className="dashboard-card"
          style={{
            marginTop: "24px",
            padding: "55px 20px",
            textAlign: "center",
          }}
        >
          <RefreshCw
            size={30}
            className="health-metric-spin"
            style={{
              color: "#2563eb",
            }}
          />

          <p
            className="card-muted"
            style={{
              marginTop: "12px",
            }}
          >
            Loading health metrics...
          </p>
        </div>
      ) : (
        <>
          {/* =========================
              EMPTY STATE
          ========================== */}
          {!latestMetric && (
            <div
              className="dashboard-card"
              style={{
                marginTop: "24px",
                padding: "55px 20px",
                textAlign: "center",
              }}
            >
              <div
                className="card-icon blue"
                style={{
                  margin: "0 auto",
                }}
              >
                <Activity size={25} />
              </div>

              <h3
                style={{
                  marginTop: "16px",
                }}
              >
                No health measurements found
              </h3>

              <p
                className="card-muted"
                style={{
                  marginTop: "7px",
                }}
              >
                Start tracking your vital health
                measurements by adding your first
                reading.
              </p>

              <button
                type="button"
                className="primary-health-btn"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setShowForm(true);
                }}
              >
                <Plus size={16} />

                Add First Measurement
              </button>
            </div>
          )}

          {/* =========================
              LATEST METRICS
          ========================== */}
          {latestMetric && (
            <>
              <div
                className="health-metric-grid"
                style={{
                  marginTop: "24px",
                }}
              >
                <MetricCard
                  icon={<HeartPulse size={21} />}
                  title="Heart Rate"
                  value={
                    latestMetric.heart_rate !== null &&
                    latestMetric.heart_rate !== undefined
                      ? latestMetric.heart_rate
                      : "—"
                  }
                  unit="bpm"
                  color="blue"
                />

                <MetricCard
                  icon={<Activity size={21} />}
                  title="Blood Pressure"
                  value={
                    latestMetric.systolic_bp !== null &&
                    latestMetric.systolic_bp !== undefined &&
                    latestMetric.diastolic_bp !== null &&
                    latestMetric.diastolic_bp !== undefined
                      ? `${latestMetric.systolic_bp}/${latestMetric.diastolic_bp}`
                      : "—"
                  }
                  unit="mmHg"
                  color="purple"
                />

                <MetricCard
                  icon={<Droplets size={21} />}
                  title="Oxygen Saturation"
                  value={
                    latestMetric.oxygen_saturation !== null &&
                    latestMetric.oxygen_saturation !== undefined
                      ? latestMetric.oxygen_saturation
                      : "—"
                  }
                  unit="%"
                  color="green"
                />

                <MetricCard
                  icon={<Thermometer size={21} />}
                  title="Temperature"
                  value={
                    latestMetric.temperature !== null &&
                    latestMetric.temperature !== undefined
                      ? latestMetric.temperature
                      : "—"
                  }
                  unit="°F"
                  color="orange"
                />

                <MetricCard
                  icon={<Wind size={21} />}
                  title="Respiratory Rate"
                  value={
                    latestMetric.respiratory_rate !== null &&
                    latestMetric.respiratory_rate !== undefined
                      ? latestMetric.respiratory_rate
                      : "—"
                  }
                  unit="/min"
                  color="cyan"
                />

                <MetricCard
                  icon={<TestTube2 size={21} />}
                  title="Blood Glucose"
                  value={
                    latestMetric.blood_glucose !== null &&
                    latestMetric.blood_glucose !== undefined
                      ? latestMetric.blood_glucose
                      : "—"
                  }
                  unit="mg/dL"
                  color="pink"
                />

                <MetricCard
                  icon={<Scale size={21} />}
                  title="Weight"
                  value={
                    latestMetric.weight_kg !== null &&
                    latestMetric.weight_kg !== undefined
                      ? latestMetric.weight_kg
                      : "—"
                  }
                  unit="kg"
                  color="indigo"
                />

                <div className="latest-reading-card">
                  <div className="latest-reading-icon">
                    <CalendarDays size={20} />
                  </div>

                  <div>
                    <span className="metric-label">
                      Last Recorded
                    </span>

                    <strong>
                      {formatDateTime(
                        latestMetric.recorded_at
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              {/* =========================
                  LATEST NOTES
              ========================== */}
              {latestMetric.notes && (
                <div
                  className="dashboard-card"
                  style={{
                    marginTop: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FileText
                      size={18}
                      style={{
                        color: "#2563eb",
                      }}
                    />

                    <h3
                      style={{
                        margin: 0,
                        fontSize: "14px",
                      }}
                    >
                      Latest Notes
                    </h3>
                  </div>

                  <p
                    className="card-muted"
                    style={{
                      marginTop: "10px",
                      lineHeight: 1.6,
                    }}
                  >
                    {latestMetric.notes}
                  </p>
                </div>
              )}

              {/* =========================
                  HISTORY
              ========================== */}
              {metrics.length > 0 && (
                <div
                  className="dashboard-card"
                  style={{
                    marginTop: "18px",
                  }}
                >
                  <div className="health-history-header">
                    <div>
                      <h3>
                        Measurement History
                      </h3>

                      <p className="card-muted">
                        Your recently recorded
                        health measurements.
                      </p>
                    </div>

                    <span className="health-history-count">
                      {metrics.length}
                    </span>
                  </div>

                  <div className="health-history-list">
                    {metrics.map((metric) => (
                      <HealthHistoryRow
                        key={metric.id}
                        metric={metric}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* =========================
          ADD MEASUREMENT MODAL
      ========================== */}
      {showForm && (
        <div
          className="health-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <div className="health-modal">
            <div className="health-modal-header">
              <div>
                <span className="dashboard-eyebrow">
                  Health Monitoring
                </span>

                <h2>
                  Add Health Measurement
                </h2>

                <p>
                  Enter your latest vital
                  measurements.
                </p>
              </div>

              <button
                type="button"
                className="health-modal-close"
                onClick={closeForm}
                disabled={saving}
              >
                <XCircle size={21} />
              </button>
            </div>

            <form
              onSubmit={addHealthMetric}
              className="health-form"
            >
              <div className="health-form-grid">
                <HealthInput
                  label="Heart Rate"
                  name="heart_rate"
                  value={form.heart_rate}
                  onChange={handleFormChange}
                  placeholder="e.g. 78"
                  unit="bpm"
                />

                <HealthInput
                  label="Systolic BP"
                  name="systolic_bp"
                  value={form.systolic_bp}
                  onChange={handleFormChange}
                  placeholder="e.g. 120"
                  unit="mmHg"
                />

                <HealthInput
                  label="Diastolic BP"
                  name="diastolic_bp"
                  value={form.diastolic_bp}
                  onChange={handleFormChange}
                  placeholder="e.g. 80"
                  unit="mmHg"
                />

                <HealthInput
                  label="Temperature"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleFormChange}
                  placeholder="e.g. 98.6"
                  unit="°F"
                  step="0.1"
                />

                <HealthInput
                  label="Oxygen Saturation"
                  name="oxygen_saturation"
                  value={form.oxygen_saturation}
                  onChange={handleFormChange}
                  placeholder="e.g. 98"
                  unit="%"
                  step="0.01"
                />

                <HealthInput
                  label="Respiratory Rate"
                  name="respiratory_rate"
                  value={form.respiratory_rate}
                  onChange={handleFormChange}
                  placeholder="e.g. 16"
                  unit="/min"
                />

                <HealthInput
                  label="Blood Glucose"
                  name="blood_glucose"
                  value={form.blood_glucose}
                  onChange={handleFormChange}
                  placeholder="e.g. 95"
                  unit="mg/dL"
                  step="0.01"
                />

                <HealthInput
                  label="Weight"
                  name="weight_kg"
                  value={form.weight_kg}
                  onChange={handleFormChange}
                  placeholder="e.g. 68"
                  unit="kg"
                  step="0.01"
                />
              </div>

              <label className="health-form-label">
                <span>Notes</span>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  placeholder="Add any additional information..."
                  rows="3"
                />
              </label>

              <div className="health-form-actions">
                <button
                  type="button"
                  className="secondary-health-btn"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-health-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={15}
                        className="health-metric-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />

                      Save Measurement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          STYLES
      ========================== */}
      <style>
        {`
          .health-alert {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 20px;
            padding: 13px 15px;
            border-radius: 10px;
            font-size: 13px;
          }

          .health-alert button {
            margin-left: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 0;
            background: transparent;
            cursor: pointer;
          }

          .health-alert.error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #b91c1c;
          }

          .health-alert.success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #15803d;
          }

          .health-metric-spin {
            animation:
              mednexus-health-spin
              1s linear infinite;
          }

          @keyframes mednexus-health-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .health-metric-grid {
            display: grid;
            grid-template-columns:
              repeat(4, minmax(0, 1fr));
            gap: 14px;
          }

          .metric-card {
            padding: 17px;
            border: 1px solid #e2e8f0;
            border-radius: 13px;
            background: #ffffff;
            transition: 0.2s ease;
          }

          .metric-card:hover {
            transform: translateY(-2px);
            box-shadow:
              0 8px 25px
              rgba(15, 23, 42, 0.06);
          }

          .metric-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .metric-icon {
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 11px;
          }

          .metric-icon.blue {
            background: #eff6ff;
            color: #2563eb;
          }

          .metric-icon.purple {
            background: #f5f3ff;
            color: #7c3aed;
          }

          .metric-icon.green {
            background: #ecfdf5;
            color: #059669;
          }

          .metric-icon.orange {
            background: #fff7ed;
            color: #ea580c;
          }

          .metric-icon.cyan {
            background: #ecfeff;
            color: #0891b2;
          }

          .metric-icon.pink {
            background: #fdf2f8;
            color: #db2777;
          }

          .metric-icon.indigo {
            background: #eef2ff;
            color: #4f46e5;
          }

          .metric-label {
            display: block;
            color: #94a3b8;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }

          .metric-value {
            margin-top: 8px;
            color: #1e293b;
            font-size: 23px;
            font-weight: 700;
          }

          .metric-value span {
            color: #64748b;
            font-size: 11px;
            font-weight: 500;
          }

          .latest-reading-card {
            display: flex;
            align-items: center;
            gap: 11px;
            padding: 17px;
            border-radius: 13px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }

          .latest-reading-icon {
            width: 42px;
            height: 42px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 11px;
            background: #eff6ff;
            color: #2563eb;
          }

          .latest-reading-card strong {
            display: block;
            margin-top: 5px;
            color: #475569;
            font-size: 12px;
          }

          .health-history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
          }

          .health-history-header h3 {
            margin: 0;
          }

          .health-history-count {
            min-width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9px;
            background: #eff6ff;
            color: #2563eb;
            font-size: 13px;
            font-weight: 700;
          }

          .health-history-list {
            display: grid;
            gap: 10px;
            margin-top: 18px;
          }

          .health-history-row {
            display: grid;
            grid-template-columns:
              1.2fr
              repeat(5, 1fr);
            gap: 10px;
            align-items: center;
            padding: 13px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #f8fafc;
          }

          .history-date strong {
            display: block;
            color: #334155;
            font-size: 11px;
          }

          .history-date span {
            display: block;
            margin-top: 3px;
            color: #94a3b8;
            font-size: 9px;
          }

          .history-value span {
            display: block;
            color: #94a3b8;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .history-value strong {
            display: block;
            margin-top: 3px;
            color: #475569;
            font-size: 11px;
          }

          .primary-health-btn,
          .secondary-health-btn {
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

          .primary-health-btn {
            margin-top: 16px;
            border: 0;
            background: #2563eb;
            color: #ffffff;
          }

          .primary-health-btn:hover {
            background: #1d4ed8;
          }

          .secondary-health-btn {
            border: 1px solid #e2e8f0;
            background: #ffffff;
            color: #475569;
          }

          .health-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(15, 23, 42, 0.45);
          }

          .health-modal {
            width: min(650px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            padding: 23px;
            border-radius: 16px;
            background: #ffffff;
            box-shadow:
              0 25px 70px
              rgba(15, 23, 42, 0.2);
          }

          .health-modal-header {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            margin-bottom: 20px;
          }

          .health-modal-header h2 {
            margin: 5px 0;
            color: #1e293b;
            font-size: 19px;
          }

          .health-modal-header p {
            margin: 0;
            color: #64748b;
            font-size: 11px;
          }

          .health-modal-close {
            width: 34px;
            height: 34px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 0;
            border-radius: 8px;
            background: #f8fafc;
            color: #64748b;
            cursor: pointer;
          }

          .health-form {
            display: grid;
            gap: 15px;
          }

          .health-form-grid {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 13px;
          }

          .health-form-label {
            display: grid;
            gap: 6px;
          }

          .health-form-label > span {
            color: #475569;
            font-size: 11px;
            font-weight: 600;
          }

          .health-form-label input,
          .health-form-label textarea {
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

          .health-form-label textarea {
            resize: vertical;
          }

          .health-form-label input:focus,
          .health-form-label textarea:focus {
            border-color: #93c5fd;
            box-shadow:
              0 0 0 3px #eff6ff;
          }

          .health-input-wrapper {
            position: relative;
          }

          .health-input-wrapper input {
            padding-right: 55px;
          }

          .health-input-unit {
            position: absolute;
            right: 11px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 10px;
            font-weight: 600;
            pointer-events: none;
          }

          .health-form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 9px;
            margin-top: 3px;
          }

          .health-form-actions .primary-health-btn {
            margin-top: 0;
          }

          .primary-health-btn:disabled,
          .secondary-health-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 1100px) {
            .health-metric-grid {
              grid-template-columns:
                repeat(3, minmax(0, 1fr));
            }

            .health-history-row {
              grid-template-columns:
                repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 800px) {
            .health-metric-grid {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 600px) {
            .health-metric-grid {
              grid-template-columns: 1fr;
            }

            .health-form-grid {
              grid-template-columns: 1fr;
            }

            .health-history-row {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }

            .welcome-row {
              flex-direction: column;
              align-items: flex-start;
            }
          }
        `}
      </style>
    </section>
  );
}

// =====================================================
// METRIC CARD
// =====================================================

function MetricCard({
  icon,
  title,
  value,
  unit,
  color,
}) {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <div className={`metric-icon ${color}`}>
          {icon}
        </div>
      </div>

      <span
        className="metric-label"
        style={{
          marginTop: "13px",
        }}
      >
        {title}
      </span>

      <div className="metric-value">
        {value}{" "}
        <span>{unit}</span>
      </div>
    </div>
  );
}

// =====================================================
// HEALTH INPUT
// =====================================================

function HealthInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  unit,
  step = "1",
}) {
  return (
    <label className="health-form-label">
      <span>{label}</span>

      <div className="health-input-wrapper">
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          step={step}
          min="0"
        />

        <span className="health-input-unit">
          {unit}
        </span>
      </div>
    </label>
  );
}

// =====================================================
// HISTORY ROW
// =====================================================

function HealthHistoryRow({ metric }) {
  return (
    <div className="health-history-row">
      <div className="history-date">
        <strong>
          {formatDate(metric.recorded_at)}
        </strong>

        <span>
          {formatTime(metric.recorded_at)}
        </span>
      </div>

      <HistoryValue
        label="Heart"
        value={
          metric.heart_rate !== null &&
          metric.heart_rate !== undefined
            ? `${metric.heart_rate} bpm`
            : "—"
        }
      />

      <HistoryValue
        label="BP"
        value={
          metric.systolic_bp !== null &&
          metric.systolic_bp !== undefined &&
          metric.diastolic_bp !== null &&
          metric.diastolic_bp !== undefined
            ? `${metric.systolic_bp}/${metric.diastolic_bp}`
            : "—"
        }
      />

      <HistoryValue
        label="SpO₂"
        value={
          metric.oxygen_saturation !== null &&
          metric.oxygen_saturation !== undefined
            ? `${metric.oxygen_saturation}%`
            : "—"
        }
      />

      <HistoryValue
        label="Temp"
        value={
          metric.temperature !== null &&
          metric.temperature !== undefined
            ? `${metric.temperature}°F`
            : "—"
        }
      />

      <HistoryValue
        label="Weight"
        value={
          metric.weight_kg !== null &&
          metric.weight_kg !== undefined
            ? `${metric.weight_kg} kg`
            : "—"
        }
      />
    </div>
  );
}

// =====================================================
// HISTORY VALUE
// =====================================================

function HistoryValue({ label, value }) {
  return (
    <div className="history-value">
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

// =====================================================
// DATE FORMAT
// =====================================================

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

// =====================================================
// TIME FORMAT
// =====================================================

function formatTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// =====================================================
// DATE + TIME FORMAT
// =====================================================

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default HealthMetrics;