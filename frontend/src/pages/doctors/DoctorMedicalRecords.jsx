import {
  FileText,
  Search,
  UserRound,
} from "lucide-react";

function DoctorMedicalRecords() {

  const patients = [
    {
      id: 1,
      name: "John Doe",
      condition: "Hypertension",
      lastVisit: "08 Aug 2026",
    },
    {
      id: 2,
      name: "Sarah Wilson",
      condition: "Diabetes",
      lastVisit: "06 Aug 2026",
    },
    {
      id: 3,
      name: "Michael Brown",
      condition: "Heart Disease",
      lastVisit: "04 Aug 2026",
    },
  ];

  return (
    <div className="doctor-page">

      <div className="doctor-page-header">

        <div>
          <h1>Patient Records</h1>

          <p>
            View and manage medical records of your patients.
          </p>
        </div>

        <div className="doctor-header-icon">
          <FileText size={26} />
        </div>

      </div>


      <div className="doctor-search-box">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search patients..."
        />

      </div>


      <div className="doctor-record-grid">

        {patients.map(
          (patient) => (

            <div
              key={patient.id}
              className="doctor-record-card"
            >

              <div className="doctor-record-top">

                <div className="doctor-patient-avatar">
                  <UserRound size={21} />
                </div>

                <div>
                  <h3>
                    {patient.name}
                  </h3>

                  <span>
                    {patient.condition}
                  </span>
                </div>

              </div>


              <div className="doctor-record-info">

                <div>
                  <small>
                    Last Visit
                  </small>

                  <strong>
                    {patient.lastVisit}
                  </strong>
                </div>

                <button>
                  View Record
                </button>

              </div>

            </div>

          )
        )}

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

        .doctor-search-box {
          height: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 15px;
          margin-bottom: 20px;
          background: white;
          border: 1px solid #e5edf5;
          border-radius: 12px;
        }

        .doctor-search-box svg {
          color: #94a3b8;
        }

        .doctor-search-box input {
          width: 100%;
          border: none;
          outline: none;
          color: #172b4d;
          font-size: 13px;
        }

        .doctor-record-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .doctor-record-card {
          padding: 20px;
          background: white;
          border: 1px solid #e5edf5;
          border-radius: 15px;
        }

        .doctor-record-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .doctor-patient-avatar {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #eff6ff;
          color: #2563eb;
        }

        .doctor-record-top h3 {
          margin: 0;
          color: #172b4d;
          font-size: 15px;
        }

        .doctor-record-top span {
          display: block;
          margin-top: 4px;
          color: #64748b;
          font-size: 12px;
        }

        .doctor-record-info {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 22px;
        }

        .doctor-record-info div {
          display: flex;
          flex-direction: column;
        }

        .doctor-record-info small {
          color: #94a3b8;
          font-size: 10px;
        }

        .doctor-record-info strong {
          margin-top: 4px;
          color: #475569;
          font-size: 12px;
        }

        .doctor-record-info button {
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          background: #eff6ff;
          color: #2563eb;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        .doctor-record-info button:hover {
          background: #2563eb;
          color: white;
        }

        @media (max-width: 900px) {

          .doctor-record-grid {
            grid-template-columns: repeat(2, 1fr);
          }

        }

        @media (max-width: 600px) {

          .doctor-record-grid {
            grid-template-columns: 1fr;
          }

        }

      `}</style>

    </div>
  );
}

export default DoctorMedicalRecords;