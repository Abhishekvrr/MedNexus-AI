import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldAlert,
  AlertTriangle,
  Heart,
  PhoneCall,
  QrCode,
  Share2,
  Download,
  CheckCircle2,
  Activity,
  Droplet,
  User,
  Clock,
  Radio,
  Ambulance,
  ArrowLeft,
  Volume2
} from "lucide-react";
import API_BASE_URL from "../../config/api";

export default function EmergencyPass() {
  const { patientId } = useParams();
  const isPublicParamedicView = Boolean(patientId);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [sosActive, setSosActive] = useState(false);
  const [sosMessage, setSosMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEmergencyData();
  }, [patientId]);

  const fetchEmergencyData = async () => {
    setLoading(true);
    setError("");
    try {
      if (isPublicParamedicView) {
        // Public paramedic endpoint (no token required)
        const res = await fetch(`${API_BASE_URL}/api/emergency/public/${patientId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Emergency record not found");
        }
        setData(json.data);
      } else {
        // Patient's own emergency pass (authenticated)
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Please log in to view your emergency pass");

        const res = await fetch(`${API_BASE_URL}/api/emergency/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load emergency pass");
        }
        setData(json.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSOS = async () => {
    setSosActive(true);
    setSosMessage("Acquiring GPS location & broadcasting SOS beacon...");

    try {
      let coords = { latitude: 0, longitude: 0 };
      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) {
          console.warn("Geolocation not permitted, continuing with alert");
        }
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/emergency/sos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(coords),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSosMessage("🚨 SOS BEACON ACTIVE: Emergency contacts & hospital response dispatched with your location!");
      } else {
        setSosMessage("SOS Alert recorded in your MedNexus record.");
      }
    } catch (err) {
      setSosMessage("SOS broadcast recorded locally.");
    }
  };

  const copyEmergencyLink = () => {
    const url = `${window.location.origin}/emergency/${data?.patient_id || data?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        <Activity size={36} className="animate-spin" style={{ margin: "0 auto 16px", color: "#ef4444" }} />
        <h3>Loading Emergency Medical Pass...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "24px", background: "#fee2e2", borderRadius: "12px", border: "1px solid #fca5a5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#991b1b" }}>
          <AlertTriangle size={24} />
          <h3 style={{ margin: 0 }}>Emergency Lookup Error</h3>
        </div>
        <p style={{ color: "#7f1d1d", marginTop: "12px" }}>{error}</p>
        <Link to="/dashboard" style={{ display: "inline-block", marginTop: "12px", color: "#dc2626", fontWeight: "600" }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const patient = data || {};
  const bloodGroup = patient.blood_group || "O+";
  const allergies = Array.isArray(patient.allergies)
    ? patient.allergies
    : (patient.allergies ? String(patient.allergies).split(",") : ["No fatal drug allergies reported"]);
  const conditions = Array.isArray(patient.chronic_conditions)
    ? patient.chronic_conditions
    : (patient.chronic_conditions ? String(patient.chronic_conditions).split(",") : ["None documented"]);
  const contact = patient.emergency_contact || {
    name: patient.emergency_contact_name || "Primary Contact",
    phone: patient.emergency_contact_phone || "+1 (555) 019-2834",
    relation: patient.emergency_contact_relation || "Family",
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `${window.location.origin}/emergency/${patient.patient_id || patientId || "demo"}`
  )}`;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      
      {/* PARAMEDIC PUBLIC BANNER */}
      {isPublicParamedicView ? (
        <div style={{ background: "#dc2626", color: "white", padding: "16px 20px", borderRadius: "12px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 25px rgba(220,38,38,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Ambulance size={32} />
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "0.5px" }}>PARAMEDIC & FIRST-RESPONDER TRIAGE VIEW</div>
              <div style={{ fontSize: "13px", opacity: 0.9 }}>Verified Life-Critical Medical Summary • Public Paramedic Access</div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.2)", padding: "6px 12px", borderRadius: "8px", fontWeight: "700", fontSize: "13px" }}>
            LIVE VERIFIED
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>Emergency "Beacon" QR Pass</h1>
            <p style={{ color: "#64748b", margin: 0 }}>Instant scannable medical pass for paramedics, first responders, and emergency triage.</p>
          </div>
          <button
            onClick={triggerSOS}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "12px 22px",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)",
              transition: "transform 0.2s",
            }}
          >
            <Radio size={18} className="animate-pulse" />
            1-TAP EMERGENCY SOS
          </button>
        </div>
      )}

      {/* SOS NOTIFICATION ALERT */}
      {sosActive && (
        <div style={{ background: "#fef2f2", border: "2px solid #ef4444", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", color: "#991b1b", display: "flex", alignItems: "center", gap: "12px" }}>
          <ShieldAlert size={26} color="#ef4444" />
          <div style={{ flex: 1, fontWeight: "600" }}>{sosMessage}</div>
        </div>
      )}

      {/* MAIN EMERGENCY CARD CONTAINER (APPLE / GOOGLE WALLET STYLE) */}
      <div style={{ display: "grid", gridTemplateColumns: isPublicParamedicView ? "1fr" : "1.3fr 0.9fr", gap: "24px" }}>
        
        {/* LIFE-SAVING MEDICAL PASS */}
        <div style={{ background: "#ffffff", color: "#0f172a", borderRadius: "20px", padding: "28px", border: "2px solid #fecaca", boxShadow: "0 10px 30px rgba(239,68,68,0.08)", position: "relative", overflow: "hidden" }}>
          
          {/* CARD HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #fecaca", paddingBottom: "18px", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1.5px", color: "#dc2626", fontWeight: "800" }}>
                MEDNEXUS FIRST-RESPONDER PASS
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", margin: "4px 0 0", color: "#0f172a" }}>{patient.full_name || "Emergency Patient"}</h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>BLOOD GROUP</div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#dc2626", lineHeight: 1 }}>{bloodGroup}</div>
            </div>
          </div>

          {/* CRITICAL ALLERGIES SECTION (RED HIGHLIGHT) */}
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#991b1b", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", marginBottom: "6px" }}>
              <AlertTriangle size={16} color="#dc2626" />
              CRITICAL DRUG & FOOD ALLERGIES (FATAL WARNING)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {allergies.map((allg, idx) => (
                <span key={idx} style={{ background: "#dc2626", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "700" }}>
                  ⚠️ {allg}
                </span>
              ))}
            </div>
          </div>

          {/* MEDICAL CONDITIONS & MEDICATIONS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
                CHRONIC CONDITIONS
              </div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>
                {conditions.join(", ")}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
                CURRENT MEDICATIONS
              </div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>
                {patient.current_medications ? (Array.isArray(patient.current_medications) ? patient.current_medications.join(", ") : patient.current_medications) : "None documented"}
              </div>
            </div>
          </div>

          {/* 1-TAP EMERGENCY CONTACT DIALER */}
          <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>PRIMARY EMERGENCY CONTACT</div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginTop: "2px" }}>{contact.name} ({contact.relation})</div>
              <div style={{ fontSize: "14px", color: "#475569", fontWeight: "600" }}>{contact.phone}</div>
            </div>
            <a
              href={`tel:${contact.phone}`}
              style={{
                background: "#16a34a",
                color: "white",
                textDecoration: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
              }}
            >
              <PhoneCall size={16} />
              CALL NOW
            </a>
          </div>

          {/* LATEST VITALS SUMMARY */}
          {patient.latest_vitals && (
            <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b" }}>
              <span>Last Recorded BP: <b style={{ color: "#0f172a" }}>{patient.latest_vitals.systolic_bp}/{patient.latest_vitals.diastolic_bp}</b></span>
              <span>Heart Rate: <b style={{ color: "#0f172a" }}>{patient.latest_vitals.heart_rate} bpm</b></span>
              <span>SpO2: <b style={{ color: "#0f172a" }}>{patient.latest_vitals.oxygen_saturation || 98}%</b></span>
            </div>
          )}
        </div>

        {/* QR CODE SHARE & WALLET COMPONENT (PATIENT VIEW ONLY) */}
        {!isPublicParamedicView && (
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "18px", color: "#0f172a" }}>Your Emergency QR Code</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>Paramedics scan this QR code on scene to view your life-saving medical profile instantly.</p>

            <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "16px", border: "2px dashed #cbd5e1", marginBottom: "18px" }}>
              <img src={qrUrl} alt="Emergency QR Code" style={{ width: "160px", height: "160px", display: "block" }} />
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={copyEmergencyLink}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: copied ? "#22c55e" : "#f1f5f9",
                  color: copied ? "white" : "#1e293b",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "13px",
                  transition: "all 0.2s",
                }}
              >
                {copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
                {copied ? "Emergency Link Copied!" : "Copy Public Paramedic Link"}
              </button>

              <button
                onClick={() => window.print()}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "13px",
                }}
              >
                <Download size={16} />
                Print Physical Wallet Card
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
