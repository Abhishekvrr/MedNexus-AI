import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  UserRound,
  HeartPulse,
  Droplets,
  Activity,
  ChevronRight,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token missing.");
      }

      const response = await fetch(`${API_URL}/doctor/patients`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load patients."
        );
      }

      const patientData = data.patients || [];

      setPatients(patientData);
      setFilteredPatients(patientData);
    } catch (err) {
      console.error("Doctor patients:", err);
      setError(err.message || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter((patient) =>
      [
        patient.full_name,
        patient.email,
        patient.phone,
        patient.gender,
        patient.blood_group,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field).toLowerCase().includes(value)
        )
    );

    setFilteredPatients(filtered);
  }, [search, patients]);

  const getInitials = (name) => {
    if (!name) return "P";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return null;

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="doctor-page">
      {/* =========================================
          PAGE HEADER
      ========================================= */}
      <div className="doctor-page-header">
        <div className="doctor-header-content">
          <div className="doctor-eyebrow">
            <Users size={15} />
            <span>DOCTOR PORTAL</span>
          </div>

          <h1>Patients</h1>

          <p>
            View and manage patients associated with your
            appointments.
          </p>
        </div>

        <button
          className="doctor-primary-button"
          onClick={loadPatients}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "spin" : ""}
          />
          <span>{loading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* =========================================
          STATISTICS
      ========================================= */}
      <div className="doctor-stat-grid">
        <div className="doctor-stat-card">
          <div className="doctor-stat-icon blue">
            <Users size={21} />
          </div>

          <div className="doctor-stat-content">
            <span>Total Patients</span>
            <strong>{patients.length}</strong>
            <small>Patients under your care</small>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon green">
            <Activity size={21} />
          </div>

          <div className="doctor-stat-content">
            <span>Active Records</span>
            <strong>{patients.length}</strong>
            <small>Available patient records</small>
          </div>
        </div>

        <div className="doctor-stat-card">
          <div className="doctor-stat-icon teal">
            <HeartPulse size={21} />
          </div>

          <div className="doctor-stat-content">
            <span>Patient Care</span>
            <strong>Active</strong>
            <small>Healthcare monitoring</small>
          </div>
        </div>
      </div>

      {/* =========================================
          PATIENT DIRECTORY
      ========================================= */}
      <div className="doctor-content-card">
        <div className="doctor-card-header">
          <div>
            <h2>Patient Directory</h2>

            <p>
              {filteredPatients.length}{" "}
              {filteredPatients.length === 1
                ? "patient"
                : "patients"}{" "}
              found
            </p>
          </div>

          <div className="doctor-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                className="doctor-search-clear"
                onClick={() => setSearch("")}
                type="button"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* =========================================
            ERROR
        ========================================= */}
        {error && (
          <div className="doctor-error">
            <div className="doctor-error-icon">
              !
            </div>

            <div>
              <strong>Unable to load patients</strong>
              <p>{error}</p>
            </div>

            <button onClick={loadPatients}>
              Try Again
            </button>
          </div>
        )}

        {/* =========================================
            LOADING
        ========================================= */}
        {loading ? (
          <div className="doctor-loading-state">
            <div className="doctor-loading-icon">
              <RefreshCw
                size={26}
                className="spin"
              />
            </div>

            <h3>Loading patients</h3>

            <p>
              Fetching patient records from your
              appointments...
            </p>
          </div>
        ) : filteredPatients.length === 0 ? (
          /* =========================================
             EMPTY STATE
          ========================================= */
          <div className="doctor-empty-state">
            <div className="doctor-empty-icon">
              <Users size={36} />
            </div>

            <h3>
              {search
                ? "No matching patients"
                : "No patients found"}
            </h3>

            <p>
              {search
                ? "Try searching with a different name, email, or phone number."
                : "Patients will appear here once they have appointments with you."}
            </p>

            {search && (
              <button
                className="doctor-secondary-button"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* =========================================
             PATIENT CARDS
          ========================================= */
          <div className="doctor-patient-grid">
            {filteredPatients.map((patient) => {
              const initials = getInitials(
                patient.full_name
              );

              const age = calculateAge(
                patient.date_of_birth
              );

              return (
                <div
                  className="doctor-patient-card"
                  key={patient.patient_id || patient.id}
                >
                  {/* Patient Header */}
                  <div className="doctor-patient-top">
                    <div className="doctor-patient-avatar">
                      {initials}
                    </div>

                    <div className="doctor-patient-name">
                      <h3>
                        {patient.full_name ||
                          "Unknown Patient"}
                      </h3>

                      <span>
                        Patient ID:{" "}
                        {patient.patient_id ||
                          patient.id ||
                          "N/A"}
                      </span>
                    </div>

                    <button className="doctor-card-arrow">
                      <ChevronRight size={17} />
                    </button>
                  </div>

                  {/* Patient Basic Info */}
                  <div className="doctor-patient-info">
                    {patient.email && (
                      <div className="doctor-info-row">
                        <div className="doctor-info-icon">
                          <Mail size={15} />
                        </div>

                        <div>
                          <span>Email</span>
                          <strong>
                            {patient.email}
                          </strong>
                        </div>
                      </div>
                    )}

                    {patient.phone && (
                      <div className="doctor-info-row">
                        <div className="doctor-info-icon">
                          <Phone size={15} />
                        </div>

                        <div>
                          <span>Phone</span>
                          <strong>
                            {patient.phone}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Medical Details */}
                  <div className="doctor-medical-grid">
                    {patient.gender && (
                      <div className="doctor-medical-item">
                        <UserRound size={15} />
                        <div>
                          <span>Gender</span>
                          <strong>
                            {patient.gender}
                          </strong>
                        </div>
                      </div>
                    )}

                    {age !== null && (
                      <div className="doctor-medical-item">
                        <Calendar size={15} />
                        <div>
                          <span>Age</span>
                          <strong>
                            {age} years
                          </strong>
                        </div>
                      </div>
                    )}

                    {patient.blood_group && (
                      <div className="doctor-medical-item blood">
                        <Droplets size={15} />
                        <div>
                          <span>Blood Group</span>
                          <strong>
                            {patient.blood_group}
                          </strong>
                        </div>
                      </div>
                    )}

                    {patient.weight_kg && (
                      <div className="doctor-medical-item">
                        <Activity size={15} />
                        <div>
                          <span>Weight</span>
                          <strong>
                            {patient.weight_kg} kg
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Appointment Information */}
                  <div className="doctor-patient-footer">
                    <div>
                      <span>Last Appointment</span>
                      <strong>
                        {formatDate(
                          patient.last_appointment
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Appointments</span>
                      <strong>
                        {patient.appointment_count || 0}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorPatients;