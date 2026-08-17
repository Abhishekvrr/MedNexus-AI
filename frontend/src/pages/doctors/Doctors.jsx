import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  Star,
  Stethoscope,
  Building2,
  Video,
  RefreshCw,
  AlertCircle,
  XCircle,
} from "lucide-react";

import API_BASE_URL from "../../config/api";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const loadDoctors = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to continue.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/doctors`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load doctors."
        );
      }

      setDoctors(data.doctors || []);
    } catch (err) {
      console.error("Doctors page error:", err);

      setError(
        err.message || "Unable to load doctors."
      );
    } finally {
      setLoading(false);
    }
  };

  const specializations = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesSearch =
        !searchValue ||
        doctor.doctor_name
          ?.toLowerCase()
          .includes(searchValue) ||
        doctor.specialization
          ?.toLowerCase()
          .includes(searchValue) ||
        doctor.hospital_name
          ?.toLowerCase()
          .includes(searchValue);

      const matchesSpecialization =
        specialization === "All" ||
        doctor.specialization === specialization;

      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, search, specialization]);

  return (
    <div className="doctors-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}
      <div className="doctors-page-header">

        <div>
          <span className="doctors-eyebrow">
            MEDNEXUS AI
          </span>

          <h1>Doctors</h1>

          <p>
            Find and connect with trusted
            healthcare specialists.
          </p>
        </div>

        <button
          type="button"
          className="doctors-refresh-btn"
          onClick={loadDoctors}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "doctors-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* =========================================
          ERROR
      ========================================= */}
      {error && (
        <div className="doctors-alert">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* =========================================
          MAIN DOCTORS BOARD
      ========================================= */}
      <section className="doctors-board">

        {/* BOARD HEADER */}
        <div className="doctors-board-header">

          <div>
            <h2>Find a Doctor</h2>

            <p>
              Choose a specialist for your
              consultation.
            </p>
          </div>

          <div className="available-count">
            <strong>
              {doctors.length}
            </strong>

            <span>Available</span>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="doctor-filters">

          <div className="doctor-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search doctors, specialties..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={specialization}
            onChange={(event) =>
              setSpecialization(
                event.target.value
              )
            }
          >
            {specializations.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

        </div>

        {/* =========================================
            LOADING
        ========================================= */}
        {loading ? (
          <div className="doctors-loading">

            <RefreshCw
              size={32}
              className="doctors-spin"
            />

            <p>
              Loading doctors...
            </p>

          </div>
        ) : filteredDoctors.length === 0 ? (

          /* =========================================
              EMPTY
          ========================================= */
          <div className="doctors-empty">

            <Stethoscope size={36} />

            <strong>
              No doctors found
            </strong>

            <span>
              Try another doctor name or
              specialization.
            </span>

          </div>

        ) : (

          /* =========================================
              DOCTOR GRID
          ========================================= */
          <div className="doctors-grid">

            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
              />
            ))}

          </div>
        )}

      </section>

      {/* =========================================
          PAGE STYLES
      ========================================= */}
      <style>
        {`

        /* ========================================
           PAGE
        ======================================== */

        .doctors-page {
          width: 100%;
          min-height: 100%;
          box-sizing: border-box;
          padding: 0;
          display: block;
        }

        /* ========================================
           PAGE HEADER
        ======================================== */

        .doctors-page-header {
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .doctors-eyebrow {
          display: block;
          margin-bottom: 6px;
          color: #0f8f9d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .doctors-page-header h1 {
          margin: 0;
          color: #102a43;
          font-size: 30px;
          line-height: 1.2;
          font-weight: 700;
        }

        .doctors-page-header p {
          margin: 7px 0 0;
          color: #7890a8;
          font-size: 13px;
        }

        .doctors-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 105px;
          height: 40px;
          padding: 0 14px;
          border: 1px solid #dbeafe;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .doctors-refresh-btn:hover {
          background: #dbeafe;
        }

        .doctors-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ========================================
           ALERT
        ======================================== */

        .doctors-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 12px;
        }

        .doctors-alert span {
          flex: 1;
        }

        .doctors-alert button {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          color: #b91c1c;
          cursor: pointer;
        }

        /* ========================================
           MAIN BOARD
        ======================================== */

        .doctors-board {
          width: 100%;
          box-sizing: border-box;
          padding: 24px;
          border: 1px solid #e5edf5;
          border-radius: 16px;
          background: #ffffff;
          box-shadow:
            0 4px 18px rgba(15, 23, 42, 0.035);
        }

        /* ========================================
           BOARD HEADER
        ======================================== */

        .doctors-board-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .doctors-board-header h2 {
          margin: 0;
          color: #102a43;
          font-size: 21px;
          font-weight: 700;
        }

        .doctors-board-header p {
          margin: 6px 0 0;
          color: #8aa0b5;
          font-size: 12px;
        }

        .available-count {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 9px 13px;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
          white-space: nowrap;
          font-size: 11px;
        }

        .available-count strong {
          font-size: 14px;
        }

        /* ========================================
           FILTERS
        ======================================== */

        .doctor-filters {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: 12px;
          margin-bottom: 20px;
        }

        .doctor-search {
          display: flex;
          align-items: center;
          gap: 9px;
          height: 44px;
          box-sizing: border-box;
          padding: 0 13px;
          border: 1px solid #dfe7ef;
          border-radius: 9px;
          background: #ffffff;
          color: #91a4b7;
        }

        .doctor-search:focus-within {
          border-color: #93c5fd;
          box-shadow:
            0 0 0 3px #eff6ff;
        }

        .doctor-search input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #334155;
          font-family: inherit;
          font-size: 12px;
        }

        .doctor-search input::placeholder {
          color: #94a3b8;
        }

        .doctor-filters select {
          width: 100%;
          height: 44px;
          box-sizing: border-box;
          padding: 0 12px;
          border: 1px solid #dfe7ef;
          border-radius: 9px;
          outline: 0;
          background: #ffffff;
          color: #475569;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
        }

        .doctor-filters select:focus {
          border-color: #93c5fd;
          box-shadow:
            0 0 0 3px #eff6ff;
        }

        /* ========================================
           DOCTOR GRID
        ======================================== */

        .doctors-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        /* ========================================
           DOCTOR CARD
        ======================================== */

        .doctor-card {
          min-width: 0;
          min-height: 300px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          padding: 18px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #ffffff;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .doctor-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow:
            0 10px 28px rgba(15, 23, 42, 0.07);
        }

        .doctor-card-top {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .doctor-avatar {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #eff6ff;
          color: #2563eb;
        }

        .doctor-name {
          margin: 0;
          color: #172b4d;
          font-size: 14px;
          line-height: 1.25;
          font-weight: 700;
        }

        .doctor-specialization {
          display: block;
          margin-top: 4px;
          color: #71869c;
          font-size: 11px;
        }

        /* ========================================
           RATING
        ======================================== */

        .doctor-rating {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 17px;
          color: #64748b;
          font-size: 10px;
        }

        .doctor-rating svg {
          color: #f59e0b;
          fill: #f59e0b;
        }

        .doctor-rating strong {
          color: #334155;
          font-size: 11px;
        }

        /* ========================================
           HOSPITAL
        ======================================== */

        .doctor-hospital {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin-top: 12px;
          color: #71869c;
          font-size: 10px;
          line-height: 1.4;
        }

        .doctor-hospital svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ========================================
           ONLINE BADGE
        ======================================== */

        .doctor-online {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          width: fit-content;
          margin-top: 14px;
          padding: 5px 8px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #15803d;
          font-size: 9px;
          font-weight: 600;
        }

        .online-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
        }

        /* ========================================
           CARD FOOTER
        ======================================== */

        .doctor-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: auto;
          padding-top: 15px;
          border-top: 1px solid #edf2f7;
        }

        .doctor-fee {
          min-width: 0;
          color: #172b4d;
          font-size: 13px;
          font-weight: 700;
        }

        .doctor-fee-label {
          display: block;
          margin-top: 3px;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 400;
        }

        .book-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-width: 99px;
          height: 40px;
          padding: 0 12px;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .book-btn:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        /* ========================================
           LOADING
        ======================================== */

        .doctors-loading {
          min-height: 260px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #2563eb;
        }

        .doctors-loading p {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
        }

        /* ========================================
           EMPTY
        ======================================== */

        .doctors-empty {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
          color: #94a3b8;
        }

        .doctors-empty strong {
          color: #475569;
          font-size: 13px;
        }

        .doctors-empty span {
          font-size: 11px;
        }

        /* ========================================
           SPINNER
        ======================================== */

        .doctors-spin {
          animation:
            doctors-spin-animation
            1s linear infinite;
        }

        @keyframes doctors-spin-animation {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* ========================================
           RESPONSIVE
        ======================================== */

        @media (max-width: 1100px) {
          .doctors-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {

          .doctors-page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .doctors-board {
            padding: 18px;
          }

          .doctor-filters {
            grid-template-columns: 1fr;
          }

          .doctors-grid {
            grid-template-columns: 1fr;
          }

          .doctors-board-header {
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {

          .doctors-page-header h1 {
            font-size: 26px;
          }

          .doctors-board-header {
            flex-direction: column;
          }

          .doctor-card {
            min-height: 280px;
          }
        }

        `}
      </style>
    </div>
  );
}


/* =====================================================
   DOCTOR CARD
===================================================== */

function DoctorCard({ doctor }) {
  return (
    <div className="doctor-card">

      {/* TOP */}
      <div className="doctor-card-top">

        <div className="doctor-avatar">
          <Stethoscope size={22} />
        </div>

        <div>
          <h3 className="doctor-name">
            {doctor.doctor_name || "Doctor"}
          </h3>

          <span className="doctor-specialization">
            {doctor.specialization ||
              "Medical Specialist"}
          </span>
        </div>

      </div>

      {/* RATING */}
      <div className="doctor-rating">

        <Star size={13} />

        <strong>
          {doctor.rating ?? "N/A"}
        </strong>

        <span>•</span>

        <span>
          {doctor.experience_years ?? 0}
          {" "}years experience
        </span>

      </div>

      {/* HOSPITAL */}
      {doctor.hospital_name && (
        <div className="doctor-hospital">

          <Building2 size={13} />

          <span>
            {doctor.hospital_name}
          </span>

        </div>
      )}

      {/* ONLINE */}
      {doctor.available_for_online && (
        <div className="doctor-online">

          <span className="online-dot" />

          <Video size={11} />

          Online consultation

        </div>
      )}

      {/* FOOTER */}
      <div className="doctor-footer">

        <div className="doctor-fee">

          ₹
          {doctor.consultation_fee ??
            "N/A"}

          <span className="doctor-fee-label">
            Consultation fee
          </span>

        </div>

        <button
          type="button"
          className="book-btn"
          onClick={() => {
            window.location.href =
              `/appointments?doctor=${doctor.id}`;
          }}
        >
          <CalendarDays size={14} />

          Book Now
        </button>

      </div>

    </div>
  );
}

export default Doctors; 