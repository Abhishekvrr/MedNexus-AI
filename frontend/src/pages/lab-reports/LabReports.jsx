import { useEffect, useState } from "react";
import {
  FileText,
  CalendarDays,
  FlaskConical,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  Download,
  X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

function LabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to view your lab reports.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/lab-reports`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        setError("Your session has expired. Please login again.");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load lab reports."
        );
      }

      setReports(data.lab_reports || []);
    } catch (err) {
      console.error("Lab reports error:", err);
      setError(
        err.message || "Unable to load lab reports."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dashboard-section">
      <div className="welcome-row">
        <div>
          <span className="dashboard-eyebrow">
            Diagnostic Information
          </span>

          <h1>Lab Reports</h1>

          <p>
            View your laboratory test results and
            diagnostic reports.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={loadReports}
          disabled={loading}
          style={{
            background: "#eff6ff",
            color: "#2563eb",
            border: "1px solid #dbeafe",
          }}
        >
          <RefreshCw
            size={16}
            className={loading ? "lab-report-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="lab-report-alert">
          <AlertCircle size={18} />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

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
            size={28}
            className="lab-report-spin"
            style={{ color: "#2563eb" }}
          />

          <p
            className="card-muted"
            style={{ marginTop: "12px" }}
          >
            Loading lab reports...
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        reports.length === 0 && (
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
              style={{ margin: "0 auto" }}
            >
              <FlaskConical size={25} />
            </div>

            <h3 style={{ marginTop: "16px" }}>
              No lab reports found
            </h3>

            <p
              className="card-muted"
              style={{ marginTop: "7px" }}
            >
              Your laboratory reports will appear
              here when they are available.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        reports.length > 0 && (
          <div
            style={{
              display: "grid",
              gap: "15px",
              marginTop: "24px",
            }}
          >
            {reports.map((report) => (
              <LabReportCard
                key={report.id}
                report={report}
                onView={() =>
                  setSelectedReport(report)
                }
              />
            ))}
          </div>
        )}

      {selectedReport && (
        <LabReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      <style>{`
        .lab-report-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 24px;
          padding: 14px 16px;
          border-radius: 10px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 13px;
        }

        .lab-report-alert button {
          margin-left: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          color: #b91c1c;
          cursor: pointer;
        }

        .lab-report-card {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #ffffff;
          transition: 0.2s ease;
        }

        .lab-report-card:hover {
          border-color: #bfdbfe;
          box-shadow: 0 8px 25px rgba(15,23,42,0.06);
          transform: translateY(-1px);
        }

        .lab-report-icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #eff6ff;
          color: #2563eb;
        }

        .lab-report-main {
          flex: 1;
          min-width: 0;
        }

        .lab-report-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .lab-report-title {
          margin: 0;
          color: #1e293b;
          font-size: 15px;
          font-weight: 700;
        }

        .lab-report-subtitle {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .lab-report-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #15803d;
          font-size: 10px;
          font-weight: 700;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .lab-result-box {
          margin-top: 17px;
          padding: 15px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .lab-result-label {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .lab-result-value {
          margin-top: 5px;
          color: #1e293b;
          font-size: 22px;
          font-weight: 700;
        }

        .lab-result-unit {
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
        }

        .lab-report-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 14px;
        }

        .lab-report-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
        }

        .lab-view-btn,
        .lab-download-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
        }

        .lab-view-btn {
          border: 1px solid #dbeafe;
          background: #eff6ff;
          color: #2563eb;
        }

        .lab-download-btn {
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
        }

        .lab-notes {
          margin-top: 13px;
          margin-bottom: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .lab-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15,23,42,0.5);
        }

        .lab-modal {
          width: min(650px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          background: #fff;
        }

        .lab-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .lab-modal-header h2 {
          margin: 4px 0 0;
          color: #1e293b;
          font-size: 19px;
        }

        .lab-modal-header p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .lab-modal-close {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 8px;
          background: #f8fafc;
          color: #64748b;
          cursor: pointer;
        }

        .lab-modal-body {
          padding: 20px;
        }

        .lab-modal-result {
          padding: 20px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          text-align: center;
        }

        .lab-modal-result-label {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .lab-modal-result-value {
          margin-top: 8px;
          color: #1e293b;
          font-size: 32px;
          font-weight: 700;
        }

        .lab-modal-info {
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .lab-modal-info-item {
          padding: 12px;
          border-radius: 9px;
          background: #fff;
          border: 1px solid #e2e8f0;
        }

        .lab-modal-info-label {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .lab-modal-info-value {
          margin-top: 4px;
          color: #475569;
          font-size: 12px;
        }

        .lab-modal-notes {
          margin-top: 16px;
          padding: 13px;
          border-radius: 9px;
          background: #f8fafc;
          color: #64748b;
          font-size: 12px;
          line-height: 1.55;
        }

        .lab-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 16px 20px;
          border-top: 1px solid #f1f5f9;
        }

        .lab-report-spin {
          animation: mednexus-lab-spin 1s linear infinite;
        }

        @keyframes mednexus-lab-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 700px) {
          .lab-report-card {
            flex-direction: column;
          }

          .lab-report-top {
            flex-direction: column;
          }

          .lab-modal-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

function LabReportCard({ report, onView }) {
  const testName =
    report.test_name || "Laboratory Test";

  const result =
    report.result_value ?? "Not available";

  const unit = report.unit || "";
  const status = report.status || "normal";

  const reportDate = report.test_date;
  const doctor = report.doctor_name || "";

  const fileUrl = getReportFileUrl(report);

  return (
    <article className="lab-report-card">
      <div className="lab-report-icon">
        <FileText size={22} />
      </div>

      <div className="lab-report-main">
        <div className="lab-report-top">
          <div>
            <h3 className="lab-report-title">
              {testName}
            </h3>

            <p className="lab-report-subtitle">
              Laboratory Test Result
            </p>
          </div>

          <span className="lab-report-status">
            <CheckCircle2 size={13} />
            {status}
          </span>
        </div>

        <div className="lab-result-box">
          <div className="lab-result-label">
            Test Result
          </div>

          <div className="lab-result-value">
            {result}

            {unit && (
              <span className="lab-result-unit">
                {" "}
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className="lab-report-meta">
          {reportDate && (
            <InfoItem
              icon={<CalendarDays size={14} />}
              label="Date"
              value={formatDate(reportDate)}
            />
          )}

          {doctor && (
            <InfoItem
              icon={<FileText size={14} />}
              label="Doctor"
              value={doctor}
            />
          )}
        </div>

        {report.reference_range && (
          <p className="lab-notes">
            <strong>Reference range:</strong>{" "}
            {report.reference_range}
          </p>
        )}

        {report.notes && (
          <p className="lab-notes">
            <strong>Notes:</strong> {report.notes}
          </p>
        )}

        <div className="lab-report-actions">
          <button
            type="button"
            className="lab-view-btn"
            onClick={onView}
          >
            <Eye size={14} />
            View Report
          </button>

          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="lab-download-btn"
            >
              <Download size={14} />
              Download
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function LabReportModal({ report, onClose }) {
  const testName =
    report.test_name || "Laboratory Test";

  const result =
    report.result_value ?? "Not available";

  const unit = report.unit || "";
  const status = report.status || "normal";
  const fileUrl = getReportFileUrl(report);

  return (
    <div
      className="lab-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="lab-modal">
        <div className="lab-modal-header">
          <div>
            <span className="dashboard-eyebrow">
              Diagnostic Report
            </span>

            <h2>{testName}</h2>

            <p>
              Detailed laboratory test result
            </p>
          </div>

          <button
            type="button"
            className="lab-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="lab-modal-body">
          <div className="lab-modal-result">
            <div className="lab-modal-result-label">
              Test Result
            </div>

            <div className="lab-modal-result-value">
              {result}

              {unit && (
                <span
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {" "}
                  {unit}
                </span>
              )}
            </div>

            <div
              style={{
                marginTop: "8px",
                color: "#15803d",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {status}
            </div>
          </div>

          <div className="lab-modal-info">
            <InfoBox
              label="Test"
              value={testName}
            />

            <InfoBox
              label="Date"
              value={formatDate(report.test_date)}
            />

            <InfoBox
              label="Reference Range"
              value={
                report.reference_range ||
                "Not specified"
              }
            />

            <InfoBox
              label="Status"
              value={status}
            />
          </div>

          {report.notes && (
            <div className="lab-modal-notes">
              <strong>Notes:</strong>{" "}
              {report.notes}
            </div>
          )}
        </div>

        <div className="lab-modal-footer">
          <button
            type="button"
            className="lab-view-btn"
            onClick={onClose}
          >
            Close
          </button>

          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="lab-download-btn"
            >
              <Download size={14} />
              Download Report
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="lab-modal-info-item">
      <div className="lab-modal-info-label">
        {label}
      </div>

      <div className="lab-modal-info-value">
        {value}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#64748b",
        fontSize: "11px",
      }}
    >
      <span
        style={{
          color: "#2563eb",
          display: "flex",
        }}
      >
        {icon}
      </span>

      <strong>{label}:</strong>
      <span>{value}</span>
    </div>
  );
}

function getReportFileUrl(report) {
  const file = report.report_file_url || "";

  if (!file) return "";

  if (
    String(file).startsWith("http://") ||
    String(file).startsWith("https://")
  ) {
    return file;
  }

  return `${API_BASE_URL}/${String(file).replace(
    /^\/+/,
    ""
  )}`;
}

function formatDate(date) {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not specified";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default LabReports;