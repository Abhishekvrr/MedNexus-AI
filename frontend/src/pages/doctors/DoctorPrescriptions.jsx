import {
  FilePlus2,
  User,
  Pill,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useState,
} from "react";


function DoctorPrescriptions() {

  const [medicines, setMedicines] =
    useState([
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);


  const [patientName, setPatientName] =
    useState("");

  const [diagnosis, setDiagnosis] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [success, setSuccess] =
    useState("");


  const addMedicine = () => {

    setMedicines([
      ...medicines,

      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },

    ]);

  };


  const removeMedicine = (index) => {

    if (medicines.length === 1) {
      return;
    }


    setMedicines(
      medicines.filter(
        (_, i) => i !== index
      )
    );

  };


  const updateMedicine = (
    index,
    field,
    value
  ) => {

    const updated =
      [...medicines];

    updated[index][field] =
      value;

    setMedicines(updated);

  };


  const handleSubmit = (event) => {

    event.preventDefault();

    setSuccess(
      "Prescription prepared successfully."
    );

    console.log({
      patientName,
      diagnosis,
      medicines,
      notes,
    });

  };


  return (

    <div className="prescription-page">


      {/* =================================
          HEADER
      ================================= */}

      <div className="prescription-header">

        <div>

          <span>
            DOCTOR PORTAL
          </span>

          <h1>
            Create Prescription
          </h1>

          <p>
            Prepare a digital prescription
            for your patient.
          </p>

        </div>

      </div>


      {success && (

        <div className="prescription-success">

          {success}

        </div>

      )}


      <form
        onSubmit={handleSubmit}
        className="prescription-layout"
      >


        {/* =================================
            PATIENT INFORMATION
        ================================= */}

        <section className="prescription-panel">

          <div className="prescription-panel-header">

            <div className="prescription-icon">

              <User size={18} />

            </div>

            <div>

              <h2>
                Patient Information
              </h2>

              <p>
                Enter the patient details.
              </p>

            </div>

          </div>


          <div className="prescription-field">

            <label>
              Patient Name
            </label>

            <input
              value={patientName}
              onChange={(e) =>
                setPatientName(
                  e.target.value
                )
              }
              placeholder="Enter patient name"
              required
            />

          </div>


          <div className="prescription-field">

            <label>
              Diagnosis
            </label>

            <textarea
              value={diagnosis}
              onChange={(e) =>
                setDiagnosis(
                  e.target.value
                )
              }
              placeholder="Enter diagnosis"
              rows={4}
              required
            />

          </div>


          <div className="prescription-field">

            <label>
              Clinical Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Additional instructions or clinical notes..."
              rows={5}
            />

          </div>

        </section>


        {/* =================================
            MEDICINES
        ================================= */}

        <section className="prescription-panel">

          <div className="prescription-panel-header">

            <div className="prescription-icon">

              <Pill size={18} />

            </div>

            <div>

              <h2>
                Medicines
              </h2>

              <p>
                Add medicines and dosage instructions.
              </p>

            </div>

          </div>


          <div className="medicine-list">

            {medicines.map(
              (medicine, index) => (

                <div
                  className="medicine-card"
                  key={index}
                >

                  <div className="medicine-card-header">

                    <strong>
                      Medicine {index + 1}
                    </strong>


                    <button
                      type="button"
                      onClick={() =>
                        removeMedicine(index)
                      }
                    >

                      <Trash2 size={14} />

                    </button>

                  </div>


                  <div className="medicine-grid">

                    <div className="prescription-field">

                      <label>
                        Medicine Name
                      </label>

                      <input
                        value={medicine.name}
                        onChange={(e) =>
                          updateMedicine(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Paracetamol"
                        required
                      />

                    </div>


                    <div className="prescription-field">

                      <label>
                        Dosage
                      </label>

                      <input
                        value={medicine.dosage}
                        onChange={(e) =>
                          updateMedicine(
                            index,
                            "dosage",
                            e.target.value
                          )
                        }
                        placeholder="e.g. 500 mg"
                        required
                      />

                    </div>


                    <div className="prescription-field">

                      <label>
                        Frequency
                      </label>

                      <input
                        value={medicine.frequency}
                        onChange={(e) =>
                          updateMedicine(
                            index,
                            "frequency",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Twice daily"
                        required
                      />

                    </div>


                    <div className="prescription-field">

                      <label>
                        Duration
                      </label>

                      <input
                        value={medicine.duration}
                        onChange={(e) =>
                          updateMedicine(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        placeholder="e.g. 5 days"
                        required
                      />

                    </div>

                  </div>


                  <div className="prescription-field">

                    <label>
                      Instructions
                    </label>

                    <input
                      value={
                        medicine.instructions
                      }
                      onChange={(e) =>
                        updateMedicine(
                          index,
                          "instructions",
                          e.target.value
                        )
                      }
                      placeholder="e.g. After food"
                    />

                  </div>

                </div>

              )
            )}

          </div>


          <button
            type="button"
            className="add-medicine"
            onClick={addMedicine}
          >

            <Plus size={15} />

            Add Medicine

          </button>


          <button
            type="submit"
            className="save-prescription"
          >

            <Save size={16} />

            Save Prescription

          </button>

        </section>

      </form>


      <style>
        {`

        .prescription-page {
          width: 100%;
        }


        .prescription-header {
          margin-bottom: 22px;
        }


        .prescription-header span {
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }


        .prescription-header h1 {
          margin: 6px 0 0;
          color: #102a43;
          font-size: 29px;
        }


        .prescription-header p {
          margin: 6px 0 0;
          color: #7890a8;
          font-size: 12px;
        }


        .prescription-success {
          margin-bottom: 16px;
          padding: 12px 14px;
          border-radius: 9px;
          background: #ecfdf5;
          color: #15803d;
          font-size: 12px;
          font-weight: 600;
        }


        .prescription-layout {
          display: grid;
          grid-template-columns:
            minmax(300px,.75fr)
            minmax(0,1.25fr);
          gap: 18px;
        }


        .prescription-panel {
          padding: 20px;
          border: 1px solid #e5edf5;
          border-radius: 14px;
          background: white;
        }


        .prescription-panel-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }


        .prescription-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
        }


        .prescription-panel-header h2 {
          margin: 0;
          color: #102a43;
          font-size: 16px;
        }


        .prescription-panel-header p {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 10px;
        }


        .prescription-field {
          margin-bottom: 15px;
        }


        .prescription-field label {
          display: block;
          margin-bottom: 6px;
          color: #475569;
          font-size: 10px;
          font-weight: 650;
        }


        .prescription-field input,
        .prescription-field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dfe7ef;
          border-radius: 8px;
          outline: none;
          padding: 10px 11px;
          color: #334155;
          font-family: inherit;
          font-size: 11px;
          resize: vertical;
        }


        .prescription-field input {
          height: 40px;
        }


        .prescription-field input:focus,
        .prescription-field textarea:focus {
          border-color: #93c5fd;
          box-shadow:
            0 0 0 3px #eff6ff;
        }


        .medicine-card {
          padding: 15px;
          margin-bottom: 12px;
          border: 1px solid #e5edf5;
          border-radius: 11px;
          background: #f8fafc;
        }


        .medicine-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 13px;
        }


        .medicine-card-header strong {
          color: #334155;
          font-size: 11px;
        }


        .medicine-card-header button {
          width: 29px;
          height: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 7px;
          background: #fef2f2;
          color: #dc2626;
          cursor: pointer;
        }


        .medicine-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }


        .medicine-grid .prescription-field {
          margin-bottom: 5px;
        }


        .add-medicine {
          width: 100%;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px dashed #93c5fd;
          border-radius: 8px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
        }


        .save-prescription {
          width: 100%;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 10px;
          border: 0;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
        }


        .save-prescription:hover {
          background: #1d4ed8;
        }


        @media (max-width: 900px) {

          .prescription-layout {
            grid-template-columns: 1fr;
          }

        }


        @media (max-width: 600px) {

          .medicine-grid {
            grid-template-columns: 1fr;
          }

        }

        `}
      </style>

    </div>

  );
}


export default DoctorPrescriptions;