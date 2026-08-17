import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  UserRound,
  Video,
  Building2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../../config/api";

function DoctorAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const getToken = () => localStorage.getItem("token");

  const request = async (url, options = {}) => {
    const token = getToken();

    if (!token) {
      navigate("/login", { replace: true });
      throw new Error("Authentication required");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
      throw new Error("Session expired");
    }

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message || "Something went wrong"
      );
    }

    return data;
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * If your backend already uses a different doctor
       * appointment endpoint, change ONLY this URL.
       */
      const data = await request(
        `${API_BASE_URL}/api/appointments`
      );

      setAppointments(
        Array.isArray(data.appointments)
          ? data.appointments
          : []
      );
    } catch (err) {
      console.error(err);

      if (err.message !== "Session expired") {
        setError(
          err.message || "Unable to load appointments."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  /* =========================
     STATISTICS
  ========================= */

  const stats = useMemo(() => {
    const today = new Date()
      .toISOString()
      .split("T")[0];

    return {
      total: appointments.length,

      today: appointments.filter(
        (a) =>
          String(a.appointment_date).slice(0, 10) ===
          today
      ).length,

      confirmed: appointments.filter(
        (a) =>
          String(a.status).toLowerCase() ===
          "confirmed"
      ).length,

      completed: appointments.filter(
        (a) =>
          String(a.status).toLowerCase() ===
          "completed"
      ).length,
    };
  }, [appointments]);

  /* =========================
     FILTER
  ========================= */

  const filteredAppointments = useMemo(() => {
    const value = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const patient =
        appointment.patient_name?.toLowerCase() || "";

      const email =
        appointment.patient_email?.toLowerCase() || "";

      const doctor =
        appointment.doctor_name?.toLowerCase() || "";

      const status =
        String(
          appointment.status || "scheduled"
        ).toLowerCase();

      const matchesSearch =
        !value ||
        patient.includes(value) ||
        email.includes(value) ||
        doctor.includes(value);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter.toLowerCase();

      const today = new Date()
        .toISOString()
        .split("T")[0];

      let matchesDate = true;

      if (dateFilter === "Today") {
        matchesDate =
          String(
            appointment.appointment_date
          ).slice(0, 10) === today;
      }

      if (dateFilter === "Upcoming") {
        matchesDate =
          String(
            appointment.appointment_date
          ).slice(0, 10) >= today;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    appointments,
    search,
    statusFilter,
    dateFilter,
  ]);

  /* =========================
     STATUS ACTIONS
  ========================= */

  const updateStatus = async (
    appointment,
    action
  ) => {
    try {
      setError("");

      /*
       * These endpoints should match your backend.
       * If your backend uses different routes, only
       * change this section.
       */
      await request(
        `${API_BASE_URL}/api/appointments/${appointment.id}/${action}`,
        {
          method: "PUT",
        }
      );

      setSelectedAppointment(null);
      await loadAppointments();
    } catch (err) {
      setError(
        err.message ||
          `Unable to ${action} appointment.`
      );
    }
  };

  return (
    <div className="doctor-appointments-page">

      {/* HEADER */}

      <header className="doctor-page-header">

        <div>
          <span className="doctor-eyebrow">
            MEDNEXUS AI • DOCTOR PORTAL
          </span>

          <h1>Appointment Management</h1>

          <p>
            Manage your patient appointments
            and consultation schedule.
          </p>
        </div>

        <button
          className="doctor-refresh"
          onClick={loadAppointments}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading ? "doctor-spin" : ""
            }
          />
          Refresh
        </button>

      </header>

      {/* ERROR */}

      {error && (
        <div className="doctor-alert">
          <AlertCircle size={17} />
          <span>{error}</span>

          <button
            onClick={() => setError("")}
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* STATS */}

      <section className="doctor-stat-grid">

        <StatCard
          icon={<ClipboardList />}
          label="Total Appointments"
          value={stats.total}
          type="blue"
        />

        <StatCard
          icon={<CalendarDays />}
          label="Scheduled Today"
          value={stats.today}
          type="teal"
        />

        <StatCard
          icon={<CheckCircle2 />}
          label="Confirmed Visits"
          value={stats.confirmed}
          type="green"
        />

        <StatCard
          icon={<CheckCircle2 />}
          label="Completed Visits"
          value={stats.completed}
          type="purple"
        />

      </section>

      {/* MAIN WORKSPACE */}

      <section className="doctor-content-card">

        {/* CARD HEADER */}

        <div className="doctor-card-header">

          <div>
            <h2>Appointments</h2>

            <p>
              Showing{" "}
              <strong>
                {filteredAppointments.length}
              </strong>{" "}
              of {appointments.length} appointments
            </p>
          </div>

        </div>

        {/* FILTERS */}

        <div className="doctor-filter-bar">

          <div className="doctor-search">

            <Search size={17} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search patient name or email..."
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option>All</option>
            <option>Scheduled</option>
            <option>Confirmed</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
          >
            <option>All</option>
            <option>Today</option>
            <option>Upcoming</option>
          </select>

        </div>

        {/* TABLE */}

        {loading ? (
          <div className="doctor-loading">
            <RefreshCw
              size={30}
              className="doctor-spin"
            />

            <p>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (

          <div className="doctor-empty">

            <div className="doctor-empty-icon">
              <CalendarDays size={28} />
            </div>

            <h3>No appointments found</h3>

            <p>
              You currently have no appointments
              matching the selected filters.
            </p>

          </div>

        ) : (

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

                {filteredAppointments.map(
                  (appointment) => {

                    const status =
                      String(
                        appointment.status ||
                          "scheduled"
                      ).toLowerCase();

                    const online =
                      appointment.appointment_type ===
                      "online";

                    return (
                      <tr
                        key={appointment.id}
                      >

                        {/* PATIENT */}

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

                        {/* DATE */}

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

                        {/* TYPE */}

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

                        {/* STATUS */}

                        <td>

                          <span
                            className={`doctor-status ${status}`}
                          >
                            {status}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="doctor-actions">

                            <button
                              className="view-btn"
                              onClick={() =>
                                setSelectedAppointment(
                                  appointment
                                )
                              }
                            >
                              <Eye size={14} />
                              View
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* DETAILS MODAL */}

      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() =>
            setSelectedAppointment(null)
          }
          onAction={updateStatus}
        />
      )}

      {/* STYLES */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .doctor-appointments-page {
          min-height: 100vh;
          padding: 30px 32px 45px;
          background: #f7fafc;
          color: #17324d;
        }

        .doctor-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .doctor-eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #07889b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .doctor-page-header h1 {
          margin: 0;
          color: #102f4a;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .doctor-page-header p {
          margin: 7px 0 0;
          color: #7890a8;
          font-size: 13px;
        }

        .doctor-refresh {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 15px;
          border: 1px solid #d9e7ee;
          border-radius: 9px;
          background: white;
          color: #087f8c;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .doctor-refresh:hover {
          background: #f0fbfc;
        }

        .doctor-refresh:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .doctor-alert {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 11px;
        }

        .doctor-alert span {
          flex: 1;
        }

        .doctor-alert button {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .doctor-stat-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .doctor-stat-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 18px;
          border: 1px solid #e3ebf1;
          border-radius: 14px;
          background: white;
          box-shadow:
            0 4px 16px
            rgba(25, 61, 87, .04);
        }

        .doctor-stat-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 11px;
        }

        .doctor-stat-icon.blue {
          color: #2563eb;
          background: #eff6ff;
        }

        .doctor-stat-icon.teal {
          color: #07889b;
          background: #eafafa;
        }

        .doctor-stat-icon.green {
          color: #16a34a;
          background: #effcf3;
        }

        .doctor-stat-icon.purple {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .doctor-stat-card span {
          display: block;
          color: #8197aa;
          font-size: 10px;
        }

        .doctor-stat-card strong {
          display: block;
          margin-top: 4px;
          color: #17324d;
          font-size: 22px;
        }

        .doctor-content-card {
          overflow: hidden;
          border: 1px solid #e2ebf1;
          border-radius: 16px;
          background: white;
          box-shadow:
            0 5px 22px
            rgba(20, 57, 84, .045);
        }

        .doctor-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 22px;
          border-bottom: 1px solid #e7eef3;
        }

        .doctor-card-header h2 {
          margin: 0;
          color: #12304c;
          font-size: 19px;
        }

        .doctor-card-header p {
          margin: 5px 0 0;
          color: #8aa0b5;
          font-size: 11px;
        }

        .doctor-card-header p strong {
          color: #17324d;
        }

        .doctor-filter-bar {
          display: flex;
          gap: 10px;
          padding: 15px 22px;
          border-bottom: 1px solid #e7eef3;
          background: #fbfdfd;
        }

        .doctor-search {
          position: relative;
          flex: 1;
        }

        .doctor-search svg {
          position: absolute;
          top: 50%;
          left: 12px;
          transform: translateY(-50%);
          color: #8da2b5;
        }

        .doctor-search input {
          width: 100%;
          height: 39px;
          padding: 0 12px 0 37px;
          border: 1px solid #dfe8ef;
          border-radius: 8px;
          outline: none;
          font-size: 11px;
        }

        .doctor-search input:focus,
        .doctor-filter-bar select:focus {
          border-color: #07889b;
          box-shadow:
            0 0 0 3px
            rgba(7,136,155,.07);
        }

        .doctor-filter-bar select {
          min-width: 130px;
          height: 39px;
          padding: 0 10px;
          border: 1px solid #dfe8ef;
          border-radius: 8px;
          outline: none;
          background: white;
          color: #536c83;
          font-size: 11px;
        }

        .doctor-table-wrapper {
          overflow-x: auto;
        }

        .doctor-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        .doctor-table th {
          padding: 13px 18px;
          background: #f8fbfd;
          border-bottom: 1px solid #e5edf2;
          color: #7890a5;
          font-size: 9px;
          font-weight: 800;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: .6px;
        }

        .doctor-table td {
          padding: 16px 18px;
          border-bottom: 1px solid #edf2f5;
          vertical-align: middle;
        }

        .doctor-table tbody tr:hover {
          background: #fbfdfe;
        }

        .patient-cell,
        .type-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .patient-avatar {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 10px;
          background: #eafafa;
          color: #07889b;
        }

        .patient-cell strong,
        .type-cell strong {
          display: block;
          color: #17324d;
          font-size: 12px;
        }

        .patient-cell span,
        .type-cell span {
          display: block;
          margin-top: 3px;
          color: #8ba0b2;
          font-size: 9px;
        }

        .date-cell strong {
          display: block;
          color: #334e67;
          font-size: 11px;
        }

        .date-cell span {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 5px;
          color: #7e94a8;
          font-size: 9px;
        }

        .type-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
        }

        .type-icon.online {
          color: #2563eb;
          background: #eff6ff;
        }

        .type-icon.clinic {
          color: #07889b;
          background: #eafafa;
        }

        .doctor-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .doctor-status.scheduled {
          color: #2563eb;
          background: #eff6ff;
        }

        .doctor-status.confirmed {
          color: #15803d;
          background: #dcfce7;
        }

        .doctor-status.completed {
          color: #7c3aed;
          background: #f3e8ff;
        }

        .doctor-status.cancelled {
          color: #dc2626;
          background: #fee2e2;
        }

        .view-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 31px;
          padding: 0 10px;
          border: 1px solid #d8e5ed;
          border-radius: 7px;
          background: white;
          color: #087f8c;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .view-btn:hover {
          background: #eefafa;
          border-color: #b9dfe2;
        }

        .doctor-loading,
        .doctor-empty {
          min-height: 330px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .doctor-loading {
          color: #07889b;
        }

        .doctor-loading p {
          margin-top: 12px;
          color: #8aa0b5;
          font-size: 11px;
        }

        .doctor-empty-icon {
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          border-radius: 50%;
          background: #eafafa;
          color: #07889b;
        }

        .doctor-empty h3 {
          margin: 0;
          color: #334e67;
          font-size: 14px;
        }

        .doctor-empty p {
          max-width: 360px;
          margin: 6px 0;
          color: #8ba0b2;
          font-size: 10px;
        }

        /* MODAL */

        .doctor-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 32, 48, .5);
        }

        .doctor-modal {
          width: min(540px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 16px;
          background: white;
          box-shadow:
            0 30px 80px
            rgba(15, 32, 48, .25);
        }

        .doctor-modal-header {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .doctor-modal-header h2 {
          margin: 4px 0;
          color: #17324d;
          font-size: 20px;
        }

        .doctor-modal-header p {
          margin: 0;
          color: #7d94a8;
          font-size: 10px;
        }

        .modal-close {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 8px;
          background: #f4f7f9;
          color: #64748b;
          cursor: pointer;
        }

        .modal-patient {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1px solid #e4edf2;
          border-radius: 11px;
          background: #f9fcfd;
        }

        .modal-patient-avatar {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #eafafa;
          color: #07889b;
        }

        .modal-patient strong {
          display: block;
          color: #17324d;
          font-size: 13px;
        }

        .modal-patient span {
          display: block;
          margin-top: 3px;
          color: #7e94a7;
          font-size: 10px;
        }

        .modal-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 15px;
        }

        .modal-detail {
          padding: 12px;
          border-radius: 9px;
          background: #f8fafc;
        }

        .modal-detail span {
          display: block;
          color: #8aa0b2;
          font-size: 9px;
        }

        .modal-detail strong {
          display: block;
          margin-top: 4px;
          color: #334e67;
          font-size: 11px;
        }

        .modal-reason {
          margin-top: 14px;
          padding: 13px;
          border-radius: 9px;
          background: #f8fafc;
        }

        .modal-reason strong {
          display: block;
          margin-bottom: 5px;
          color: #475d71;
          font-size: 10px;
        }

        .modal-reason p {
          margin: 0;
          color: #71879a;
          font-size: 10px;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 20px;
        }

        .modal-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 35px;
          padding: 0 12px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .modal-action.confirm {
          border: 0;
          background: #07889b;
          color: white;
        }

        .modal-action.complete {
          border: 0;
          background: #16a34a;
          color: white;
        }

        .modal-action.cancel {
          border: 1px solid #fecaca;
          background: white;
          color: #dc2626;
        }

        .doctor-spin {
          animation:
            doctor-spin-animation
            1s linear infinite;
        }

        @keyframes doctor-spin-animation {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1100px) {
          .doctor-stat-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .doctor-appointments-page {
            padding: 22px 15px 35px;
          }

          .doctor-page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .doctor-refresh {
            width: 100%;
            justify-content: center;
          }

          .doctor-stat-grid {
            grid-template-columns: 1fr;
          }

          .doctor-filter-bar {
            flex-direction: column;
          }

          .doctor-filter-bar select {
            width: 100%;
          }

          .modal-details {
            grid-template-columns: 1fr;
          }
        }

      `}</style>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  type,
}) {
  return (
    <div className="doctor-stat-card">
      <div
        className={`doctor-stat-icon ${type}`}
      >
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function AppointmentModal({
  appointment,
  onClose,
  onAction,
}) {
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
              {formatDate(
                appointment.appointment_date
              )}
            </strong>
          </div>

          <div className="modal-detail">
            <span>Time</span>
            <strong>
              {formatTime(
                appointment.appointment_time
              )}
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
            <strong>
              Reason for Visit
            </strong>

            <p>
              {appointment.reason}
            </p>
          </div>
        )}

        {appointment.notes && (
          <div className="modal-reason">
            <strong>
              Additional Notes
            </strong>

            <p>
              {appointment.notes}
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

/* =========================================================
   DATE
========================================================= */

function formatDate(value) {
  if (!value) return "Date unavailable";

  try {
    const text = String(value).slice(0, 10);
    const [year, month, day] =
      text.split("-");

    if (!year || !month || !day) {
      return "Date unavailable";
    }

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Date unavailable";
  }
}

/* =========================================================
   TIME
========================================================= */

function formatTime(value) {
  if (!value) return "Time unavailable";

  try {
    const [hours, minutes] =
      String(value).split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  } catch {
    return value;
  }
}

export default DoctorAppointments;