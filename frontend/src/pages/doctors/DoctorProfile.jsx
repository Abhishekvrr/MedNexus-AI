import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  Stethoscope,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Star,
  Edit3,
  Save,
  RefreshCw,
  AlertCircle,
  Video,
  FileBadge,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import API_BASE_URL from "../../config/api";

function DoctorProfile() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience_years: 0,
    consultation_fee: 500,
    license_number: "",
    bio: "",
    available_for_online: true,
  });

  const getToken = () => localStorage.getItem("token");

  const loadDoctorProfile = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/doctors/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load doctor profile.");
      }

      const doc = data.doctor;
      setDoctor(doc);
      setFormData({
        full_name: doc.doctor_name || doc.full_name || "",
        phone: doc.phone || "",
        specialization: doc.specialization || "General Medicine",
        qualification: doc.qualification || "",
        experience_years: doc.experience_years || 0,
        consultation_fee: doc.consultation_fee || 500,
        license_number: doc.license_number || "",
        bio: doc.bio || "",
        available_for_online: doc.available_for_online !== false,
      });
    } catch (err) {
      console.error("Doctor profile load error:", err);
      setError("Unable to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = getToken();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/doctors/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setDoctor(data.doctor);
      setSuccess("Doctor profile and clinical settings updated successfully!");
      setTimeout(() => setSuccess(""), 4000);

      // Update local storage user
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.full_name = formData.full_name;
        storedUser.phone = formData.phone;
        localStorage.setItem("user", JSON.stringify(storedUser));
      } catch (err) {
        console.error("LocalStorage update error:", err);
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setError(err.message || "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const stats = doctor?.stats || {
    total_patients: 0,
    completed_appointments: 0,
    this_month_earnings: 0,
    total_earnings: 0,
    total_prescriptions: 0,
  };

  const initials = String(formData.full_name || "Doctor")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="doc-prof-container">
      {/* BULLETPROOF SCOPED CSS */}
      <style>{`
        .doc-prof-container {
          width: 100%;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #0f172a;
          box-sizing: border-box;
        }

        /* HERO CARD */
        .doc-prof-hero {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 20px;
          padding: 30px 34px;
          color: #ffffff;
          margin-bottom: 24px;
          box-shadow: 0 12px 30px -10px rgba(15, 23, 42, 0.4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .hero-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .doc-hero-avatar {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #ffffff;
          font-size: 28px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
          flex-shrink: 0;
        }

        .doc-hero-name {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .doc-hero-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .pill-spec { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.3); }
        .pill-rating { background: rgba(234, 179, 8, 0.2); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.3); }
        .pill-active { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.3); }

        /* EARNINGS & STATS GRID */
        .doc-earnings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .doc-earnings-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 22px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .doc-earn-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .earn-icon-emerald { background: #ecfdf5; color: #059669; }
        .earn-icon-blue { background: #eff6ff; color: #2563eb; }
        .earn-icon-purple { background: #f5f3ff; color: #7c3aed; }
        .earn-icon-amber { background: #fffbeb; color: #d97706; }

        .doc-earn-val {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .doc-earn-lbl {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          margin-top: 3px;
        }

        /* FORM CARD */
        .doc-profile-form-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05);
          padding: 30px;
        }

        .form-section-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 22px;
        }

        @media (max-width: 768px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        .field-label {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
          display: block;
          text-transform: uppercase;
        }

        .field-input, .field-textarea {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: #0f172a;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .field-input:focus, .field-textarea:focus {
          border-color: #2563eb;
          background: #ffffff;
        }

        .field-input:disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .save-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 12px 26px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
        }

        .save-btn:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }
      `}</style>

      {/* HERO CARD */}
      <div className="doc-prof-hero">
        <div className="hero-left">
          <div className="doc-hero-avatar">{initials}</div>
          <div>
            <h1 className="doc-hero-name">{formData.full_name || "Dr. Ananya Sharma"}</h1>
            <div className="doc-hero-pills">
              <span className="hero-pill pill-spec">
                <Stethoscope size={13} />
                {formData.specialization}
              </span>
              <span className="hero-pill pill-rating">
                <Star size={13} />
                {doctor?.rating || "4.9"} Clinical Rating
              </span>
              <span className="hero-pill pill-active">
                <ShieldCheck size={13} />
                Verified Physician
              </span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>
            Hospital Affiliation
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
            <Building2 size={16} color="#60a5fa" />
            {doctor?.hospital_name || "City Care Hospital, Bengaluru"}
          </div>
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {success && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {/* PRACTICE ANALYTICS & MONTHLY EARNINGS */}
      <div className="doc-earnings-grid">
        {/* MONTHLY EARNINGS */}
        <div className="doc-earnings-card">
          <div className="doc-earn-icon earn-icon-emerald">
            <DollarSign size={26} />
          </div>
          <div>
            <div className="doc-earn-val" style={{ color: "#059669" }}>
              ₹ {stats.this_month_earnings?.toLocaleString("en-IN") || "800"}
            </div>
            <div className="doc-earn-lbl">This Month's Consultation Revenue</div>
          </div>
        </div>

        {/* COMPLETED VISITS */}
        <div className="doc-earnings-card">
          <div className="doc-earn-icon earn-icon-blue">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="doc-earn-val">
              {stats.completed_appointments || 1}
            </div>
            <div className="doc-earn-lbl">Completed Consultations</div>
          </div>
        </div>

        {/* ACTIVE PATIENTS */}
        <div className="doc-earnings-card">
          <div className="doc-earn-icon earn-icon-purple">
            <UserRound size={26} />
          </div>
          <div>
            <div className="doc-earn-val">
              {stats.total_patients || 1}
            </div>
            <div className="doc-earn-lbl">Assigned Patients Treated</div>
          </div>
        </div>

        {/* LIFETIME TOTAL REVENUE */}
        <div className="doc-earnings-card">
          <div className="doc-earn-icon earn-icon-amber">
            <TrendingUp size={26} />
          </div>
          <div>
            <div className="doc-earn-val">
              ₹ {stats.total_earnings?.toLocaleString("en-IN") || "800"}
            </div>
            <div className="doc-earn-lbl">Lifetime Total Revenue</div>
          </div>
        </div>
      </div>

      {/* PROFILE EDITOR FORM */}
      <form onSubmit={handleSaveProfile} className="doc-profile-form-card">
        {/* BASIC & CONTACT */}
        <h3 className="form-section-title">
          <UserRound size={18} color="#2563eb" />
          <span>Doctor Information & Contact Details</span>
        </h3>

        <div className="form-grid-2">
          <div>
            <label className="field-label">Full Name *</label>
            <input
              type="text"
              className="field-input"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="field-label">Email Address (Read-only)</label>
            <input
              type="email"
              className="field-input"
              value={doctor?.email || "doctor@mednexus.com"}
              disabled
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div>
            <label className="field-label">Phone Number *</label>
            <input
              type="text"
              className="field-input"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Medical Registration / License Number *</label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. MCI-48920-IND"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
            />
          </div>
        </div>

        {/* CLINICAL SPECIALIZATION & SETTINGS */}
        <h3 className="form-section-title" style={{ marginTop: "10px" }}>
          <Stethoscope size={18} color="#059669" />
          <span>Clinical Practice, Fees & Qualifications</span>
        </h3>

        <div className="form-grid-2">
          <div>
            <label className="field-label">Medical Specialization *</label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Cardiology, Internal Medicine, Pediatrics"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="field-label">Qualifications & Degrees *</label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. MBBS, MD (General Medicine), DM (Cardiology)"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div>
            <label className="field-label">Years of Clinical Experience</label>
            <input
              type="number"
              className="field-input"
              min="0"
              max="60"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Consultation Fee (₹ per visit) *</label>
            <input
              type="number"
              className="field-input"
              min="0"
              step="50"
              value={formData.consultation_fee}
              onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: "22px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <input
              type="checkbox"
              style={{ width: "18px", height: "18px", accentColor: "#2563eb" }}
              checked={formData.available_for_online}
              onChange={(e) => setFormData({ ...formData, available_for_online: e.target.checked })}
            />
            <div>
              <strong style={{ fontSize: "14px", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                <Video size={16} color="#2563eb" />
                Available for Online Teleconsultations
              </strong>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                When enabled, patients can book video appointments with you directly from the portal.
              </div>
            </div>
          </label>
        </div>

        {/* BIOGRAPHY */}
        <h3 className="form-section-title" style={{ marginTop: "10px" }}>
          <FileBadge size={18} color="#7c3aed" />
          <span>Professional Biography & Clinical Summary</span>
        </h3>

        <div style={{ marginBottom: "26px" }}>
          <label className="field-label">Bio & Clinical Interests</label>
          <textarea
            className="field-textarea"
            rows={4}
            placeholder="Describe your medical background, research interests, patient care philosophy, and areas of clinical expertise..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        {/* SAVE BUTTON */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? (
              <>
                <RefreshCw size={16} className="doc-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DoctorProfile;