import { useEffect, useState } from "react";
import {
  Pill,
  UserRound,
  CalendarDays,
  Clock3,
  RefreshCw,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to view your prescriptions.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/prescriptions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load prescriptions."
        );
      }

      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      console.error("Prescriptions error:", err);

      setError(
        err.message || "Unable to load prescriptions."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div
        className="welcome-row"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            minWidth: 0,
          }}
        >
          <span className="dashboard-eyebrow">
            Medication Management
          </span>

          <h1>Prescriptions</h1>

          <p>
            Review your prescribed medications, dosage
            instructions, and treatment details.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={loadPrescriptions}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            flexShrink: 0,
            background: "#eff6ff",
            color: "#2563eb",
            border: "1px solid #dbeafe",
          }}
        >
          <RefreshCw
            size={16}
            style={{
              animation: loading
                ? "mednexus-prescription-spin 1s linear infinite"
                : "none",
            }}
          />

          Refresh
        </button>
      </div>

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}
      {error && (
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
            lineHeight: 1.5,
            boxSizing: "border-box",
          }}
        >
          <AlertCircle
            size={18}
            style={{
              flexShrink: 0,
              marginTop: "1px",
            }}
          />

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          LOADING STATE
      ====================================================== */}
      {loading && (
        <div
          className="dashboard-card"
          style={{
            width: "100%",
            minHeight: "180px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            boxSizing: "border-box",
          }}
        >
          <RefreshCw
            size={30}
            style={{
              color: "#2563eb",
              animation:
                "mednexus-prescription-spin 1s linear infinite",
            }}
          />

          <p
            className="card-muted"
            style={{
              marginTop: "12px",
              marginBottom: 0,
            }}
          >
            Loading prescriptions...
          </p>
        </div>
      )}

      {/* =====================================================
          SUMMARY CARD
      ====================================================== */}
      {!loading && !error && (
        <div
          className="dashboard-card"
          style={{
            width: "100%",
            minHeight: "90px",
            marginBottom: "20px",
            padding: "20px 22px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            boxSizing: "border-box",
          }}
        >
          {/* Icon */}
          <div
            className="card-icon blue"
            style={{
              width: "50px",
              height: "50px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pill size={24} />
          </div>

          {/* Count */}
          <div
            style={{
              minWidth: "130px",
              paddingRight: "28px",
              borderRight: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                color: "#94a3b8",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              Total Prescriptions
            </div>

            <div
              style={{
                marginTop: "4px",
                color: "#0f172a",
                fontSize: "22px",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {prescriptions.length}
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              minWidth: 0,
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              Medication History
            </h3>

            <p
              className="card-muted"
              style={{
                marginTop: "4px",
                marginBottom: 0,
                fontSize: "12px",
              }}
            >
              Your prescribed medications are securely
              organized in one place.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      {!loading &&
        !error &&
        prescriptions.length === 0 && (
          <div
            className="dashboard-card"
            style={{
              width: "100%",
              minHeight: "250px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "45px 20px",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <div
              className="card-icon blue"
              style={{
                width: "54px",
                height: "54px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Pill size={26} />
            </div>

            <h3
              style={{
                marginTop: "16px",
                marginBottom: 0,
              }}
            >
              No prescriptions found
            </h3>

            <p
              className="card-muted"
              style={{
                marginTop: "7px",
                marginBottom: 0,
              }}
            >
              Your prescribed medications will appear here.
            </p>
          </div>
        )}

      {/* =====================================================
          PRESCRIPTION CARDS
      ====================================================== */}
      {!loading &&
        !error &&
        prescriptions.length > 0 && (
          <div
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "18px",
              alignItems: "stretch",
              boxSizing: "border-box",
            }}
          >
            {prescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
              />
            ))}
          </div>
        )}

      {/* =====================================================
          ANIMATION
      ====================================================== */}
      <style>
        {`
          @keyframes mednexus-prescription-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 700px) {
            .welcome-row {
              flex-direction: column !important;
            }
          }
        `}
      </style>
    </section>
  );
}

/* ============================================================
   PRESCRIPTION CARD
============================================================ */

function PrescriptionCard({ prescription }) {
  const medicine =
    prescription.medicine_name ||
    prescription.medication_name ||
    prescription.medicine ||
    prescription.name ||
    "Medication";

  const dosage =
    prescription.dosage ||
    prescription.dose ||
    "Not specified";

  const frequency =
    prescription.frequency ||
    prescription.instructions ||
    "As directed";

  const duration =
    prescription.duration ||
    "Not specified";

  const doctor =
    prescription.doctor_name ||
    prescription.doctor ||
    "Doctor not specified";

  const notes =
    prescription.notes ||
    prescription.instructions ||
    "";

  return (
    <article
      className="dashboard-card"
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* =====================================================
          MEDICINE HEADER
      ====================================================== */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
        }}
      >
        {/* Medicine Icon */}
        <div
          className="card-icon blue"
          style={{
            width: "50px",
            height: "50px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pill size={24} />
        </div>

        {/* Medicine Name */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "16px",
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {medicine}
          </h3>

          <p
            className="card-muted"
            style={{
              marginTop: "5px",
              marginBottom: 0,
              fontSize: "12px",
            }}
          >
            {dosage}
          </p>
        </div>
      </div>

      {/* =====================================================
          STATUS
      ====================================================== */}
      <div
        style={{
          marginTop: "14px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 10px",
            borderRadius: "999px",
            background: "#ecfdf5",
            color: "#15803d",
            fontSize: "10px",
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={13} />
          Prescribed
        </span>
      </div>

      {/* =====================================================
          DIVIDER
      ====================================================== */}
      <div
        style={{
          marginTop: "16px",
          borderTop: "1px solid #f1f5f9",
        }}
      />

      {/* =====================================================
          PRESCRIPTION INFORMATION
      ====================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          marginTop: "16px",
        }}
      >
        <InfoItem
          icon={<Clock3 size={15} />}
          label="Frequency"
          value={frequency}
        />

        <InfoItem
          icon={<CalendarDays size={15} />}
          label="Duration"
          value={duration}
        />

        <InfoItem
          icon={<UserRound size={15} />}
          label="Prescribed By"
          value={doctor}
        />
      </div>

      {/* =====================================================
          NOTES
      ====================================================== */}
      {notes && notes !== frequency && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginTop: "16px",
            padding: "11px 12px",
            borderRadius: "8px",
            background: "#f8fafc",
            color: "#64748b",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          <FileText
            size={15}
            style={{
              flexShrink: 0,
              marginTop: "1px",
            }}
          />

          <span>{notes}</span>
        </div>
      )}

      {/* =====================================================
          START DATE
      ====================================================== */}
      {prescription.start_date && (
        <p
          style={{
            marginTop: "14px",
            marginBottom: 0,
            color: "#94a3b8",
            fontSize: "10px",
          }}
        >
          Started:{" "}
          {formatDate(prescription.start_date)}
        </p>
      )}
    </article>
  );
}

/* ============================================================
   INFORMATION ITEM
============================================================ */

function InfoItem({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        minWidth: 0,
      }}
    >
      {/* Icon */}
      <div
        style={{
          color: "#2563eb",
          display: "flex",
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div
        style={{
          minWidth: 0,
        }}
      >
        <div
          style={{
            color: "#94a3b8",
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: "3px",
            color: "#475569",
            fontSize: "12px",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(date) {
  if (!date) {
    return "";
  }

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

export default Prescriptions;