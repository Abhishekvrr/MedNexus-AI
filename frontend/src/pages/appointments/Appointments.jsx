import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Star,
  Stethoscope,
  Video,
  Building2,
  XCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function Appointments() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [form, setForm] = useState({
    appointment_date: "",
    appointment_time: "",
    appointment_type: "in_person",
    reason: "",
    notes: "",
  });

  /* =========================================================
     AUTHENTICATION
  ========================================================= */

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  /* =========================================================
     HANDLE AUTH FAILURE
  ========================================================= */

  const handleAuthFailure = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  /* =========================================================
     API REQUEST HELPER
  ========================================================= */

  const apiRequest = async (url, options = {}) => {
    const token = getToken();

    if (!token) {
      handleAuthFailure();
      throw new Error("Authentication required.");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    });

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    /*
      If backend says token is invalid/expired,
      clear authentication and return to login.
    */

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleAuthFailure();

      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message ||
          "Something went wrong. Please try again."
      );
    }

    return data;
  };

  /* =========================================================
     LOAD PAGE
  ========================================================= */

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    loadAppointmentsPage();
  }, []);

  /* =========================================================
     LOAD DOCTORS + APPOINTMENTS
  ========================================================= */

  const loadAppointmentsPage = async () => {
    try {
      setLoading(true);
      setError("");

      const [doctorsData, appointmentsData] =
        await Promise.all([
          apiRequest(
            `${API_BASE_URL}/api/doctors`,
            {
              method: "GET",
            }
          ),

          apiRequest(
            `${API_BASE_URL}/api/appointments`,
            {
              method: "GET",
            }
          ),
        ]);

      setDoctors(
        Array.isArray(doctorsData.doctors)
          ? doctorsData.doctors
          : []
      );

      setAppointments(
        Array.isArray(
          appointmentsData.appointments
        )
          ? appointmentsData.appointments
          : []
      );
    } catch (err) {
      console.error(
        "Appointments page error:",
        err
      );

      /*
        Do not show an unnecessary login error
        if the page is already navigating to login.
      */

      if (
        err.message !==
        "Authentication required."
      ) {
        setError(
          err.message ||
            "Unable to load appointments."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SPECIALIZATIONS
  ========================================================= */

  const specializations = useMemo(() => {
    const values = doctors
      .map(
        (doctor) =>
          doctor.specialization
      )
      .filter(Boolean);

    return [
      "All",
      ...new Set(values),
    ];
  }, [doctors]);

  /* =========================================================
     FILTER DOCTORS
  ========================================================= */

  const filteredDoctors = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const doctorName =
        doctor.doctor_name
          ?.toLowerCase() || "";

      const doctorSpecialization =
        doctor.specialization
          ?.toLowerCase() || "";

      const hospitalName =
        doctor.hospital_name
          ?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        doctorName.includes(searchValue) ||
        doctorSpecialization.includes(
          searchValue
        ) ||
        hospitalName.includes(searchValue);

      const matchesSpecialization =
        specialization === "All" ||
        doctor.specialization ===
          specialization;

      return (
        matchesSearch &&
        matchesSpecialization
      );
    });
  }, [
    doctors,
    search,
    specialization,
  ]);

  /* =========================================================
     OPEN BOOKING
  ========================================================= */

  const openBooking = (doctor) => {
    setSelectedDoctor(doctor);

    setForm({
      appointment_date: "",
      appointment_time: "",
      appointment_type: "in_person",
      reason: "",
      notes: "",
    });

    setError("");
    setSuccess("");
  };

  /* =========================================================
     CLOSE BOOKING
  ========================================================= */

  const closeBooking = () => {
    if (booking) {
      return;
    }

    setSelectedDoctor(null);
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     BOOK APPOINTMENT
  ========================================================= */

  const bookAppointment = async (event) => {
    event.preventDefault();

    if (!selectedDoctor) {
      return;
    }

    if (
      !form.appointment_date ||
      !form.appointment_time
    ) {
      setError(
        "Please select an appointment date and time."
      );

      return;
    }

    try {
      setBooking(true);
      setError("");
      setSuccess("");

      await apiRequest(
        `${API_BASE_URL}/api/appointments`,
        {
          method: "POST",

          body: JSON.stringify({
            doctor_id:
              selectedDoctor.id,

            hospital_id:
              selectedDoctor.hospital_id ||
              null,

            appointment_date:
              form.appointment_date,

            appointment_time:
              form.appointment_time,

            appointment_type:
              form.appointment_type,

            reason:
              form.reason.trim(),

            notes:
              form.notes.trim(),
          }),
        }
      );

      setSelectedDoctor(null);

      setSuccess(
        "Appointment booked successfully."
      );

      await loadAppointmentsPage();
    } catch (err) {
      console.error(
        "Booking error:",
        err
      );

      setError(
        err.message ||
          "Unable to book appointment."
      );
    } finally {
      setBooking(false);
    }
  };

  /* =========================================================
     CANCEL APPOINTMENT
  ========================================================= */

  const cancelAppointment = async (
    appointmentId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this appointment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(appointmentId);
      setError("");
      setSuccess("");

      await apiRequest(
        `${API_BASE_URL}/api/appointments/${appointmentId}/cancel`,
        {
          method: "PUT",
        }
      );

      setSuccess(
        "Appointment cancelled successfully."
      );

      await loadAppointmentsPage();
    } catch (err) {
      console.error(
        "Cancel appointment error:",
        err
      );

      setError(
        err.message ||
          "Unable to cancel appointment."
      );
    } finally {
      setCancelling(null);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="appointments-page">

      {/* HEADER */}

      <div className="appointments-header">

        <div>
          <span className="appointments-eyebrow">
            MEDNEXUS AI
          </span>

          <h1>
            Appointments
          </h1>

          <p>
            Book consultations and manage
            your upcoming medical
            appointments.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={
            loadAppointmentsPage
          }
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "appointment-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* ALERTS */}

      {error && (
        <div className="appointment-alert appointment-error">

          <AlertCircle size={17} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <XCircle size={16} />
          </button>

        </div>
      )}

      {success && (
        <div className="appointment-alert appointment-success">

          <CheckCircle2 size={17} />

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            <XCircle size={16} />
          </button>

        </div>
      )}

      {/* CONTENT */}

      {loading ? (
        <div className="appointments-loading">

          <RefreshCw
            size={30}
            className="appointment-spin"
          />

          <p>
            Loading appointments...
          </p>

        </div>
      ) : (
        <div className="appointments-layout">

          {/* UPCOMING APPOINTMENTS */}

          <section className="appointments-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Upcoming Appointments
                </h2>

                <p>
                  Your scheduled
                  consultations.
                </p>
              </div>

              <div className="appointment-count">
                {appointments.length}
              </div>

            </div>

            {appointments.length === 0 ? (
              <div className="empty-appointments">

                <div className="empty-icon">
                  <CalendarDays
                    size={27}
                  />
                </div>

                <strong>
                  No upcoming
                  appointments
                </strong>

                <span>
                  Choose a doctor to
                  schedule a
                  consultation.
                </span>

              </div>
            ) : (
              <div className="appointments-list">

                {appointments.map(
                  (appointment) => (
                    <AppointmentCard
                      key={
                        appointment.id
                      }
                      appointment={
                        appointment
                      }
                      cancelling={
                        cancelling ===
                        appointment.id
                      }
                      onCancel={
                        cancelAppointment
                      }
                    />
                  )
                )}

              </div>
            )}

          </section>

          {/* FIND DOCTOR */}

          <section className="doctors-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Find a Doctor
                </h2>

                <p>
                  Choose a specialist
                  for your
                  consultation.
                </p>
              </div>

            </div>

            {/* SEARCH */}

            <div className="doctor-filters">

              <div className="doctor-search-box">

                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search doctors, specialties..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </div>

              <select
                value={
                  specialization
                }
                onChange={(event) =>
                  setSpecialization(
                    event.target.value
                  )
                }
              >
                {specializations.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item === "All"
                        ? "All Specializations"
                        : item}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* DOCTORS */}

            {filteredDoctors.length ===
            0 ? (
              <div className="empty-doctors">

                <Stethoscope
                  size={28}
                />

                <strong>
                  No doctors found
                </strong>

                <span>
                  Try another search or
                  specialization.
                </span>

              </div>
            ) : (
              <div className="doctor-grid">

                {filteredDoctors.map(
                  (doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      onBook={
                        openBooking
                      }
                    />
                  )
                )}

              </div>
            )}

          </section>

        </div>
      )}

      {/* BOOKING MODAL */}

      {selectedDoctor && (
        <div
          className="appointment-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeBooking();
            }
          }}
        >

          <div className="appointment-modal">

            <div className="modal-header">

              <div>

                <span className="appointments-eyebrow">
                  BOOK CONSULTATION
                </span>

                <h2>
                  {
                    selectedDoctor.doctor_name
                  }
                </h2>

                <p>
                  {
                    selectedDoctor.specialization
                  }
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeBooking
                }
                disabled={booking}
              >
                <XCircle size={22} />
              </button>

            </div>

            <form
              onSubmit={
                bookAppointment
              }
            >

              <div className="booking-doctor-info">

                <div className="booking-avatar">
                  <Stethoscope
                    size={22}
                  />
                </div>

                <div>

                  <strong>
                    {
                      selectedDoctor.doctor_name
                    }
                  </strong>

                  <span>
                    ⭐{" "}
                    {
                      selectedDoctor.rating ??
                      "N/A"
                    }{" "}
                    rating
                  </span>

                </div>

              </div>

              <div className="booking-form-grid">

                <label>

                  <span>
                    Appointment Date
                  </span>

                  <input
                    type="date"
                    name="appointment_date"
                    value={
                      form.appointment_date
                    }
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                  />

                </label>

                <label>

                  <span>
                    Appointment Time
                  </span>

                  <input
                    type="time"
                    name="appointment_time"
                    value={
                      form.appointment_time
                    }
                    onChange={
                      handleFormChange
                    }
                    required
                  />

                </label>

              </div>

              <label>

                <span>
                  Consultation Type
                </span>

                <select
                  name="appointment_type"
                  value={
                    form.appointment_type
                  }
                  onChange={
                    handleFormChange
                  }
                >

                  <option value="in_person">
                    In-person consultation
                  </option>

                  {selectedDoctor.available_for_online && (
                    <option value="online">
                      Online consultation
                    </option>
                  )}

                </select>

              </label>

              <label>

                <span>
                  Reason for Visit
                </span>

                <textarea
                  name="reason"
                  value={
                    form.reason
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Describe the reason for your appointment..."
                  rows="3"
                />

              </label>

              <label>

                <span>
                  Additional Notes
                </span>

                <textarea
                  name="notes"
                  value={
                    form.notes
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Any additional information for the doctor..."
                  rows="2"
                />

              </label>

              <div className="booking-modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={
                    closeBooking
                  }
                  disabled={booking}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={booking}
                >

                  {booking ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="appointment-spin"
                      />

                      Booking...
                    </>
                  ) : (
                    <>
                      <CalendarDays
                        size={16}
                      />

                      Confirm Appointment
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* STYLES */}

      <style>
        {`

        * {
          box-sizing: border-box;
        }

        .appointments-page {
          width: 100%;
          min-width: 0;
          padding: 28px 32px 40px;
          color: #17324d;
        }

        .appointments-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .appointments-eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #07889b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .appointments-header h1 {
          margin: 0;
          color: #102f4a;
          font-size: 30px;
          font-weight: 700;
        }

        .appointments-header p {
          margin: 8px 0 0;
          color: #7890a8;
          font-size: 13px;
        }

        .refresh-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 42px;
          padding: 0 16px;
          border: 1px solid #d8e8f6;
          border-radius: 11px;
          background: #f7fbff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .refresh-button:hover {
          background: #eef6ff;
        }

        .refresh-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .appointment-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          margin-bottom: 18px;
          border-radius: 10px;
          font-size: 12px;
        }

        .appointment-alert button {
          display: flex;
          margin-left: auto;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .appointment-error {
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .appointment-error button {
          color: #b91c1c;
        }

        .appointment-success {
          color: #15803d;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .appointment-success button {
          color: #15803d;
        }

        .appointments-layout {
          display: grid;
          grid-template-columns:
            minmax(390px, 0.92fr)
            minmax(580px, 1.08fr);
          gap: 18px;
        }

        .appointments-panel,
        .doctors-panel {
          min-width: 0;
          padding: 24px;
          border: 1px solid #e5edf4;
          border-radius: 18px;
          background: #ffffff;
          box-shadow:
            0 5px 22px
            rgba(20, 57, 84, 0.045);
        }

        .appointments-panel,
        .doctors-panel {
          min-height: 680px;
        }

        .panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .panel-header h2 {
          margin: 0;
          color: #12304c;
          font-size: 20px;
        }

        .panel-header p {
          margin: 7px 0 0;
          color: #8aa0b5;
          font-size: 11px;
        }

        .appointment-count {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 11px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 13px;
          font-weight: 800;
        }

        .appointments-list {
          display: grid;
          gap: 14px;
          margin-top: 22px;
        }

        .appointment-card {
          display: grid;
          grid-template-columns:
            54px minmax(0, 1fr) auto;
          align-items: center;
          gap: 14px;
          padding: 18px;
          border: 1px solid #dbe7f2;
          border-left: 3px solid #2563eb;
          border-radius: 14px;
          background: linear-gradient(
            135deg,
            #fbfdff,
            #f7fbff
          );
        }

        .appointment-doctor-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #eff6ff;
          color: #2563eb;
        }

        .appointment-main {
          min-width: 0;
        }

        .appointment-main h4 {
          margin: 0;
          color: #17324d;
          font-size: 15px;
        }

        .appointment-specialty {
          display: block;
          margin-top: 4px;
          color: #3b82f6;
          font-size: 12px;
        }

        .appointment-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 18px;
          margin-top: 13px;
          color: #617b94;
          font-size: 11px;
        }

        .appointment-meta span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .appointment-reason {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #e6eef5;
          color: #607b95;
          font-size: 11px;
        }

        .appointment-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .appointment-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 72px;
          height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          background: #dcfce7;
          color: #15803d;
          font-size: 10px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .cancel-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 32px;
          padding: 0 11px;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          background: #ffffff;
          color: #dc2626;
          font-size: 10px;
          cursor: pointer;
        }

        .cancel-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .empty-appointments,
        .empty-doctors {
          min-height: 230px;
          margin-top: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px dashed #cddce9;
          border-radius: 14px;
          text-align: center;
          color: #8ba1b5;
        }

        .empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #eff6ff;
          color: #2563eb;
        }

        .empty-appointments strong,
        .empty-doctors strong {
          color: #405b74;
          font-size: 13px;
        }

        .doctor-filters {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 190px;
          gap: 10px;
          margin-top: 20px;
        }

        .doctor-search-box {
          display: flex;
          align-items: center;
          gap: 9px;
          height: 43px;
          padding: 0 13px;
          border: 1px solid #dfe9f2;
          border-radius: 10px;
          color: #8da2b5;
        }

        .doctor-search-box input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-family: inherit;
          font-size: 11px;
        }

        .doctor-filters select {
          height: 43px;
          width: 100%;
          padding: 0 12px;
          border: 1px solid #dfe9f2;
          border-radius: 10px;
          outline: 0;
          background: #ffffff;
          color: #536c83;
          font-family: inherit;
          font-size: 11px;
        }

        .doctor-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 13px;
          margin-top: 18px;
        }

        .doctor-card {
          display: flex;
          flex-direction: column;
          min-height: 245px;
          padding: 15px;
          border: 1px solid #e1eaf2;
          border-radius: 13px;
          background: #ffffff;
          transition: 0.2s ease;
        }

        .doctor-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 9px 25px
            rgba(20, 57, 84, 0.07);
        }

        .doctor-card-top {
          display: flex;
          gap: 10px;
        }

        .doctor-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 12px;
          background: #eff6ff;
          color: #2563eb;
        }

        .doctor-title {
          min-width: 0;
        }

        .doctor-name {
          margin: 0;
          color: #17324d;
          font-size: 13px;
        }

        .doctor-specialization {
          display: block;
          margin-top: 5px;
          color: #61809a;
          font-size: 10px;
        }

        .doctor-rating {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 14px;
          color: #637c94;
          font-size: 10px;
        }

        .doctor-rating svg {
          color: #f59e0b;
          fill: #f59e0b;
        }

        .doctor-hospital {
          display: flex;
          gap: 6px;
          margin-top: 11px;
          color: #688198;
          font-size: 9.5px;
        }

        .doctor-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: auto;
          padding-top: 13px;
          border-top: 1px solid #edf2f6;
        }

        .doctor-fee {
          color: #1e354c;
          font-size: 11px;
          font-weight: 800;
        }

        .doctor-fee span {
          color: #8ca0b2;
          font-size: 9px;
          font-weight: 400;
        }

        .book-btn {
          height: 34px;
          padding: 0 10px;
          border: 0;
          border-radius: 8px;
          background: #2563eb;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .book-btn:hover {
          background: #1d4ed8;
        }

        .appointments-loading {
          min-height: 450px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #2563eb;
        }

        .appointments-loading p {
          margin-top: 12px;
          color: #7c92a7;
          font-size: 12px;
        }

        .appointment-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(
            15,
            23,
            42,
            0.48
          );
        }

        .appointment-modal {
          width: min(530px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border-radius: 17px;
          background: #ffffff;
          box-shadow:
            0 30px 80px
            rgba(15, 23, 42, 0.22);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .modal-header h2 {
          margin: 3px 0 4px;
          color: #17324d;
          font-size: 20px;
        }

        .modal-header p {
          margin: 0;
          color: #71869b;
          font-size: 11px;
        }

        .modal-close {
          width: 35px;
          height: 35px;
          border: 0;
          border-radius: 9px;
          background: #f8fafc;
          color: #64748b;
          cursor: pointer;
        }

        .booking-doctor-info {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px;
          margin-bottom: 17px;
          border-radius: 10px;
          background: #f8fbff;
          border: 1px solid #e5eef6;
        }

        .booking-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #eff6ff;
          color: #2563eb;
        }

        .booking-doctor-info strong {
          display: block;
          color: #334155;
          font-size: 13px;
        }

        .booking-doctor-info span {
          display: block;
          margin-top: 3px;
          color: #71869b;
          font-size: 10px;
        }

        .appointment-modal form {
          display: grid;
          gap: 14px;
        }

        .appointment-modal label {
          display: grid;
          gap: 6px;
        }

        .appointment-modal label > span {
          color: #475569;
          font-size: 11px;
          font-weight: 600;
        }

        .appointment-modal input,
        .appointment-modal select,
        .appointment-modal textarea {
          width: 100%;
          padding: 10px 11px;
          border: 1px solid #dfe7ef;
          border-radius: 8px;
          outline: 0;
          background: #ffffff;
          color: #334155;
          font-family: inherit;
          font-size: 12px;
        }

        .appointment-modal textarea {
          resize: vertical;
        }

        .booking-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .booking-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 4px;
        }

        .secondary-btn,
        .primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 38px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .secondary-btn {
          border: 1px solid #dfe7ef;
          background: #ffffff;
          color: #475569;
        }

        .primary-btn {
          border: 0;
          background: #2563eb;
          color: #ffffff;
        }

        .primary-btn:hover {
          background: #1d4ed8;
        }

        .appointment-spin {
          animation:
            mednexus-appointment-spin
            1s linear infinite;
        }

        @keyframes mednexus-appointment-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1250px) {

          .appointments-layout {
            grid-template-columns:
              minmax(350px, 0.85fr)
              minmax(500px, 1.15fr);
          }

          .doctor-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }

        @media (max-width: 1000px) {

          .appointments-layout {
            grid-template-columns: 1fr;
          }

          .appointments-panel,
          .doctors-panel {
            min-height: auto;
          }

          .doctor-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

        }

        @media (max-width: 760px) {

          .appointments-page {
            padding: 20px 16px 30px;
          }

          .appointments-header {
            flex-direction: column;
          }

          .refresh-button {
            width: 100%;
          }

          .doctor-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .doctor-filters {
            grid-template-columns: 1fr;
          }

          .appointment-card {
            grid-template-columns:
              48px minmax(0, 1fr);
          }

          .appointment-actions {
            grid-column: 2;
            flex-direction: row;
            align-items: center;
          }

        }

        @media (max-width: 520px) {

          .appointments-panel,
          .doctors-panel {
            padding: 17px;
          }

          .doctor-grid {
            grid-template-columns: 1fr;
          }

          .appointment-card {
            grid-template-columns: 1fr;
          }

          .appointment-actions {
            grid-column: auto;
          }

          .booking-form-grid {
            grid-template-columns: 1fr;
          }

        }

        `}
      </style>

    </div>
  );
}

