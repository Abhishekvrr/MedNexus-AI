import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppointmentStats from "../../components/appointments/AppointmentStats";
import AppointmentFilters from "../../components/appointments/AppointmentFilters";
import AppointmentTable from "../../components/appointments/AppointmentTable";
import AppointmentModal from "../../components/appointments/AppointmentModal";

import {
  getAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";

function DoctorAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [dateFilter, setDateFilter] =
    useState("All");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAppointments();

      setAppointments(
        Array.isArray(data.appointments)
          ? data.appointments
          : []
      );
    } catch (err) {
      console.error(
        "Appointments:",
        err
      );

      if (
        err.message === "Session expired" ||
        err.message === "Authentication required"
      ) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        err.message ||
          "Unable to load appointments."
      );
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
          String(
            a.appointment_date
          ).slice(0, 10) === today
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
     FILTERING
  ========================= */

  const filteredAppointments = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const today = new Date()
      .toISOString()
      .split("T")[0];

    return appointments.filter(
      (appointment) => {
        const patient =
          String(
            appointment.patient_name || ""
          ).toLowerCase();

        const email =
          String(
            appointment.patient_email || ""
          ).toLowerCase();

        const status =
          String(
            appointment.status ||
              "scheduled"
          ).toLowerCase();

        const appointmentDate =
          String(
            appointment.appointment_date ||
              ""
          ).slice(0, 10);

        const matchesSearch =
          !query ||
          patient.includes(query) ||
          email.includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          status ===
            statusFilter.toLowerCase();

        let matchesDate = true;

        if (dateFilter === "Today") {
          matchesDate =
            appointmentDate === today;
        }

        if (dateFilter === "Upcoming") {
          matchesDate =
            appointmentDate >= today;
        }

        if (dateFilter === "Past") {
          matchesDate =
            appointmentDate < today;
        }

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDate
        );
      }
    );
  }, [
    appointments,
    search,
    statusFilter,
    dateFilter,
  ]);

  /* =========================
     STATUS UPDATE
  ========================= */

  const handleStatusUpdate = async (
    appointment,
    action
  ) => {
    try {
      setError("");

      await updateAppointmentStatus(
        appointment.id,
        action
      );

      setSelectedAppointment(null);

      await loadAppointments();
    } catch (err) {
      console.error(
        "Appointment update:",
        err
      );

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

          <h1>
            Appointment Management
          </h1>

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
              loading
                ? "doctor-spin"
                : ""
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
            onClick={() =>
              setError("")
            }
          >
            <XCircle size={16} />
          </button>

        </div>
      )}

      {/* STATS */}

      <AppointmentStats
        stats={stats}
      />

      {/* MAIN CARD */}

      <section className="doctor-content-card">

        <div className="doctor-card-header">

          <div>
            <h2>
              Appointments
            </h2>

            <p>
              Showing{" "}
              <strong>
                {filteredAppointments.length}
              </strong>{" "}
              of{" "}
              <strong>
                {appointments.length}
              </strong>{" "}
              appointments
            </p>
          </div>

        </div>

        {/* FILTERS */}

        <AppointmentFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        {/* TABLE */}

        <AppointmentTable
          appointments={
            filteredAppointments
          }
          loading={loading}
          onView={
            setSelectedAppointment
          }
        />

      </section>

      {/* MODAL */}

      {selectedAppointment && (
        <AppointmentModal
          appointment={
            selectedAppointment
          }
          onClose={() =>
            setSelectedAppointment(null)
          }
          onAction={
            handleStatusUpdate
          }
        />
      )}

    </div>
  );
}

export default DoctorAppointments;