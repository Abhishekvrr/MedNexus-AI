import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  Droplets,
  Ruler,
  Weight,
  HeartPulse,
  ShieldCheck,
  Edit3,
  Save,
  X,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/patients/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load profile"
        );
      }

      const patient = data.profile || data.patient;

      if (!patient) {
        throw new Error("Profile data was not returned by the server.");
      }

      setProfile(patient);
      setForm(patient);
    } catch (err) {
      console.error("Profile error:", err);
      setError(err.message || "Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/patients/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date_of_birth: form.date_of_birth || null,
            gender: form.gender || null,
            blood_group: form.blood_group || null,
            height_cm: form.height_cm || null,
            weight_kg: form.weight_kg || null,
            emergency_contact_name:
              form.emergency_contact_name || null,
            emergency_contact_phone:
              form.emergency_contact_phone || null,
            emergency_contact_relation:
              form.emergency_contact_relation || null,
            allergies: form.allergies || null,
            chronic_conditions:
              form.chronic_conditions || null,
            current_medications:
              form.current_medications || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to update profile"
        );
      }

      const updatedProfile = data.profile || data.patient;

      setProfile(updatedProfile);
      setForm(updatedProfile);
      setEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(profile || {});
    setEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div className="loading-spinner" />
          <p style={{ color: "#64748b" }}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="page-container">
        <div
          style={{
            maxWidth: "700px",
            margin: "60px auto",
            padding: "30px",
            background: "#ffffff",
            borderRadius: "18px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <HeartPulse
            size={42}
            style={{
              color: "#ef4444",
              marginBottom: "12px",
            }}
          />

          <h2 style={{ marginBottom: "8px" }}>
            Unable to load profile
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: "20px",
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={loadProfile}
            style={{
              padding: "11px 20px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const fullName = profile?.full_name || "Patient";

  return (
    <div className="page-container">
      {/* PAGE HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#0f172a",
            }}
          >
            My Profile
          </h1>

          <p
            style={{
              marginTop: "6px",
              color: "#64748b",
            }}
          >
            Manage your personal and health information
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 18px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <Edit3 size={17} />
            Edit Profile
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "11px 17px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "#ffffff",
                color: "#334155",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "11px 17px",
                border: "none",
                borderRadius: "10px",
                background: "#16a34a",
                color: "#ffffff",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: 600,
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* PROFILE HERO */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
          border: "1px solid #dbeafe",
          borderRadius: "18px",
          padding: "28px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#2563eb",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "25px",
            fontWeight: 700,
          }}
        >
          {fullName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((name) => name[0])
            .join("")
            .toUpperCase()}
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              color: "#0f172a",
            }}
          >
            {fullName}
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#64748b",
            }}
          >
            Patient
          </p>
        </div>
      </div>

      {/* BASIC INFORMATION */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "18px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            fontSize: "19px",
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          <UserRound size={20} />
          Personal Information
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "18px",
          }}
        >
          <InfoItem
            icon={<Mail size={18} />}
            label="Email"
            value={profile?.email}
          />

          <InfoItem
            icon={<Phone size={18} />}
            label="Phone"
            value={profile?.phone}
          />

          {editing ? (
            <>
              <InputField
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
              />

              <InputField
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              />

              <InputField
                label="Blood Group"
                name="blood_group"
                value={form.blood_group}
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <InfoItem
                icon={<CalendarDays size={18} />}
                label="Date of Birth"
                value={profile?.date_of_birth}
              />

              <InfoItem
                icon={<UserRound size={18} />}
                label="Gender"
                value={profile?.gender}
              />

              <InfoItem
                icon={<Droplets size={18} />}
                label="Blood Group"
                value={profile?.blood_group}
              />
            </>
          )}
        </div>
      </section>

      {/* BODY METRICS */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "18px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            fontSize: "19px",
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          <HeartPulse size={20} />
          Health Information
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "18px",
          }}
        >
          {editing ? (
            <>
              <InputField
                label="Height (cm)"
                name="height_cm"
                type="number"
                value={form.height_cm}
                onChange={handleChange}
              />

              <InputField
                label="Weight (kg)"
                name="weight_kg"
                type="number"
                value={form.weight_kg}
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <InfoItem
                icon={<Ruler size={18} />}
                label="Height"
                value={
                  profile?.height_cm
                    ? `${profile.height_cm} cm`
                    : null
                }
              />

              <InfoItem
                icon={<Weight size={18} />}
                label="Weight"
                value={
                  profile?.weight_kg
                    ? `${profile.weight_kg} kg`
                    : null
                }
              />
            </>
          )}
        </div>
      </section>

      {/* EMERGENCY CONTACT */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "18px",
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            fontSize: "19px",
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          <ShieldCheck size={20} />
          Emergency Contact
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "18px",
          }}
        >
          {editing ? (
            <>
              <InputField
                label="Name"
                name="emergency_contact_name"
                value={form.emergency_contact_name}
                onChange={handleChange}
              />

              <InputField
                label="Phone"
                name="emergency_contact_phone"
                value={form.emergency_contact_phone}
                onChange={handleChange}
              />

              <InputField
                label="Relationship"
                name="emergency_contact_relation"
                value={form.emergency_contact_relation}
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <InfoItem
                icon={<UserRound size={18} />}
                label="Name"
                value={profile?.emergency_contact_name}
              />

              <InfoItem
                icon={<Phone size={18} />}
                label="Phone"
                value={profile?.emergency_contact_phone}
              />

              <InfoItem
                icon={<UserRound size={18} />}
                label="Relationship"
                value={
                  profile?.emergency_contact_relation
                }
              />
            </>
          )}
        </div>
      </section>

      {/* MEDICAL DETAILS */}
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "18px",
          padding: "24px",
        }}
      >
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            fontSize: "19px",
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          <HeartPulse size={20} />
          Medical Details
        </h2>

        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {editing ? (
            <>
              <TextAreaField
                label="Allergies"
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
              />

              <TextAreaField
                label="Chronic Conditions"
                name="chronic_conditions"
                value={form.chronic_conditions}
                onChange={handleChange}
              />

              <TextAreaField
                label="Current Medications"
                name="current_medications"
                value={form.current_medications}
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <InfoBlock
                label="Allergies"
                value={profile?.allergies}
              />

              <InfoBlock
                label="Chronic Conditions"
                value={profile?.chronic_conditions}
              />

              <InfoBlock
                label="Current Medications"
                value={profile?.current_medications}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "9px",
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: "12px",
            color: "#94a3b8",
            marginBottom: "3px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#334155",
            fontWeight: 600,
          }}
        >
          {value || "Not provided"}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          color: "#94a3b8",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          padding: "13px 15px",
          borderRadius: "10px",
          background: "#f8fafc",
          color: "#334155",
          minHeight: "20px",
        }}
      >
        {value || "Not provided"}
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "7px",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          color: "#475569",
          fontWeight: 600,
        }}
      >
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          border: "1px solid #cbd5e1",
          borderRadius: "9px",
          outline: "none",
          color: "#334155",
          background: "#ffffff",
        }}
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "7px",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          color: "#475569",
          fontWeight: 600,
        }}
      >
        {label}
      </span>

      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        rows={3}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          border: "1px solid #cbd5e1",
          borderRadius: "9px",
          outline: "none",
          resize: "vertical",
          color: "#334155",
          background: "#ffffff",
          fontFamily: "inherit",
        }}
      />
    </label>
  );
}

export default Profile;