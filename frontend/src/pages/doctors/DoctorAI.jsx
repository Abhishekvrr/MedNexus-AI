import {
  Bot,
  Send,
  Sparkles,
} from "lucide-react";

import { useState } from "react";

function DoctorAI() {

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hello Doctor! I'm your MedNexus AI Assistant. How can I help you today?",
    },
  ]);

  const sendMessage = () => {

    if (!message.trim()) {
      return;
    }

    setMessages(
      (previous) => [
        ...previous,
        {
          type: "user",
          text: message,
        },
        {
          type: "ai",
          text: "I'm ready to assist you with patient information, appointments, medical records and clinical insights.",
        },
      ]
    );

    setMessage("");

  };

  return (
    <div className="doctor-page">

      <div className="doctor-page-header">

        <div>
          <h1>AI Assistant</h1>

          <p>
            Your intelligent clinical assistant.
          </p>
        </div>

        <div className="doctor-header-icon">
          <Bot size={26} />
        </div>

      </div>


      <div className="doctor-ai-container">

        <div className="doctor-ai-header">

          <div className="doctor-ai-icon">
            <Sparkles size={20} />
          </div>

          <div>
            <strong>
              MedNexus AI
            </strong>

            <span>
              Doctor Assistant
            </span>
          </div>

        </div>


        <div className="doctor-ai-messages">

          {messages.map(
            (item, index) => (

              <div
                key={index}
                className={
                  item.type === "user"
                    ? "doctor-ai-message user"
                    : "doctor-ai-message"
                }
              >
                {item.text}
              </div>

            )
          )}

        </div>


        <div className="doctor-ai-input">

          <input
            type="text"
            value={message}
            placeholder="Ask MedNexus AI..."
            onChange={
              (event) =>
                setMessage(
                  event.target.value
                )
            }
            onKeyDown={
              (event) => {

                if (
                  event.key === "Enter"
                ) {
                  sendMessage();
                }

              }
            }
          />

          <button
            type="button"
            onClick={sendMessage}
          >
            <Send size={18} />
          </button>

        </div>

      </div>


      <style>{`

        .doctor-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .doctor-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .doctor-page-header h1 {
          margin: 0;
          color: #102a43;
          font-size: 28px;
          font-weight: 800;
        }

        .doctor-page-header p {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .doctor-header-icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #eff6ff;
          color: #2563eb;
        }

        .doctor-ai-container {
          height: calc(100vh - 150px);
          min-height: 500px;
          display: flex;
          flex-direction: column;
          background: white;
          border: 1px solid #e5edf5;
          border-radius: 16px;
          overflow: hidden;
        }

        .doctor-ai-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid #edf2f7;
        }

        .doctor-ai-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #eff6ff;
          color: #2563eb;
        }

        .doctor-ai-header div:last-child {
          display: flex;
          flex-direction: column;
        }

        .doctor-ai-header strong {
          color: #172b4d;
          font-size: 14px;
        }

        .doctor-ai-header span {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 11px;
        }

        .doctor-ai-messages {
          flex: 1;
          overflow-y: auto;
          padding: 25px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .doctor-ai-message {
          max-width: 70%;
          padding: 13px 16px;
          border-radius: 12px;
          background: #f1f5f9;
          color: #334155;
          font-size: 13px;
          line-height: 1.6;
        }

        .doctor-ai-message.user {
          align-self: flex-end;
          background: #2563eb;
          color: white;
        }

        .doctor-ai-input {
          display: flex;
          gap: 10px;
          padding: 16px;
          border-top: 1px solid #edf2f7;
        }

        .doctor-ai-input input {
          flex: 1;
          height: 45px;
          padding: 0 14px;
          border: 1px solid #dbe4ee;
          border-radius: 10px;
          outline: none;
          font-size: 13px;
        }

        .doctor-ai-input input:focus {
          border-color: #2563eb;
        }

        .doctor-ai-input button {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          cursor: pointer;
        }

      `}</style>

    </div>
  );
}

export default DoctorAI;