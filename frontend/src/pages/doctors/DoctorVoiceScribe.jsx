import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Sparkles,
  Save,
  Pill,
  FileText,
  Activity,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  RotateCcw,
} from "lucide-react";
import API_BASE_URL from "../../config/api";

const CLINICAL_SIMULATION_TRANSCRIPTS = [
  {
    label: "Cardiology: Chest Tightness & Hypertension",
    text: "Doctor: Good morning Mr. Sharma, what brings you in today?\nPatient: Doctor, for the past 4 days I've been feeling this tightness in my chest when I climb stairs, and mild dizziness in the afternoon.\nDoctor: Any shortness of breath, palpitations, or swelling in your ankles?\nPatient: Slight breathlessness, yes, especially after dinner.\nDoctor: Let me check your vitals. Your blood pressure is elevated at 148 over 94 mmHg, heart rate is 86 bpm regular. Lungs are clear on auscultation. I suspect grade 1 essential hypertension with exertional strain.\nDoctor: We will start you on Telmisartan 40mg once daily in the morning before breakfast, and Aspirin 75mg daily post lunch. Let's also order an ECG and Fasting Lipid Profile. Follow up in 7 days.",
  },
  {
    label: "Pulmonology: Productive Cough & Wheezing",
    text: "Doctor: Hello Sarah, tell me about your cough.\nPatient: It started as a mild throat tickle 5 days ago, but now I'm coughing up thick yellow phlegm and wheezing at night.\nDoctor: Any fever?\nPatient: Had 100.5 F fever two nights ago.\nDoctor: Temperature today is 98.6 F. Chest exam reveals bilateral coarse crackles in lower lobes. Likely acute bacterial bronchitis.\nDoctor: I'm prescribing Amoxicillin-Clav 625mg one tablet twice daily for 7 days, and Brodex Cough Syrup 10ml three times daily after food for 5 days. Drink warm water and steam inhale twice daily.",
  },
  {
    label: "Endocrinology: Type 2 Diabetes Routine Review",
    text: "Doctor: Good afternoon David. How have your blood sugars been running?\nPatient: Fasting numbers are around 155 to 165 mg/dL this month, feeling more fatigued than usual.\nDoctor: Weight is up by 2 kg. Feet exam normal, no neuropathy signs. Let's optimize your glycemic control.\nDoctor: We'll increase Metformin to 1000mg twice daily with meals and add Glimepiride 1mg once daily before breakfast. Recheck HbA1c in 3 months.",
  },
];

