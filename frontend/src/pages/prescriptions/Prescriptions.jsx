import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Pill,
  UserRound,
  CalendarDays,
  Clock3,
  RefreshCw,
  AlertCircle,
  FileText,
  CheckCircle2,
  ShoppingBag,
  Truck,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Stethoscope,
  Building2,
} from "lucide-react";

import API_BASE_URL from "../../config/api";

function Prescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Post-Treatment Recovery Check-In State
  const [recoveryState, setRecoveryState] = useState("pending"); // "pending" | "recovered" | "better" | "unwell"
  const [checkInDoctor, setCheckInDoctor] = useState("Dr. Vikram Patel");

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

      const response = await fetch(`${API_BASE_URL}/api/prescriptions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load prescriptions.");
      }

      const rxList = data.prescriptions || [];
      setPrescriptions(rxList);

      if (rxList.length > 0 && rxList[0].doctor_name) {
        setCheckInDoctor(rxList[0].doctor_name);
      }
    } catch (err) {
      console.error("Prescriptions error:", err);
      setError(err.message || "Unable to load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAllPharmacy = () => {
    if (prescriptions.length === 0) return;
    localStorage.setItem("mednexus_pharmacy_cart_items", JSON.stringify(prescriptions));
    navigate("/pharmacy/cart");
  };

  const handleOrderSinglePharmacy = (item) => {
    localStorage.setItem("mednexus_pharmacy_cart_items", JSON.stringify([item]));
    navigate("/pharmacy/cart");
  };

  const openApolloDirectApp = (specificItemName = null) => {
    let query = "";
    if (specificItemName) {
      query = specificItemName;
    } else if (prescriptions.length > 0) {
      query = prescriptions.map((p) => p.medicine_name).join(" ");
    } else {
      query = "Prescription Medicines";
    }

    const apolloUrl = `https://www.apollopharmacy.in/search-medicines/${encodeURIComponent(query)}`;
    window.open(apolloUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {/* PAGE HEADER */}
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
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span className="dashboard-eyebrow">Medication Management</span>
          <h1>Prescriptions</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>
            Review prescribed medications, order refills via Apollo Pharmacy, and track treatment recovery.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {prescriptions.length > 0 && (
            <>
              <button
                onClick={handleOrderAllPharmacy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
                }}
              >
                <Truck size={16} />
                Order via MedNexus Express
              </button>

              <button
                onClick={() => openApolloDirectApp()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: "#fff7ed",
                  color: "#c2410c",
                  border: "1px solid #fed7aa",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <ShoppingBag size={16} color="#f97316" />
                Launch Apollo Pharmacy App ↗
              </button>
            </>
          )}

          <button
            type="button"
            className="btn"
            onClick={loadPrescriptions}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              background: "#eff6ff",
              color: "#2563eb",
            }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* =====================================================
          EMPATHETIC POST-MEDICATION RECOVERY CHECK-IN BANNER
      ====================================================== */}
      <div
        style={{
          background: "#ffffff",
          color: "#0f172a",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#f5f3ff",
                border: "1px solid #ddd6fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <HeartHandshake size={24} color="#7c3aed" />
            </div>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#f3e8ff", color: "#7e22ce", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "800", marginBottom: "4px" }}>
                <Sparkles size={12} />
                AI POST-MEDICATION RECOVERY CHECK-IN
              </div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                How are you feeling after your medication course?
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                Checking in on your recovery for treatments prescribed by <b>{checkInDoctor}</b>.
              </p>
            </div>
          </div>
        </div>

        {/* INTERACTIVE RECOVERY OPTIONS */}
        <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setRecoveryState("recovered")}
            style={{
              background: recoveryState === "recovered" ? "#f0fdf4" : "white",
              border: `1px solid ${recoveryState === "recovered" ? "#86efac" : "#cbd5e1"}`,
              color: recoveryState === "recovered" ? "#15803d" : "#334155",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Smile size={16} /> Fully Recovered 😊
          </button>

          <button
            onClick={() => setRecoveryState("better")}
            style={{
              background: recoveryState === "better" ? "#fffbeb" : "white",
              border: `1px solid ${recoveryState === "better" ? "#fde68a" : "#cbd5e1"}`,
              color: recoveryState === "better" ? "#b45309" : "#334155",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Meh size={16} /> Much Better 🤔
          </button>

          <button
            onClick={() => setRecoveryState("unwell")}
            style={{
              background: recoveryState === "unwell" ? "#fef2f2" : "white",
              border: `1px solid ${recoveryState === "unwell" ? "#fca5a5" : "#cbd5e1"}`,
              color: recoveryState === "unwell" ? "#b91c1c" : "#334155",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Frown size={16} /> Still Unwell / Recurring 🤒
          </button>
        </div>

        {/* FEEDBACK RESPONSES */}
        {recoveryState === "recovered" && (
          <div style={{ marginTop: "14px", padding: "12px 16px", borderRadius: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: "13px", color: "#166534" }}>
            🎉 Wonderful news! We're glad you've made a full recovery. Continue maintaining healthy hydration and balanced nutrition.
          </div>
        )}

        {recoveryState === "unwell" && (
          <div style={{ marginTop: "14px", padding: "14px 18px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", fontSize: "13px", color: "#991b1b", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <b>We're sorry you're still experiencing symptoms.</b> Since your medication course has finished, an evaluation by your doctor is recommended to prevent complications.
            </div>
            <Link
              to="/appointments"
              style={{
                background: "#dc2626",
                color: "white",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Stethoscope size={14} />
              Book Follow-Up with {checkInDoctor}
            </Link>
          </div>
        )}
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && prescriptions.length === 0 && (
        <div className="dashboard-card" style={{ width: "100%", minHeight: "250px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "45px 20px", textAlign: "center" }}>
          <div className="card-icon blue" style={{ width: "54px", height: "54px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Pill size={26} />
          </div>
          <h3 style={{ marginTop: "16px", marginBottom: 0 }}>No prescriptions found</h3>
          <p className="card-muted" style={{ marginTop: "7px", marginBottom: 0 }}>
            Your doctor prescribed medications will appear here.
          </p>
        </div>
      )}

      {/* PRESCRIPTION CARDS */}
      {!loading && !error && prescriptions.length > 0 && (
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
          {prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              onOrderPharmacy={() => handleOrderSinglePharmacy(prescription)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   PRESCRIPTION CARD
============================================================ */

function PrescriptionCard({ prescription, onOrderPharmacy }) {
  const medicine = prescription.medicine_name || prescription.medication_name || "Medication";
  const dosage = prescription.dosage || "Not specified";
  const frequency = prescription.frequency || "As directed";
  const duration = prescription.duration || "Not specified";
  const doctor = prescription.doctor_name || "Doctor not specified";
  const notes = prescription.notes || prescription.instructions || "";

  return (
    <article className="dashboard-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Pill size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>{medicine}</h3>
              <span style={{ fontSize: "12px", color: "#64748b" }}>{dosage}</span>
            </div>
          </div>

          <span style={{ background: "#ecfdf5", color: "#15803d", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <CheckCircle2 size={12} /> Active
          </span>
        </div>

        <div style={{ marginTop: "14px", borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
          <div>
            <span style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", fontWeight: "700" }}>Frequency:</span>
            <div style={{ color: "#334155", fontWeight: "600" }}>{frequency}</div>
          </div>
          <div>
            <span style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", fontWeight: "700" }}>Duration:</span>
            <div style={{ color: "#334155", fontWeight: "600" }}>{duration}</div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", fontWeight: "700" }}>Prescribed By:</span>
            <div style={{ color: "#334155", fontWeight: "600" }}>Dr. {doctor}</div>
          </div>
        </div>

        {notes && (
          <div style={{ marginTop: "10px", padding: "8px 10px", background: "#f8fafc", borderRadius: "8px", fontSize: "12px", color: "#64748b" }}>
            💡 {notes}
          </div>
        )}
      </div>

      {/* PHARMACY ORDER BUTTONS */}
      <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <button
          onClick={onOrderPharmacy}
          style={{
            padding: "9px 10px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          <Truck size={14} />
          In-App (15% Off)
        </button>

        <a
          href={`https://www.apollopharmacy.in/search-medicines/${encodeURIComponent(medicine)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "9px 10px",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#c2410c",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "12px",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          <ShoppingBag size={14} color="#f97316" />
          Apollo App ↗
        </a>
      </div>
    </article>
  );
}

export default Prescriptions;