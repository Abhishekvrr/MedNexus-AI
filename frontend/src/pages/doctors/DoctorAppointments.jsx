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
  Check,
  RotateCcw,
  CalendarCheck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../../config/api";

function DoctorAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const loadAppointments = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load appointments.");
      }

      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    } catch (err) {
      console.error("Doctor appointments error:", err);
      setError(err.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  /* =========================================================
     STATS COMPUTATION
  ========================================================= */
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return {
      total: appointments.length,
      today: appointments.filter(
        (a) => String(a.appointment_date).slice(0, 10) === today
      ).length,
      confirmed: appointments.filter(
        (a) => String(a.status).toLowerCase() === "confirmed"
      ).length,
      scheduled: appointments.filter(
        (a) => String(a.status).toLowerCase() === "scheduled"
      ).length,
      completed: appointments.filter(
        (a) => String(a.status).toLowerCase() === "completed"
      ).length,
      cancelled: appointments.filter(
        (a) => String(a.status).toLowerCase() === "cancelled"
      ).length,
    };
  }, [appointments]);

  /* =========================================================
     FILTERING
  ========================================================= */
  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    const today = new Date().toISOString().split("T")[0];

    return appointments.filter((appointment) => {
      const patient = String(appointment.patient_name || "").toLowerCase();
      const email = String(appointment.patient_email || "").toLowerCase();
      const reason = String(appointment.reason || "").toLowerCase();
      const status = String(appointment.status || "scheduled").toLowerCase();
      const appointmentDate = String(appointment.appointment_date || "").slice(0, 10);

      const matchesSearch =
        !query ||
        patient.includes(query) ||
        email.includes(query) ||
        reason.includes(query);

      const matchesStatus =
        statusFilter === "All" || status === statusFilter.toLowerCase();

      let matchesDate = true;
      if (dateFilter === "Today") {
        matchesDate = appointmentDate === today;
      } else if (dateFilter === "Upcoming") {
        matchesDate = appointmentDate >= today;
      } else if (dateFilter === "Past") {
        matchesDate = appointmentDate < today;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  /* =========================================================
     STATUS UPDATE
  ========================================================= */
  const handleStatusChange = async (appointmentId, action) => {
    const token = getToken();
    try {
      setUpdatingId(appointmentId);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to ${action} appointment.`);
      }

      setSuccessMessage(`Appointment status updated to '${action}'.`);
      setTimeout(() => setSuccessMessage(""), 3500);

      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment((prev) =>
          prev ? { ...prev, status: data.appointment?.status || action } : null
        );
      }

      await loadAppointments();
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.message || `Unable to ${action} appointment.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (value) => {
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
  };

  const formatTime = (value) => {
    if (!value) return "Time unavailable";
    const [hours, minutes] = String(value).split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="doc-appts-wrapper">
      {/* BULLETPROOF SCOPED CSS */}
      <style>{`
        .doc-appts-wrapper {
          width: 100%;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          box-sizing: border-box;
        }

        .doc-appts-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }

        .doc-appts-eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #2563eb;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }

        .doc-appts-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .doc-appts-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .doc-sync-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #1e293b;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
        }

        .doc-sync-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        /* STATS GRID */
        .doc-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .doc-stat-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .doc-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-blue { background: #eff6ff; color: #2563eb; }
        .icon-emerald { background: #ecfdf5; color: #059669; }
        .icon-purple { background: #f5f3ff; color: #7c3aed; }
        .icon-rose { background: #fff1f2; color: #e11d48; }

        .doc-stat-val {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .doc-stat-label {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin-top: 2px;
        }

        /* MAIN CARD */
        .doc-card-container {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05);
          padding: 24px;
          overflow: hidden;
        }

        /* FILTER BAR */
        .doc-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid #f1f5f9;
        }

        .doc-search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 9px 14px;
          width: 100%;
          max-width: 360px;
        }

        .doc-search-input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #0f172a;
          width: 100%;
        }

        .doc-filter-dropdowns {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .doc-select {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          outline: none;
          cursor: pointer;
        }

        /* TABLE STYLING */
        .doc-table-container {
          width: 100%;
          overflow-x: auto;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
        }

        .doc-appointments-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }

        .doc-appointments-table thead {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .doc-appointments-table th {
          padding: 14px 18px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        .doc-appointments-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s ease;
        }

        .doc-appointments-table tbody tr:last-child {
          border-bottom: none;
        }

        .doc-appointments-table tbody tr:hover {
          background: #f8fafc;
        }

        .doc-appointments-table td {
          padding: 16px 18px;
          vertical-align: middle;
        }

        /* CELLS */
        .patient-info-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .patient-avatar-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #e2e8f0;
          color: #1e293b;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .patient-primary-name {
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .patient-sub-email {
          font-size: 12px;
          color: #64748b;
        }

        .datetime-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .datetime-date {
          font-weight: 700;
          color: #1e293b;
          font-size: 14px;
        }

        .datetime-time {
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .consultation-type-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .type-online { background: #eff6ff; color: #2563eb; }
        .type-inperson { background: #f1f5f9; color: #475569; }

        /* STATUS BADGES */
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .badge-scheduled { background: #dbeafe; color: #1d4ed8; }
        .badge-confirmed { background: #dcfce7; color: #15803d; }
        .badge-completed { background: #f3e8ff; color: #7e22ce; }
        .badge-cancelled { background: #ffe4e6; color: #be123c; }

        /* ACTIONS */
        .table-actions-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s ease;
        }

        .btn-view {
          background: #f1f5f9;
          color: #334155;
          border-color: #cbd5e1;
        }

        .btn-view:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .btn-confirm {
          background: #059669;
          color: #ffffff;
        }

        .btn-confirm:hover {
          background: #047857;
        }

        .btn-complete {
          background: #2563eb;
          color: #ffffff;
        }

        .btn-complete:hover {
          background: #1d4ed8;
        }

        .btn-cancel {
          background: #fff1f2;
          color: #be123c;
          border-color: #fecdd3;
        }

        .btn-cancel:hover {
          background: #ffe4e6;
        }

        .btn-restore {
          background: #eff6ff;
          color: #2563eb;
          border-color: #bfdbfe;
        }

        .btn-restore:hover {
          background: #dbeafe;
        }

        /* MODAL STYLING */
        .doc-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .doc-modal-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
          border: 1px solid #e2e8f0;
        }

        .doc-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .doc-modal-body {
          padding: 24px;
        }

        .doc-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .doc-detail-item {
          background: #f8fafc;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }

        .doc-detail-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 4px;
        }

        .doc-detail-val {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .doc-modal-actions {
          padding: 16px 24px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }
      `}</style>

      {/* HEADER */}
      <header className="doc-appts-header">
        <div>
          <span className="doc-appts-eyebrow">MEDNEXUS AI • DOCTOR PORTAL</span>
          <h1 className="doc-appts-title">Appointment Management</h1>
          <p className="doc-appts-subtitle">
            Manage your patient appointments, update consultation status, and review visit history.
          </p>
        </div>

        <button className="doc-sync-btn" onClick={loadAppointments} disabled={loading}>
          <RefreshCw size={16} className={loading ? "doc-spin" : ""} />
          <span>Refresh List</span>
        </button>
      </header>

      {/* SUCCESS / ERROR ALERTS */}
      {successMessage && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #f87171",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {/* STATS METRIC CARDS */}
      <div className="doc-stats-grid">
        <div className="doc-stat-card">
          <div className="doc-stat-icon icon-blue">
            <CalendarDays size={24} />
          </div>
          <div>
            <div className="doc-stat-val">{stats.total}</div>
            <div className="doc-stat-label">Total Appointments</div>
          </div>
        </div>

        <div className="doc-stat-card">
          <div className="doc-stat-icon icon-emerald">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="doc-stat-val">{stats.confirmed}</div>
            <div className="doc-stat-label">Confirmed Visits</div>
          </div>
        </div>

        <div className="doc-stat-card">
          <div className="doc-stat-icon icon-purple">
            <CalendarCheck size={24} />
          </div>
          <div>
            <div className="doc-stat-val">{stats.scheduled}</div>
            <div className="doc-stat-label">Scheduled / Pending</div>
          </div>
        </div>

        <div className="doc-stat-card">
          <div className="doc-stat-icon icon-rose">
            <XCircle size={24} />
          </div>
          <div>
            <div className="doc-stat-val">{stats.cancelled}</div>
            <div className="doc-stat-label">Cancelled Visits</div>
          </div>
        </div>
      </div>

      {/* MAIN APPOINTMENT TABLE CARD */}
      <section className="doc-card-container">
        {/* FILTERS */}
        <div className="doc-filter-bar">
          <div className="doc-search-box">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              className="doc-search-input"
              placeholder="Search by patient name, email, or condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="doc-filter-dropdowns">
            <select
              className="doc-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="doc-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Past">Past</option>
            </select>
          </div>
        </div>

        {/* TABLE OR EMPTY STATE */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
            <RefreshCw size={28} className="doc-spin" style={{ margin: "0 auto 12px", color: "#2563eb" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
            <CalendarDays size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>No Appointments Found</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>
              No appointment matches your search or selected filters.
            </p>
          </div>
        ) : (
          <div className="doc-table-container">
            <table className="doc-appointments-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Consultation Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  const status = String(appointment.status || "scheduled").toLowerCase();
                  const isOnline = appointment.appointment_type === "online";
                  const initials = String(appointment.patient_name || "P")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const isUpdating = updatingId === appointment.id;

                  return (
                    <tr key={appointment.id}>
                      {/* PATIENT */}
                      <td>
                        <div className="patient-info-cell">
                          <div className="patient-avatar-box">{initials}</div>
                          <div>
                            <div className="patient-primary-name">
                              {appointment.patient_name || "Patient"}
                            </div>
                            <div className="patient-sub-email">
                              {appointment.patient_email || "Email unavailable"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* DATE & TIME */}
                      <td>
                        <div className="datetime-cell">
                          <span className="datetime-date">
                            {formatDate(appointment.appointment_date)}
                          </span>
                          <span className="datetime-time">
                            <Clock3 size={12} />
                            {formatTime(appointment.appointment_time)}
                          </span>
                        </div>
                      </td>

                      {/* CONSULTATION TYPE */}
                      <td>
                        <div className="consultation-type-cell">
                          <span className={`type-badge ${isOnline ? "type-online" : "type-inperson"}`}>
                            {isOnline ? <Video size={13} /> : <Building2 size={13} />}
                            {isOnline ? "Online Video" : "Clinic In-Person"}
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span className={`status-badge badge-${status}`}>
                          {status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="table-actions-cell">
                          {/* VIEW DETAILS */}
                          <button
                            className="action-btn btn-view"
                            onClick={() => setSelectedAppointment(appointment)}
                            title="View appointment details"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          {/* CONFIRM */}
                          {status !== "confirmed" && status !== "completed" && (
                            <button
                              className="action-btn btn-confirm"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(appointment.id, "confirm")}
                              title="Confirm appointment"
                            >
                              <Check size={14} />
                              <span>Confirm</span>
                            </button>
                          )}

                          {/* COMPLETE */}
                          {status !== "completed" && status !== "cancelled" && (
                            <button
                              className="action-btn btn-complete"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(appointment.id, "complete")}
                              title="Mark appointment as completed"
                            >
                              <CheckCircle2 size={14} />
                              <span>Complete</span>
                            </button>
                          )}

                          {/* CANCEL */}
                          {status !== "cancelled" && status !== "completed" && (
                            <button
                              className="action-btn btn-cancel"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(appointment.id, "cancel")}
                              title="Cancel appointment"
                            >
                              <XCircle size={14} />
                              <span>Cancel</span>
                            </button>
                          )}

                          {/* RESTORE / SCHEDULE IF CANCELLED */}
                          {status === "cancelled" && (
                            <button
                              className="action-btn btn-restore"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(appointment.id, "schedule")}
                              title="Re-schedule / Reopen appointment"
                            >
                              <RotateCcw size={14} />
                              <span>Reopen</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* APPOINTMENT DETAILS MODAL */}
      {selectedAppointment && (
        <div className="doc-modal-backdrop" onClick={() => setSelectedAppointment(null)}>
          <div className="doc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-header">
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                Appointment Consultation Details
              </h3>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                }}
                onClick={() => setSelectedAppointment(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="doc-modal-body">
              {/* PATIENT HEADER */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#2563eb",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "16px",
                  }}
                >
                  {String(selectedAppointment.patient_name || "P")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700 }}>
                    {selectedAppointment.patient_name || "Patient"}
                  </h4>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    {selectedAppointment.patient_email} • {selectedAppointment.patient_phone || "Phone unlisted"}
                  </div>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="doc-detail-grid">
                <div className="doc-detail-item">
                  <div className="doc-detail-label">Date & Time</div>
                  <div className="doc-detail-val">
                    {formatDate(selectedAppointment.appointment_date)} at {formatTime(selectedAppointment.appointment_time)}
                  </div>
                </div>

                <div className="doc-detail-item">
                  <div className="doc-detail-label">Consultation Mode</div>
                  <div className="doc-detail-val">
                    {selectedAppointment.appointment_type === "online"
                      ? "Online Video Consultation"
                      : "Clinic In-Person Visit"}
                  </div>
                </div>

                <div className="doc-detail-item">
                  <div className="doc-detail-label">Current Status</div>
                  <div className="doc-detail-val">
                    <span className={`status-badge badge-${String(selectedAppointment.status).toLowerCase()}`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>

                <div className="doc-detail-item">
                  <div className="doc-detail-label">Specialization / Dept</div>
                  <div className="doc-detail-val">
                    {selectedAppointment.specialization || "General Medicine"}
                  </div>
                </div>
              </div>

              {/* REASON / NOTES */}
              {selectedAppointment.reason && (
                <div style={{ marginBottom: "16px" }}>
                  <div className="doc-detail-label">Chief Complaint / Reason</div>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "12px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      color: "#334155",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {selectedAppointment.reason}
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER STATUS BUTTONS */}
            <div className="doc-modal-actions">
              <button
                className="action-btn btn-view"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>

              {selectedAppointment.status !== "confirmed" && selectedAppointment.status !== "completed" && (
                <button
                  className="action-btn btn-confirm"
                  onClick={() => handleStatusChange(selectedAppointment.id, "confirm")}
                >
                  <Check size={14} />
                  Confirm Visit
                </button>
              )}

              {selectedAppointment.status !== "completed" && selectedAppointment.status !== "cancelled" && (
                <button
                  className="action-btn btn-complete"
                  onClick={() => handleStatusChange(selectedAppointment.id, "complete")}
                >
                  <CheckCircle2 size={14} />
                  Mark Completed
                </button>
              )}

              {selectedAppointment.status !== "cancelled" && selectedAppointment.status !== "completed" && (
                <button
                  className="action-btn btn-cancel"
                  onClick={() => handleStatusChange(selectedAppointment.id, "cancel")}
                >
                  <XCircle size={14} />
                  Cancel Appointment
                </button>
              )}

              {selectedAppointment.status === "cancelled" && (
                <button
                  className="action-btn btn-restore"
                  onClick={() => handleStatusChange(selectedAppointment.id, "schedule")}
                >
                  <RotateCcw size={14} />
                  Reopen / Schedule
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;