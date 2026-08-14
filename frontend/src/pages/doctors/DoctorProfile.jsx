import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

function DoctorProfile() {

  const storedUser =
    localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Unable to read user:",
      error
    );
  }

  const name =
    user?.full_name ||
    user?.name ||
    "Doctor";

  const email =
    user?.email ||
    "doctor@test.com";

  const phone =
    user?.phone ||
    "Not provided";

  return (
    <div className="doctor-page">

      <div className="doctor-page-header">

        <div>
          <h1>Doctor Profile</h1>

          <p>
            Manage your professional profile.
          </p>
        </div>

        <div className="doctor-header-icon">
          <UserRound size={26} />
        </div>

      </div>


      <div className="doctor-profile-card">

        <div className="doctor-profile-avatar">
          {name
            .split(" ")
            .map(
              (word) =>
                word[0]
            )
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>

        <h2>
          {name}
        </h2>

        <span className="doctor-profile-role">
          Doctor
        </span>


        <div className="doctor-profile-details">

          <div>
            <Mail size={18} />

            <section>
              <small>Email</small>
              <strong>{email}</strong>
            </section>
          </div>


          <div>
            <Phone size={18} />

            <section>
              <small>Phone</small>
              <strong>{phone}</strong>
            </section>
          </div>


          <div>
            <ShieldCheck size={18} />

            <section>
              <small>Account Role</small>
              <strong>Doctor</strong>
            </section>
          </div>

        </div>

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

        .doctor-profile-card {
          max-width: 700px;
          margin: 0 auto;
          padding: 35px;
          text-align: center;
          background: white;
          border: 1px solid #e5edf5;
          border-radius: 18px;
        }

        .doctor-profile-avatar {
          width: 90px;
          height: 90px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #dbeafe;
          color: #2563eb;
          font-size: 24px;
          font-weight: 800;
        }

        .doctor-profile-card h2 {
          margin: 0;
          color: #102a43;
          font-size: 22px;
        }

        .doctor-profile-role {
          display: block;
          margin-top: 5px;
          color: #2563eb;
          font-size: 13px;
          font-weight: 700;
        }

        .doctor-profile-details {
          margin-top: 30px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }

        .doctor-profile-details > div {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border-radius: 11px;
          background: #f8fafc;
        }

        .doctor-profile-details svg {
          color: #2563eb;
        }

        .doctor-profile-details section {
          display: flex;
          flex-direction: column;
        }

        .doctor-profile-details small {
          color: #94a3b8;
          font-size: 10px;
        }

        .doctor-profile-details strong {
          margin-top: 3px;
          color: #334155;
          font-size: 13px;
        }

      `}</style>

    </div>
  );
}

export default DoctorProfile;