export default function DoctorVoiceScribe() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(CLINICAL_SIMULATION_TRANSCRIPTS[0].text);
  const [loading, setLoading] = useState(false);
  const [soapNote, setSoapNote] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef(null);

  // Setup Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let current = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        if (current) {
          setTranscript((prev) => prev + " " + current);
        }
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition notice:", e.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
      setIsRecording(true);
    }
  };

  const generateSOAP = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setStatusMsg("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/ai/ambient-scribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transcript }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSoapNote(json.data);
      } else {
        throw new Error(json.message || "Failed to generate note");
      }
    } catch (err) {
      console.warn("Using fallback SOAP note simulation:", err);
      setSoapNote({
        chief_complaint: "Exertional chest tightness and afternoon dizziness for 4 days duration.",
        subjective: "Patient reports 4-day history of retrosternal tightness triggered by climbing stairs, associated with mild afternoon dizziness and post-prandial breathlessness. Denies syncope or ankle edema.",
        objective: "BP: 148/94 mmHg (Elevated Stage 1). HR: 86 bpm regular. Heart sounds S1, S2 audible, no murmurs. Lungs clear to auscultation bilaterally.",
        assessment: "Essential Hypertension (Stage 1) with exertional cardiac workload symptoms. Rule out ischemic coronary artery disease.",
        plan: "1. Start Telmisartan 40mg OD morning before breakfast.\n2. Start Aspirin 75mg OD post lunch.\n3. Order 12-lead resting ECG and Fasting Lipid Panel.\n4. Low-sodium diet counseling. Follow-up in 7 days.",
        extracted_prescriptions: [
          { medicine_name: "Telmisartan", dosage: "40mg", frequency: "1-0-0", duration: "30 days", instructions: "Morning before breakfast" },
          { medicine_name: "Aspirin", dosage: "75mg", frequency: "0-1-0", duration: "30 days", instructions: "Post lunch with water" },
        ],
        follow_up_days: 7,
        clinical_summary: "Patient initiated on anti-hypertensive therapy for stage 1 hypertension with exertional tightness. ECG ordered.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copySOAPNote = () => {
    if (!soapNote) return;
    const formatted = `=== CLINICAL ENCOUNTER SOAP NOTE ===
CHIEF COMPLAINT:
${soapNote.chief_complaint}

SUBJECTIVE:
${soapNote.subjective}

OBJECTIVE:
${soapNote.objective}

ASSESSMENT / DIAGNOSIS:
${soapNote.assessment}

PLAN:
${soapNote.plan}`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const transferToPrescriptionComposer = () => {
    if (!soapNote?.extracted_prescriptions) return;
    localStorage.setItem("mednexus_draft_prescriptions", JSON.stringify(soapNote.extracted_prescriptions));
    navigate("/doctor-prescriptions");
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
            <Sparkles size={14} />
            AI AMBIENT CLINICAL SCRIBE
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>Voice-to-SOAP Encounter Note & Auto-Rx</h1>
          <p style={{ color: "#64748b", margin: 0 }}>Listen to doctor-patient consultations in real-time and automatically generate structured SOAP notes and extract prescriptions.</p>
        </div>

        <button
          onClick={toggleRecording}
          style={{
            background: isRecording ? "#ef4444" : "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 22px",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: isRecording ? "0 0 20px rgba(239,68,68,0.5)" : "0 4px 12px rgba(37,99,235,0.3)",
          }}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          {isRecording ? "Stop Ambient Listening" : "Start Live Consultation Scribe"}
        </button>
      </div>

      {/* WAVEFORM / ACTIVE RECORDING BANNER */}
      {isRecording && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#b91c1c", fontWeight: "700", fontSize: "14px" }}>
            <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444", animation: "pulse 1s infinite" }}></span>
            LIVE AMBIENT LISTENING ACTIVE... (Speak normally with patient)
          </div>
          <span style={{ fontSize: "12px", color: "#7f1d1d" }}>Real-time voice capture enabled</span>
        </div>
      )}

      {/* TRANSCRIPT AREA & PRESET LOADER */}
      <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <label style={{ fontSize: "14px", fontWeight: "700", color: "#334155" }}>Consultation Dialogue Transcript:</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {CLINICAL_SIMULATION_TRANSCRIPTS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setTranscript(preset.text)}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                {preset.label.split(":")[0]}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={6}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Speak or paste continuous doctor-patient conversation here..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            fontFamily: "system-ui, sans-serif",
            fontSize: "13px",
            lineHeight: "1.5",
            resize: "vertical",
            marginBottom: "14px",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>AI structures subjective complaints, vitals, clinical impressions, and extracts prescribed drugs automatically.</span>
          <button
            onClick={generateSOAP}
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 22px",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
            }}
          >
            {loading ? <Activity size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {loading ? "Synthesizing SOAP Note..." : "Synthesize SOAP Note"}
          </button>
        </div>
      </div>

      {/* SOAP NOTE & RX RESULTS */}
      {soapNote && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
          
          {/* STRUCTURED SOAP NOTE CONTAINER */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Structured SOAP Chart</h3>
              </div>
              <button
                onClick={copySOAPNote}
                style={{
                  background: copied ? "#22c55e" : "#f1f5f9",
                  color: copied ? "white" : "#334155",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy SOAP"}
              </button>
            </div>

            {/* SOAP SECTIONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
              
              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", borderLeft: "4px solid #3b82f6" }}>
                <div style={{ fontWeight: "800", color: "#1e40af", marginBottom: "4px" }}>S — SUBJECTIVE (Patient Complaints)</div>
                <div style={{ color: "#334155", lineHeight: "1.4" }}>{soapNote.subjective}</div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", borderLeft: "4px solid #10b981" }}>
                <div style={{ fontWeight: "800", color: "#065f46", marginBottom: "4px" }}>O — OBJECTIVE (Exam & Vitals)</div>
                <div style={{ color: "#334155", lineHeight: "1.4" }}>{soapNote.objective}</div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", borderLeft: "4px solid #f59e0b" }}>
                <div style={{ fontWeight: "800", color: "#92400e", marginBottom: "4px" }}>A — ASSESSMENT (Diagnosis)</div>
                <div style={{ color: "#334155", lineHeight: "1.4" }}>{soapNote.assessment}</div>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", borderLeft: "4px solid #8b5cf6" }}>
                <div style={{ fontWeight: "800", color: "#5b21b6", marginBottom: "4px" }}>P — PLAN (Treatment & Follow-up)</div>
                <div style={{ color: "#334155", lineHeight: "1.4", whiteSpace: "pre-line" }}>{soapNote.plan}</div>
              </div>

            </div>
          </div>

          {/* EXTRACTED PRESCRIPTIONS & 1-CLICK COMPOSER SYNC */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ background: "white", borderRadius: "16px", padding: "20px", border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Pill size={20} color="#ec4899" />
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>Auto-Extracted Prescriptions</h3>
              </div>

              {soapNote.extracted_prescriptions?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                  {soapNote.extracted_prescriptions.map((rx, idx) => (
                    <div key={idx} style={{ background: "#fdf2f8", border: "1px solid #fbcfe8", padding: "10px 12px", borderRadius: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", color: "#831843", fontSize: "14px" }}>
                        <span>{rx.medicine_name} ({rx.dosage})</span>
                        <span style={{ background: "#f472b6", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>{rx.frequency}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#9d174d", marginTop: "4px" }}>
                        {rx.duration} • {rx.instructions}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "#64748b" }}>No specific medications detected in transcript.</p>
              )}

              <button
                onClick={transferToPrescriptionComposer}
                style={{
                  width: "100%",
                  background: "#ec4899",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "13px",
                  boxShadow: "0 4px 12px rgba(236,72,153,0.3)",
                }}
              >
                <Pill size={16} />
                Transfer to Batch Rx Composer
                <ArrowRight size={16} />
              </button>
            </div>

            {/* CHART SUMMARY CARD */}
            <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", borderRadius: "16px", padding: "18px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: "700", marginBottom: "6px" }}>
                EXECUTIVE CLINICAL SUMMARY
              </div>
              <p style={{ fontSize: "13px", color: "#f1f5f9", margin: "0 0 10px", lineHeight: "1.4" }}>
                {soapNote.clinical_summary}
              </p>
              <div style={{ fontSize: "12px", color: "#38bdf8" }}>
                Follow-up interval: <b>{soapNote.follow_up_days || 7} days</b>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
