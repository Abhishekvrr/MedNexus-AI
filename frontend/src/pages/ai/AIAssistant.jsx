import { useState } from "react";
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
} from "lucide-react";

import API_BASE_URL from "../../config/api";

function AIAssistant() {
  const [symptoms, setSymptoms] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeHealth = async () => {
    const text = symptoms.trim();

    if (!text) {
      setError(
        "Please describe your symptoms or health concern first."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError(
        "Your login session was not found. Please login again."
      );
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ai/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            symptoms: text,
          }),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Request failed with status ${response.status}.`
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "The AI analysis could not be generated."
        );
      }

      const result = data?.analysis;

      if (!result) {
        throw new Error(
          "The server returned no AI analysis."
        );
      }

      /*
      -------------------------------------------------------
      IMPORTANT:
      Keep the structured AI object instead of converting it
      into raw JSON text.
      -------------------------------------------------------
      */

      if (typeof result === "string") {
        try {
          setAnalysis(JSON.parse(result));
        } catch {
          setAnalysis({
            summary: result,
          });
        }
      } else {
        setAnalysis(result);
      }
    } catch (err) {
      console.error("AI Assistant Error:", err);

      setError(
        err?.message ||
          "Unable to connect to the MedNexus AI service."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    analyzeHealth();
  };

  const handleExample = (text) => {
    setSymptoms(text);
    setError("");
    setAnalysis(null);
  };

  const clearConversation = () => {
    setSymptoms("");
    setAnalysis(null);
    setError("");
  };

  return (
    <section className="dashboard-content">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="welcome-row">
        <div>
          <span className="dashboard-eyebrow">
            MedNexus Intelligence
          </span>

          <h1>AI Health Assistant</h1>

          <p>
            Describe your health concern and MedNexus AI
            will analyze it using your available medical
            information.
          </p>
        </div>

        <div className="card-icon blue">
          <Bot size={26} />
        </div>
      </div>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <div
        className="dashboard-card"
        style={{
          marginTop: "24px",
          background:
            "linear-gradient(135deg, #eff6ff, #f8fafc)",
          border: "1px solid #dbeafe",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div className="card-icon blue">
            <Sparkles size={21} />
          </div>

          <div>
            <h3 style={{ margin: 0 }}>
              Personalized Health Analysis
            </h3>

            <p
              className="card-muted"
              style={{
                marginTop: "7px",
                lineHeight: 1.6,
              }}
            >
              Your symptoms are analyzed together with
              your available health metrics, medical
              records, lab reports, and prescriptions.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div
        className="dashboard-card"
        style={{
          marginTop: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            marginBottom: "12px",
          }}
        >
          <HeartPulse
            size={18}
            style={{ color: "#2563eb" }}
          />

          <h3 style={{ margin: 0 }}>
            What are you experiencing?
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={symptoms}
            onChange={(event) => {
              setSymptoms(event.target.value);
              setError("");
            }}
            placeholder="Example: I have been experiencing a mild headache and tiredness since yesterday..."
            rows={6}
            disabled={loading}
            style={{
              width: "100%",
              boxSizing: "border-box",
              resize: "vertical",
              padding: "15px",
              border: "1px solid #dbe3ec",
              borderRadius: "10px",
              outline: "none",
              fontSize: "14px",
              lineHeight: 1.6,
              fontFamily: "inherit",
              color: "#1e293b",
            }}
          />

          {/* EXAMPLES */}

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "12px",
            }}
          >
            <button
              type="button"
              className="ai-example-button"
              disabled={loading}
              onClick={() =>
                handleExample(
                  "I have a mild headache and feel tired since yesterday."
                )
              }
            >
              Mild headache
            </button>

            <button
              type="button"
              className="ai-example-button"
              disabled={loading}
              onClick={() =>
                handleExample(
                  "I have been feeling dizzy and weak occasionally."
                )
              }
            >
              Dizziness
            </button>

            <button
              type="button"
              className="ai-example-button"
              disabled={loading}
              onClick={() =>
                handleExample(
                  "I have a mild cough and sore throat."
                )
              }
            >
              Cough & sore throat
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "9px",
                marginTop: "16px",
                padding: "13px 15px",
                borderRadius: "9px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              <AlertCircle
                size={17}
                style={{
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              />

              <span>{error}</span>
            </div>
          )}

          {/* ACTIONS */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "18px",
            }}
          >
            {(symptoms || analysis) && (
              <button
                type="button"
                className="btn"
                disabled={loading}
                onClick={clearConversation}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                }}
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !symptoms.trim()}
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={17}
                    style={{
                      animation:
                        "mednexus-spin 1s linear infinite",
                    }}
                  />

                  Analyzing...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Analyze My Health
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================
          AI ANALYSIS RESULT
      ===================================================== */}

      {analysis && (
        <AIAnalysisResult analysis={analysis} />
      )}

      {/* =====================================================
          FEATURES
      ===================================================== */}

      {!analysis && !loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <FeatureCard
            icon={<HeartPulse size={20} />}
            title="Health Context"
            description="Uses your available health metrics to provide more relevant analysis."
          />

          <FeatureCard
            icon={<Bot size={20} />}
            title="AI Analysis"
            description="Your symptoms are processed by the MedNexus AI service."
          />

          <FeatureCard
            icon={<ShieldCheck size={20} />}
            title="Privacy First"
            description="Your request is connected to your authenticated patient account."
          />
        </div>
      )}

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>
        {`
          @keyframes mednexus-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .ai-example-button {
            border: 1px solid #dbeafe;
            background: #f8fafc;
            color: #475569;
            padding: 7px 11px;
            border-radius: 999px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .ai-example-button:hover {
            background: #eff6ff;
            color: #1d4ed8;
          }

          .ai-example-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
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

          .ai-list-bullet {
            flex-shrink: 0;
            margin-top: 4px;
          }

          .ai-doctor-card {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 11px;
          }

          .ai-doctor-icon {
            width: 42px;
            height: 42px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: #eff6ff;
            color: #2563eb;
          }

          .ai-urgency-card {
            border-radius: 12px;
            padding: 17px;
            border: 1px solid;
          }

          .ai-emergency-list {
            margin: 13px 0 0;
            padding-left: 20px;
            color: #7f1d1d;
            font-size: 13px;
            line-height: 1.7;
          }

          .ai-safety-note {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 14px 16px;
            margin-top: 18px;
            border-radius: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
            line-height: 1.6;
          }

          @media (max-width: 700px) {
            .ai-analysis-grid {
              grid-template-columns: 1fr;
            }

            .ai-analysis-section.full {
              grid-column: auto;
            }
          }
        `}
      </style>
    </section>
  );
}

/* ============================================================
   AI ANALYSIS COMPONENT
   ============================================================ */

function AIAnalysisResult({ analysis }) {
  const riskLevel =
    analysis?.risk_level || "moderate";

  const riskConfig = {
    low: {
      label: "Low Risk",
      icon: <CheckCircle2 size={18} />,
      background: "#f0fdf4",
      border: "#bbf7d0",
      color: "#15803d",
    },

    moderate: {
      label: "Moderate Risk",
      icon: <Activity size={18} />,
      background: "#fffbeb",
      border: "#fde68a",
      color: "#a16207",
    },

    high: {
      label: "High Risk",
      icon: <TriangleAlert size={18} />,
      background: "#fff7ed",
      border: "#fed7aa",
      color: "#c2410c",
    },

    emergency: {
      label: "Emergency",
      icon: <Siren size={18} />,
      background: "#fef2f2",
      border: "#fecaca",
      color: "#b91c1c",
    },
  };

  const risk =
    riskConfig[riskLevel] ||
    riskConfig.moderate;

  const found =
    Array.isArray(analysis?.what_i_found)
      ? analysis.what_i_found
      : [];

  const causes =
    Array.isArray(analysis?.possible_causes)
      ? analysis.possible_causes
      : [];

  const actions =
    Array.isArray(analysis?.what_you_can_do)
      ? analysis.what_you_can_do
      : [];

  const help =
    analysis?.when_to_get_help || {};

  const emergencySigns =
    Array.isArray(help?.emergency_signs)
      ? help.emergency_signs
      : [];

  return (
    <div
      className="dashboard-card"
      style={{
        marginTop: "20px",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {/* =====================================================
          RESULT HEADER
      ===================================================== */}

      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid #e2e8f0",
          background:
            "linear-gradient(135deg, #ffffff, #f8fafc)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "13px",
            }}
          >
            <div className="card-icon green">
              <Sparkles size={21} />
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "12px",
                  marginBottom: "3px",
                }}
              >
                MedNexus AI
              </span>

              <h3
                style={{
                  margin: 0,
                  color: "#0f172a",
                }}
              >
                Health Assessment
              </h3>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#15803d",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={16} />
            AI-assisted analysis
          </div>
        </div>

        {/* RISK STATUS */}

        <div
          style={{
            marginTop: "22px",
            padding: "17px",
            borderRadius: "12px",
            background: risk.background,
            border: `1px solid ${risk.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              color: risk.color,
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            {risk.icon}

            <span>
              {analysis?.risk_title ||
                risk.label}
            </span>
          </div>

          <div
            style={{
              marginTop: "6px",
              color: risk.color,
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {risk.label}
          </div>
        </div>
      </div>

      {/* =====================================================
          RESULT CONTENT
      ===================================================== */}

      <div style={{ padding: "22px" }}>
        <div className="ai-analysis-grid">

          {/* SUMMARY */}

          <div className="ai-analysis-section full">
            <div className="ai-section-title">
              <FileText
                size={18}
                style={{ color: "#2563eb" }}
              />

              Overall Summary
            </div>

            <p className="ai-section-text">
              {analysis?.summary ||
                "The available information should be reviewed with a healthcare professional."}
            </p>
          </div>

          {/* WHAT WE FOUND */}

          <div className="ai-analysis-section">
            <div className="ai-section-title">
              <Activity
                size={18}
                style={{ color: "#2563eb" }}
              />

              What We Found
            </div>

            {found.length > 0 ? (
              <ul className="ai-list">
                {found.map((item, index) => (
                  <li
                    key={index}
                    className="ai-list-item"
                  >
                    <CheckCircle2
                      size={15}
                      className="ai-list-bullet"
                      style={{
                        color: "#2563eb",
                      }}
                    />

                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ai-section-text">
                No additional observations were
                identified from the available
                information.
              </p>
            )}
          </div>

          {/* POSSIBLE CAUSES */}

          <div className="ai-analysis-section">
            <div className="ai-section-title">
              <Lightbulb
                size={18}
                style={{ color: "#d97706" }}
              />

              Possible Explanations
            </div>

            {causes.length > 0 ? (
              <ul className="ai-list">
                {causes.map((item, index) => (
                  <li
                    key={index}
                    className="ai-list-item"
                  >
                    <Lightbulb
                      size={15}
                      className="ai-list-bullet"
                      style={{
                        color: "#d97706",
                      }}
                    />

                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ai-section-text">
                There is not enough information to
                identify possible explanations.
              </p>
            )}
          </div>

          {/* WHAT YOU CAN DO */}

          <div className="ai-analysis-section full">
            <div className="ai-section-title">
              <CheckCircle2
                size={18}
                style={{ color: "#16a34a" }}
              />

              What You Can Do
            </div>

            {actions.length > 0 ? (
              <ul className="ai-list">
                {actions.map((item, index) => (
                  <li
                    key={index}
                    className="ai-list-item"
                  >
                    <CheckCircle2
                      size={15}
                      className="ai-list-bullet"
                      style={{
                        color: "#16a34a",
                      }}
                    />

                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ai-section-text">
                Consider discussing your symptoms
                with a healthcare professional.
              </p>
            )}
          </div>

          {/* DOCTOR RECOMMENDATION */}

          <div className="ai-analysis-section full">
            <div className="ai-section-title">
              <Stethoscope
                size={18}
                style={{ color: "#7c3aed" }}
              />

              Recommended Medical Care
            </div>

            <div className="ai-doctor-card">
              <div className="ai-doctor-icon">
                <Stethoscope size={21} />
              </div>

              <div>
                <div
                  style={{
                    color: "#0f172a",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}
                >
                  {analysis
                    ?.doctor_recommendation
                    ?.specialty ||
                    "General Physician"}
                </div>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  {analysis
                    ?.doctor_recommendation
                    ?.reason ||
                    "A healthcare professional can evaluate your symptoms and determine the appropriate next step."}
                </p>
              </div>
            </div>
          </div>

          {/* WHEN TO GET HELP */}

          <div className="ai-analysis-section full">
            <div className="ai-section-title">
              <Clock3
                size={18}
                style={{ color: "#dc2626" }}
              />

              When to Get Help
            </div>

            <div
              className="ai-urgency-card"
              style={{
                background:
                  help.urgency === "emergency"
                    ? "#fef2f2"
                    : help.urgency === "urgent"
                    ? "#fff7ed"
                    : "#f8fafc",

                borderColor:
                  help.urgency === "emergency"
                    ? "#fecaca"
                    : help.urgency === "urgent"
                    ? "#fed7aa"
                    : "#e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color:
                    help.urgency === "emergency"
                      ? "#b91c1c"
                      : help.urgency === "urgent"
                      ? "#c2410c"
                      : "#475569",
                }}
              >
                <AlertCircle size={16} />

                {help.urgency ||
                  "prompt"}
              </div>

              <p
                style={{
                  margin:
                    "9px 0 0",
                  color: "#475569",
                  fontSize: "13px",
                  lineHeight: 1.65,
                }}
              >
                {help.message ||
                  "Consider contacting a healthcare professional if your symptoms continue or become worse."}
              </p>

              {/* EMERGENCY SIGNS */}

              {emergencySigns.length >
                0 && (
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "14px",
                    borderTop:
                      "1px solid #fecaca",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      color: "#b91c1c",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    <Siren size={16} />

                    Seek urgent help if you
                    experience:
                  </div>

                  <ul className="ai-emergency-list">
                    {emergencySigns.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* REASONING */}

          {analysis?.reasoning && (
            <div className="ai-analysis-section full">
              <div className="ai-section-title">
                <Bot
                  size={18}
                  style={{ color: "#64748b" }}
                />

                How This Assessment Was Reached
              </div>

              <p className="ai-section-text">
                {analysis.reasoning}
              </p>
            </div>
          )}
        </div>

        {/* ===================================================
            SAFETY NOTE
        =================================================== */}

        <div className="ai-safety-note">
          <ShieldCheck
            size={17}
            style={{
              flexShrink: 0,
              marginTop: "1px",
            }}
          />

          <span>
            {analysis?.safety_note ||
              "MedNexus AI provides healthcare decision-support information and does not replace professional medical advice, diagnosis, or treatment."}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FEATURE CARD
   ============================================================ */

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="dashboard-card">
      <div className="card-icon blue">
        {icon}
      </div>

      <h3 style={{ marginTop: "14px" }}>
        {title}
      </h3>

      <p
        className="card-muted"
        style={{
          marginTop: "7px",
          lineHeight: 1.55,
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default AIAssistant;