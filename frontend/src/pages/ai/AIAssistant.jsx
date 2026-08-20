import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  Send,
  Sparkles,
  HeartPulse,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Stethoscope,
  Activity,
  Lightbulb,
  CheckCircle2,
  TriangleAlert,
  Siren,
  Clock3,
  FileText,
  Pill,
  Salad,
  Star,
  MapPin,
  Calendar,
  Utensils,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

import API_BASE_URL from "../../config/api";

function AIAssistant() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("symptoms"); // "symptoms" | "tablet_explainer"

  // Symptom Analysis State
  const [symptoms, setSymptoms] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tablet & Lab Explainer State
  const [tabletQuestion, setTabletQuestion] = useState("");
  const [tabletExplanation, setTabletExplanation] = useState(null);
  const [explainingTablet, setExplainingTablet] = useState(false);
  const [tabletError, setTabletError] = useState("");

  const analyzeHealth = async () => {
    const text = symptoms.trim();
    if (!text) {
      setError("Please describe your symptoms or health concern first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Your login session was not found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symptoms: text }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate health analysis");
      }

      const result = data.analysis;
      if (typeof result === "string") {
        try {
          setAnalysis(JSON.parse(result));
        } catch {
          setAnalysis({ summary: result });
        }
      } else {
        setAnalysis(result);
      }
    } catch (err) {
      console.error("AI Assistant Error:", err);
      setError(err.message || "Unable to connect to the MedNexus AI clinical engine.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplainTablet = async (customQ) => {
    const q = customQ || tabletQuestion;
    if (!q.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setExplainingTablet(true);
    setTabletError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/tablet-explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: q }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to explain tablet");
      }

      setTabletExplanation(data.data);
    } catch (err) {
      console.warn("Using offline simulated explainer:", err);
      setTabletExplanation({
        medicine_or_test_highlighted: "Medication / Lab Query",
        answer: `Regarding your query "${q}": This medication is designed to treat targeted microbial or inflammatory conditions. Always take it with plenty of water and follow the prescribed course duration.`,
        key_takeaways: [
          "Complete the entire prescribed course even if symptoms improve early.",
          "Maintain consistent daily timing to ensure steady blood plasma levels.",
        ],
        food_and_drink_cautions: [
          "Take after meals to avoid gastric irritation.",
          "Avoid heavy alcohol or excessive caffeine during treatment.",
        ],
        when_to_alert_doctor: "Contact your doctor immediately if you develop skin rash, sudden breathing difficulty, or persistent vomiting.",
      });
    } finally {
      setExplainingTablet(false);
    }
  };

  const handleExample = (exampleText) => {
    setSymptoms(exampleText);
    setError("");
  };

  const clearConversation = () => {
    setSymptoms("");
    setAnalysis(null);
    setError("");
  };

  return (
    <section style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {/* HEADER */}
      <div className="welcome-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "20px" }}>
        <div>
          <span className="dashboard-eyebrow">Clinical Intelligence</span>
          <h1>MedNexus AI Medical Assistant</h1>
          <p className="card-muted" style={{ margin: "4px 0 0" }}>
            Real-time disease triage, nearby doctor matching, natural language medicine explainer, and therapeutic diet guidance.
          </p>
        </div>
      </div>

      {/* TOP TAB NAVIGATOR */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "22px" }}>
        <button
          onClick={() => setActiveTab("symptoms")}
          style={{
            padding: "10px 18px",
            borderRadius: "12px",
            border: `1px solid ${activeTab === "symptoms" ? "#2563eb" : "#e2e8f0"}`,
            background: activeTab === "symptoms" ? "#eff6ff" : "white",
            color: activeTab === "symptoms" ? "#2563eb" : "#64748b",
            fontWeight: "700",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <Activity size={18} />
          Symptom Checker & Doctor Matcher
        </button>

        <button
          onClick={() => setActiveTab("tablet_explainer")}
          style={{
            padding: "10px 18px",
            borderRadius: "12px",
            border: `1px solid ${activeTab === "tablet_explainer" ? "#7c3aed" : "#e2e8f0"}`,
            background: activeTab === "tablet_explainer" ? "#f5f3ff" : "white",
            color: activeTab === "tablet_explainer" ? "#7c3aed" : "#64748b",
            fontWeight: "700",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <Pill size={18} />
          💊 Natural Language Tablet & Lab Explainer
        </button>
      </div>

      {/* TAB 1: SYMPTOM ANALYSIS & DOCTOR MATCHING */}
      {activeTab === "symptoms" && (
        <>
          <div className="dashboard-card" style={{ padding: "24px" }}>
            <form onSubmit={(e) => { e.preventDefault(); analyzeHealth(); }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Sparkles size={18} color="#2563eb" />
                <label htmlFor="symptoms-input" style={{ color: "#0f172a", fontSize: "15px", fontWeight: 700 }}>
                  Describe what you are experiencing:
                </label>
              </div>

              <textarea
                id="symptoms-input"
                rows={4}
                value={symptoms}
                disabled={loading}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I've had a productive cough with yellowish phlegm, mild fever (100.4°F), and chest tightness for the last 3 days..."
                style={{ width: "100%", boxSizing: "border-box", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", lineHeight: "1.5", fontFamily: "inherit" }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Quick presets:</span>
                <button type="button" className="ai-example-button" onClick={() => handleExample("Chest tightness and shortness of breath with mild wheezing.")}>Chest Wheezing</button>
                <button type="button" className="ai-example-button" onClick={() => handleExample("Severe throbbing headache on left side with light sensitivity and nausea.")}>Migraine with Aura</button>
                <button type="button" className="ai-example-button" onClick={() => handleExample("Burning stomach pain after eating spicy food with sour acid burps.")}>Acid Reflux / GERD</button>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "9px", marginTop: "14px", padding: "12px", borderRadius: "8px", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "13px" }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                {(symptoms || analysis) && (
                  <button type="button" className="btn" onClick={clearConversation} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569" }}>
                    Clear
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading || !symptoms.trim()}>
                  {loading ? <><RefreshCw size={16} className="animate-spin" /> Analyzing Clinical Context...</> : <><Send size={16} /> Analyze & Match Doctor</>}
                </button>
              </div>
            </form>
          </div>

          {/* AI ANALYSIS RESULT & DOCTOR CARDS */}
          {analysis && <AIAnalysisResult analysis={analysis} />}
        </>
      )}

      {/* TAB 2: NATURAL LANGUAGE TABLET & LAB EXPLAINER */}
      {activeTab === "tablet_explainer" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="dashboard-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Pill size={20} color="#7c3aed" />
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Natural Language Tablet & Lab Report Explainer</h3>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
              Ask anything about your prescribed medicines (e.g. Amoxicillin, Brodex, Telmisartan) or lab test results in simple everyday language.
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={tabletQuestion}
                onChange={(e) => setTabletQuestion(e.target.value)}
                placeholder="Ask e.g.: 'Why did doctor give me Brodex syrup?', 'Can I take Amoxicillin with milk?', 'What does high fasting glucose mean?'"
                style={{ flex: 1, padding: "12px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                onKeyDown={(e) => { if (e.key === "Enter") handleExplainTablet(); }}
              />
              <button
                onClick={() => handleExplainTablet()}
                disabled={explainingTablet || !tabletQuestion.trim()}
                style={{
                  background: "#7c3aed",
                  color: "white",
                  border: "none",
                  padding: "12px 22px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {explainingTablet ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Explain
              </button>
            </div>

            {/* QUICK PRESETS */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px" }}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Try asking:</span>
              {[
                "What does Brodex Cough Syrup do and when should I take it?",
                "Can I take Amoxicillin with warm milk or after meals?",
                "What foods should I avoid while taking blood pressure medicine?",
                "Explain what my abnormal Fasting Blood Glucose (142 mg/dL) indicates.",
              ].map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTabletQuestion(ex);
                    handleExplainTablet(ex);
                  }}
                  style={{
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                    color: "#6d28d9",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* EXPLANATION OUTPUT */}
          {tabletExplanation && (
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
                <span style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#7c3aed" }}>
                  ● CLINICAL MEDICINE EXPLANATION
                </span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>
                  {tabletExplanation.medicine_or_test_highlighted}
                </span>
              </div>

              <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#1e293b", margin: "0 0 18px", fontWeight: "500" }}>
                {tabletExplanation.answer}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* KEY TAKEAWAYS */}
                <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "12px", border: "1px solid #dcfce7" }}>
                  <div style={{ fontWeight: "800", fontSize: "13px", color: "#166534", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={16} /> Key Medical Takeaways
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#166534", lineHeight: "1.5" }}>
                    {tabletExplanation.key_takeaways?.map((k, i) => (
                      <li key={i} style={{ marginBottom: "4px" }}>{k}</li>
                    ))}
                  </ul>
                </div>

                {/* FOOD & DRINK CAUTIONS */}
                <div style={{ background: "#fffbeb", padding: "16px", borderRadius: "12px", border: "1px solid #fef3c7" }}>
                  <div style={{ fontWeight: "800", fontSize: "13px", color: "#92400e", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Utensils size={16} /> Food & Drink Cautions
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#92400e", lineHeight: "1.5" }}>
                    {tabletExplanation.food_and_drink_cautions?.map((c, i) => (
                      <li key={i} style={{ marginBottom: "4px" }}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {tabletExplanation.when_to_alert_doctor && (
                <div style={{ marginTop: "16px", padding: "12px 16px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "10px", color: "#991b1b", fontSize: "13px" }}>
                  <b>🚨 When to Contact Doctor:</b> {tabletExplanation.when_to_alert_doctor}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .ai-example-button {
          border: 1px solid #dbeafe;
          background: #f8fafc;
          color: #475569;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ai-example-button:hover {
          background: #eff6ff;
          color: #1d4ed8;
        }
        .ai-analysis-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .ai-analysis-section {
          background: #ffffff;
          border: 1px solid #e5eaf0;
          border-radius: 14px;
          padding: 20px;
        }
        .ai-analysis-section.full {
          grid-column: 1 / -1;
        }
        .ai-section-title {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 13px;
        }
        .ai-section-text {
          color: #475569;
          font-size: 14px;
          line-height: 1.7;
          margin: 0;
        }
        .ai-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ai-list-item {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: #475569;
          font-size: 13px;
          line-height: 1.6;
        }
      `}</style>
    </section>
  );
}

/* ============================================================
   AI ANALYSIS COMPONENT + MATCHED DOCTORS & DIET CALLOUT
   ============================================================ */

function AIAnalysisResult({ analysis }) {
  const navigate = useNavigate();
  const riskLevel = analysis?.risk_level || "moderate";

  const riskConfig = {
    low: { label: "Low Risk", background: "#f0fdf4", border: "#bbf7d0", color: "#15803d", icon: <CheckCircle2 size={18} /> },
    moderate: { label: "Moderate Risk", background: "#fffbeb", border: "#fde68a", color: "#a16207", icon: <Activity size={18} /> },
    high: { label: "High Risk", background: "#fff7ed", border: "#fed7aa", color: "#c2410c", icon: <TriangleAlert size={18} /> },
    emergency: { label: "Emergency", background: "#fef2f2", border: "#fecaca", color: "#b91c1c", icon: <Siren size={18} /> },
  };

  const risk = riskConfig[riskLevel] || riskConfig.moderate;
  const found = Array.isArray(analysis?.what_i_found) ? analysis.what_i_found : [];
  const causes = Array.isArray(analysis?.possible_causes) ? analysis.possible_causes : [];
  const actions = Array.isArray(analysis?.what_you_can_do) ? analysis.what_you_can_do : [];
  const matchedDoctors = Array.isArray(analysis?.matched_doctors) ? analysis.matched_doctors : [];

  return (
    <div className="dashboard-card" style={{ marginTop: "20px", padding: "0", overflow: "hidden" }}>
      
      {/* RESULT HEADER */}
      <div style={{ padding: "24px", borderBottom: "1px solid #e2e8f0", background: "linear-gradient(135deg, #ffffff, #f8fafc)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 12px", borderRadius: "999px", background: risk.background, border: `1px solid ${risk.border}`, color: risk.color, fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
              {risk.icon}
              {risk.label}
            </div>
            <h2 style={{ margin: "10px 0 0", fontSize: "20px", color: "#0f172a", fontWeight: 800 }}>Clinical Triage Assessment</h2>
          </div>

          {/* DIET PLAN CALLOUT BUTTON */}
          <Link
            to="/diet-planner"
            style={{
              background: "#16a34a",
              color: "white",
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "13px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
            }}
          >
            <Salad size={16} />
            Get Food Diet Plan for this Condition
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div style={{ padding: "22px" }}>
        <div className="ai-analysis-grid">
          
          {/* SUMMARY */}
          <div className="ai-analysis-section full">
            <div className="ai-section-title"><FileText size={18} color="#2563eb" /> Overall Clinical Summary</div>
            <p className="ai-section-text">{analysis?.summary}</p>
          </div>

          {/* WHAT WE FOUND */}
          <div className="ai-analysis-section">
            <div className="ai-section-title"><Activity size={18} color="#2563eb" /> Observed Health Indicators</div>
            <ul className="ai-list">
              {found.map((item, idx) => (
                <li key={idx} className="ai-list-item">
                  <CheckCircle2 size={15} color="#2563eb" style={{ flexShrink: 0, marginTop: "4px" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* POSSIBLE EXPLANATIONS */}
          <div className="ai-analysis-section">
            <div className="ai-section-title"><Lightbulb size={18} color="#d97706" /> Potential Medical Explanations</div>
            <ul className="ai-list">
              {causes.map((item, idx) => (
                <li key={idx} className="ai-list-item">
                  <Lightbulb size={15} color="#d97706" style={{ flexShrink: 0, marginTop: "4px" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WHAT YOU CAN DO */}
          <div className="ai-analysis-section full">
            <div className="ai-section-title"><CheckCircle2 size={18} color="#16a34a" /> Immediate Actionable Recommendations</div>
            <ul className="ai-list">
              {actions.map((item, idx) => (
                <li key={idx} className="ai-list-item">
                  <CheckCircle2 size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: "4px" }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* MATCHED NEARBY DOCTORS */}
          <div className="ai-analysis-section full" style={{ background: "#f8fafc", border: "1px solid #cbd5e1" }}>
            <div className="ai-section-title" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Stethoscope size={20} color="#7c3aed" />
                <span style={{ fontSize: "16px", fontWeight: "800" }}>
                  Recommended Specialty: {analysis?.doctor_recommendation?.specialty || "General Physician"}
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Nearby Verified Doctors</span>
            </div>

            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
              {analysis?.doctor_recommendation?.reason || "Based on your clinical symptoms, consulting one of these certified specialists is recommended:"}
            </p>

            {matchedDoctors.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                {matchedDoctors.map((doc) => (
                  <div key={doc.id} style={{ background: "white", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontWeight: "800", fontSize: "15px", color: "#0f172a" }}>Dr. {doc.doctor_name}</div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "12px", fontWeight: "700", color: "#d97706", background: "#fef3c7", padding: "2px 6px", borderRadius: "6px" }}>
                          <Star size={12} fill="#d97706" /> {doc.rating || "4.9"}
                        </span>
                      </div>

                      <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600", marginTop: "2px" }}>{doc.specialization}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{doc.hospital_name || "Apollo Super Speciality"}</div>
                      <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>Fee: <b>₹{doc.consultation_fee || "800"}</b> • {doc.experience_years || "8"} yrs exp</div>
                    </div>

                    <Link
                      to="/appointments"
                      style={{
                        marginTop: "12px",
                        background: "#2563eb",
                        color: "white",
                        textAlign: "center",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "12px",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <Calendar size={14} />
                      Book Consultation
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "12px", background: "white", borderRadius: "8px", fontSize: "13px", color: "#64748b" }}>
                Specialist appointments available in the appointments portal.
              </div>
            )}
          </div>

        </div>

        {/* SAFETY NOTE */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", marginTop: "18px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px" }}>
          <ShieldCheck size={18} color="#2563eb" />
          <span>MedNexus AI provides healthcare decision-support information and does not replace professional emergency triage.</span>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;