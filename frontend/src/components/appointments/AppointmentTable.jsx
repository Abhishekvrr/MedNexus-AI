import {
  CalendarDays,
  Clock3,
  Eye,
  UserRound,
  Video,
  Building2,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const text = String(value).slice(0, 10);
  const [year, month, day] = text.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Time unavailable";

  const [hours, minutes] =
    String(value).split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function AppointmentTable({
  appointments,
  loading,
  onView,
}) {
  if (loading) {
    return (
      <div className="doctor-loading">
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="doctor-empty">
        <div className="doctor-empty-icon">
          <CalendarDays size={28} />
        </div>

        <h3>No appointments found</h3>

        <p>
          No appointments match the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="doctor-table-wrapper">
      <table className="doctor-table">

        <thead>
          <tr>
            <th>Patient</th>
            <th>Date & Time</th>
            <th>Consultation</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((appointment) => {
            const status =
              String(
                appointment.status || "scheduled"
              ).toLowerCase();

            const online =
              appointment.appointment_type ===
              "online";

            return (
              <tr key={appointment.id}>

                <td>
                  <div className="patient-cell">

                    <div className="patient-avatar">
                      <UserRound size={18} />
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
                </td>

                <td>
                  <div className="date-cell">

                    <strong>
                      {formatDate(
                        appointment.appointment_date
                      )}
                    </strong>

                    <span>
                      <Clock3 size={12} />

                      {formatTime(
                        appointment.appointment_time
                      )}
                    </span>

                  </div>
                </td>

                <td>
                  <div className="type-cell">

                    <div
                      className={
                        online
                          ? "type-icon online"
                          : "type-icon clinic"
                      }
                    >
                      {online ? (
                        <Video size={15} />
                      ) : (
                        <Building2 size={15} />
                      )}
                    </div>

                    <div>
                      <strong>
                        {online
                          ? "Online"
                          : "In-person"}
                      </strong>

                      <span>
                        {appointment.specialization ||
                          "Medical consultation"}
                      </span>
                    </div>

                  </div>
                </td>

                <td>
                  <span
                    className={`doctor-status ${status}`}
                  >
                    {status}
                  </span>
                </td>

                <td>
                  <button
                    className="view-btn"
                    onClick={() =>
                      onView(appointment)
                    }
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>

              </tr>
            );
          })}
        </tbody>

      </table>
    </div>
  );
}

export default AppointmentTable;