/* ============================================================
   DOCTOR CARD
============================================================ */

function DoctorCard({
  doctor,
  onBook,
}) {
  return (
    <div className="doctor-card">

      <div className="doctor-card-top">

        <div className="doctor-avatar">
          <Stethoscope size={21} />
        </div>

        <div className="doctor-title">

          <h4 className="doctor-name">
            {doctor.doctor_name ||
              "Doctor"}
          </h4>

          <span className="doctor-specialization">
            {doctor.specialization ||
              "General Medicine"}
          </span>

        </div>

      </div>

      <div className="doctor-rating">

        <Star size={12} />

        <strong>
          {doctor.rating ?? "N/A"}
        </strong>

        <span>•</span>

        <span>
          {doctor.experience_years ??
            0}{" "}
          years experience
        </span>

      </div>

      {doctor.hospital_name && (
        <div className="doctor-hospital">

          <Building2 size={12} />

          <span>
            {doctor.hospital_name}
          </span>

        </div>
      )}

      <div className="doctor-footer">

        <div className="doctor-fee">

          ₹
          {doctor.consultation_fee ??
            "N/A"}

          <span>
            {" "}
            / consultation
          </span>

        </div>

        <button
          type="button"
          className="book-btn"
          onClick={() =>
            onBook(doctor)
          }
        >
          Book Now
        </button>

      </div>

    </div>
  );
}

