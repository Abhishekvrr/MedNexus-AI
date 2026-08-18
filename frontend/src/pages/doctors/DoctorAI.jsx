import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  RefreshCw,
  Trash2,
  Stethoscope,
  CalendarDays,
  Pill,
  ShieldAlert,
  ClipboardList,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../../config/api";

function DoctorAI() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hello Doctor! I am your MedNexus AI Clinical Copilot. I have live access to your assigned patients registry, appointment schedules, and medical histories. How can I assist your clinical workflow today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const quickPrompts = [
    { label: "Patient Summary", text: "Show me patient details and current status for all my assigned patients.", icon: <User size={13} /> },
    { label: "Today's Schedule", text: "Summarize my appointments schedule and upcoming consultations.", icon: <CalendarDays size={13} /> },
    { label: "Drug Interactions", text: "Check drug interactions and safety profile between Metformin and Lisinopril.", icon: <Pill size={13} /> },
    { label: "Dosage Protocol", text: "What is the recommended dosage and duration of Amoxicillin-Clavulanate for adult acute sinusitis?", icon: <Stethoscope size={13} /> },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageToSend) => {
    const query = (messageToSend || inputMessage).trim();
    if (!query || loading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const userMsg = {
      type: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setLoading(true);

    try {
      // Build history
      const history = newMessages.slice(-6).map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const response = await fetch(`${API_BASE_URL}/api/ai/doctor-chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          history,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to receive AI clinical response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: data.reply || "No response received.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("Doctor AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: `⚠️ **Clinical Assistant Note:** ${err.message || "An error occurred while communicating with the AI service. Please try again."}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const clearChat = () => {
    setMessages([
      {
        type: "ai",
        text: "Conversation cleared. I am ready with your live clinical practice records and pharmacology database.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Helper to render basic markdown formatting
  const renderFormattedText = (text) => {
    if (!text) return null;

    return text.split("\n").map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return <h4 key={idx} style={{ margin: "10px 0 4px", fontSize: "15px", fontWeight: 700, color: "#1e293b" }}>{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} style={{ margin: "14px 0 6px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} style={{ margin: "16px 0 8px", fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{line.replace("# ", "")}</h2>;
      }

      // Bullet point
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const bulletContent = line.substring(2);
        return (
          <div key={idx} style={{ display: "flex", gap: "8px", margin: "3px 0", paddingLeft: "4px" }}>
            <span style={{ color: "#2563eb", fontWeight: 800 }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInline(bulletContent) }} />
          </div>
        );
      }

      // Horizontal line
      if (line.trim() === "---" || line.trim() === "***") {
        return <hr key={idx} style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />;
      }

      // Empty line
      if (!line.trim()) {
        return <div key={idx} style={{ height: "6px" }} />;
      }

      return (
        <p key={idx} style={{ margin: "3px 0", lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    });
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code style='background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;color:#0f172a;'>$1</code>");
  };

  return (
    <div className="doc-ai-container">
      {/* BULLETPROOF SCOPED CSS */}
      <style>{`
        .doc-ai-container {
          width: 100%;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          box-sizing: border-box;
          height: calc(100vh - 110px);
          display: flex;
          flex-direction: column;
        }

        .doc-ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 16px 22px;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          flex-shrink: 0;
        }

        .doc-ai-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .doc-ai-bot-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
        }

        .doc-ai-h1 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .doc-ai-badge {
          background: #eff6ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid #bfdbfe;
        }

        .doc-ai-sub {
          font-size: 12px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .doc-ai-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          padding: 7px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .doc-ai-clear-btn:hover {
          background: #fee2e2;
          color: #991b1b;
          border-color: #fca5a5;
        }

        /* CHAT WINDOW */
        .doc-ai-chat-window {
          flex: 1;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .doc-ai-messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .doc-msg-bubble-wrap {
          display: flex;
          gap: 12px;
          max-width: 85%;
        }

        .doc-msg-user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .doc-msg-ai {
          align-self: flex-start;
        }

        .doc-avatar-circle {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 700;
        }

        .avatar-doc {
          background: #0f172a;
          color: #ffffff;
        }

        .avatar-ai {
          background: linear-gradient(135deg, #2563eb, #6366f1);
          color: #ffffff;
        }

        .doc-msg-body {
          display: flex;
          flex-direction: column;
        }

        .doc-msg-content {
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
        }

        .content-user {
          background: #2563eb;
          color: #ffffff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
        }

        .content-ai {
          background: #f8fafc;
          color: #1e293b;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
        }

        .content-error {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #9f1239;
        }

        .doc-msg-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
          padding: 0 4px;
        }

        .copy-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.15s ease;
        }

        .copy-btn:hover {
          color: #2563eb;
        }

        /* QUICK PROMPT CHIPS */
        .doc-quick-chips {
          display: flex;
          gap: 8px;
          padding: 10px 20px;
          overflow-x: auto;
          border-top: 1px solid #f1f5f9;
          background: #fcfdfe;
          flex-shrink: 0;
        }

        .doc-chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .doc-chip-btn:hover {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #1d4ed8;
          transform: translateY(-1px);
        }

        /* INPUT BAR */
        .doc-input-bar-wrap {
          padding: 14px 20px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .doc-input-box {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
        }

        .doc-text-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #0f172a;
        }

        .doc-send-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .doc-send-btn:hover:not(:disabled) {
          background: #1d4ed8;
          transform: scale(1.03);
        }

        .doc-send-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        /* PULSE TYPING */
        .doc-typing-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          width: fit-content;
        }

        .dot-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
          animation: dotPulse 1.4s infinite ease-in-out both;
        }

        .dot-pulse:nth-child(1) { animation-delay: -0.32s; }
        .dot-pulse:nth-child(2) { animation-delay: -0.16s; }

        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>

      {/* HEADER */}
      <div className="doc-ai-header">
        <div className="doc-ai-title-wrap">
          <div className="doc-ai-bot-avatar">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="doc-ai-h1">
              <span>MedNexus AI Clinical Copilot</span>
              <span className="doc-ai-badge">Live Context Enabled</span>
            </h1>
            <p className="doc-ai-sub">
              Physician-grade clinical intelligence grounded with your patient records & appointments.
            </p>
          </div>
        </div>

        <button className="doc-ai-clear-btn" onClick={clearChat}>
          <Trash2 size={14} />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* CHAT WINDOW */}
      <div className="doc-ai-chat-window">
        {/* MESSAGES */}
        <div className="doc-ai-messages-area">
          {messages.map((msg, index) => {
            const isUser = msg.type === "user";

            return (
              <div key={index} className={`doc-msg-bubble-wrap ${isUser ? "doc-msg-user" : "doc-msg-ai"}`}>
                <div className={`doc-avatar-circle ${isUser ? "avatar-doc" : "avatar-ai"}`}>
                  {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className="doc-msg-body">
                  <div className={`doc-msg-content ${isUser ? "content-user" : "content-ai"} ${msg.isError ? "content-error" : ""}`}>
                    {isUser ? msg.text : renderFormattedText(msg.text)}
                  </div>

                  <div className="doc-msg-meta" style={{ justifyContent: isUser ? "flex-end" : "flex-start" }}>
                    <span>{msg.time}</span>
                    {!isUser && (
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(msg.text, index)}
                        title="Copy to clipboard"
                      >
                        {copiedIndex === index ? <CheckCircle2 size={12} color="#059669" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* TYPING LOADER */}
          {loading && (
            <div className="doc-msg-bubble-wrap doc-msg-ai">
              <div className="doc-avatar-circle avatar-ai">
                <Bot size={16} />
              </div>
              <div className="doc-typing-indicator">
                <div className="dot-pulse"></div>
                <div className="dot-pulse"></div>
                <div className="dot-pulse"></div>
                <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "4px" }}>
                  Analyzing clinical records & pharmacology...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTIONS */}
        <div className="doc-quick-chips">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              className="doc-chip-btn"
              onClick={() => handleSend(p.text)}
              disabled={loading}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* INPUT BAR */}
        <div className="doc-input-bar-wrap">
          <div className="doc-input-box">
            <input
              type="text"
              className="doc-text-input"
              placeholder="Ask about patient details, appointment summaries, drug interactions, dosage guidelines..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>

          <button
            className="doc-send-btn"
            onClick={() => handleSend()}
            disabled={loading || !inputMessage.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorAI;