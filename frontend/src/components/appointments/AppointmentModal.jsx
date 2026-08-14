import {
  CheckCircle2,
  XCircle,
  UserRound,
} from "lucide-react";

function AppointmentModal({
  appointment,
  onClose,
  onAction,
}) {
  if (!appointment) return null;

  const status =
    String(
      appointment.status || "scheduled"
    ).toLowerCase();

  return (
    <div
      className="doctor-modal-overlay"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="doctor-modal">

        <div className="doctor-modal-header">

          <div>
            <span className="doctor-eyebrow">
              APPOINTMENT DETAILS
            </span>

            <h2>
              Patient Appointment
            </h2>

            <p>
              Review and manage this consultation.
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <XCircle size={18} />
          </button>

        </div>

        <div className="modal-patient">

          <div className="modal-patient-avatar">
            <UserRound size={20} />
          </div>

          <div>
            <strong>
              {appointment.patient_name ||
                "Patient"}
            </strong>

            <span>
              {appointment.patient_email ||
                "Email unavailable"}
            </span>
          </div>

        </div>

        <div className="modal-details">

          <div className="modal-detail">
            <span>Date</span>
            <strong>
              {appointment.appointment_date}
            </strong>
          </div>

          <div className="modal-detail">
            <span>Time</span>
            <strong>
              {appointment.appointment_time}
            </strong>
          </div>

          <div className="modal-detail">
            <span>Consultation</span>
            <strong>
              {appointment.appointment_type ===
              "online"
                ? "Online"
                : "In-person"}
            </strong>
          </div>

          <div className="modal-detail">
            <span>Status</span>
            <strong>{status}</strong>
          </div>

        </div>

        {appointment.reason && (
          <div className="modal-reason">
            <strong>Reason for Visit</strong>

            <p>
              {appointment.reason}
            </p>
          </div>
        )}

        <div className="modal-actions">

          {status !== "cancelled" &&
            status !== "completed" && (
              <button
                className="modal-action cancel"
                onClick={() =>
                  onAction(
                    appointment,
                    "cancel"
                  )
                }
              >
                <XCircle size={14} />
                Cancel
              </button>
            )}

          {status === "scheduled" && (
            <button
              className="modal-action confirm"
              onClick={() =>
                onAction(
                  appointment,
                  "confirm"
                )
              }
            >
              <CheckCircle2 size={14} />
              Confirm
            </button>
          )}

          {status === "confirmed" && (
            <button
              className="modal-action complete"
              onClick={() =>
                onAction(
                  appointment,
                  "complete"
                )
              }
            >
              <CheckCircle2 size={14} />
              Mark Complete
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default AppointmentModal;