/* ============================================================
   APPOINTMENT CARD
============================================================ */

function AppointmentCard({
  appointment,
  cancelling,
  onCancel,
}) {
  const isOnline =
    appointment.appointment_type ===
    "online";

  const status =
    String(
      appointment.status ||
        "scheduled"
    ).toLowerCase();

  return (
    <div className="appointment-card">

      <div className="appointment-doctor-icon">

        {isOnline ? (
          <Video size={23} />
        ) : (
          <Stethoscope size={23} />
        )}

      </div>

      <div className="appointment-main">

        <h4>
          {appointment.doctor_name ||
            "Doctor"}
        </h4>

        <span className="appointment-specialty">
          {appointment.specialization ||
            "Medical Consultation"}
        </span>

        <div className="appointment-meta">

          <span>
            <CalendarDays size={13} />

            {formatDate(
              appointment.appointment_date
            )}
          </span>

          <span>
            <Clock3 size={13} />

            {formatTime(
              appointment.appointment_time
            )}
          </span>

          {appointment.hospital_name && (
            <span>
              <MapPin size={13} />

              {
                appointment.hospital_name
              }
            </span>
          )}

        </div>

        {appointment.reason && (
          <div className="appointment-reason">

            <strong>
              Reason for Visit:
            </strong>{" "}

            {appointment.reason}

          </div>
        )}

      </div>

      <div className="appointment-actions">

        <span className="appointment-status">
          {status}
        </span>

        {status !==
          "cancelled" && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() =>
              onCancel(
                appointment.id
              )
            }
            disabled={cancelling}
          >

            {cancelling ? (
              <RefreshCw
                size={12}
                className="appointment-spin"
              />
            ) : (
              <XCircle size={12} />
            )}

            {cancelling
              ? "Cancelling..."
              : "Cancel"}

          </button>
        )}

      </div>

    </div>
  );
}

/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(date) {
  if (!date) {
    return "Date unavailable";
  }

  try {
    const value =
      String(date).trim();

    const match =
      value.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      );

    if (match) {
      const [
        ,
        year,
        month,
        day,
      ] = match;

      const localDate =
        new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        );

      return localDate.toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    }

    const parsed =
      new Date(value);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "Date unavailable";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "Date unavailable";
  }
}

/* ============================================================
   TIME FORMAT
============================================================ */

function formatTime(time) {
  if (!time) {
    return "Time unavailable";
  }

  try {
    const value =
      String(time).trim();

    const [
      hours,
      minutes,
    ] = value.split(":");

    const date =
      new Date();

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
    return time;
  }
}

export default Appointments;