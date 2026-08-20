import {
  ArrowLeft,
  HeartPulse,
  Mail,
  Lock,
  UserRound,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API_BASE_URL from "../../config/api";

function Register() {
  const navigate = useNavigate();

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("patient");

  // Step state: 'form' | 'otp'
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [previewOtp, setPreviewOtp] = useState("");

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Resend timer
  const [resendCountdown, setResendCountdown] = useState(60);

  useEffect(() => {
    let timer;
    if (step === "otp" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // STEP 1: SEND REGISTRATION OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send verification email");
      }

      setSuccessMsg("Verification code sent to your email!");
      if (data.previewOtp) {
        setPreviewOtp(data.previewOtp);
      }
      setStep("otp");
      setResendCountdown(60);
    } catch (err) {
      setError(err.message || "Unable to send verification code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY REGISTRATION OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid or expired verification code.");
      }

      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const userRole = String(data.user?.role || role).toLowerCase();
      if (userRole === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await fetch(`${API_BASE_URL}/api/auth/send-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to resend code");
      }

      setSuccessMsg("A fresh 6-digit verification code has been sent!");
      if (data.previewOtp) {
        setPreviewOtp(data.previewOtp);
      }
      setResendCountdown(60);
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <HeartPulse size={22} />
          </div>
          <div>
            <div className="brand-name">MedNexus</div>
            <div className="brand-ai">AI</div>
          </div>
        </Link>
      </div>

      <div className="auth-container register-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        {/* STEP 1: INITIAL REGISTRATION DETAILS FORM */}
        {step === "form" && (
          <>
            <div className="auth-header">
              <div className="auth-icon">
                <UserRound size={23} />
              </div>
              <h1>Create your account</h1>
              <p>Join the secure, AI-powered healthcare network.</p>
            </div>

            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  border: "1px solid #fecaca",
                }}
              >
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSendOTP}>
              <div className="form-row">
                <div className="form-group">
                  <label>First name</label>
                  <div className="input-wrapper">
                    <UserRound size={18} />
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Last name</label>
                  <div className="input-wrapper">
                    <UserRound size={18} />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Email address (for OTP verification)</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ paddingLeft: "14px" }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    placeholder="Create a strong password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>I am registering as</label>
                <select
                  className="select-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="lab">Laboratory Staff</option>
                  <option value="pharmacist">Pharmacist</option>
                </select>
              </div>

              <div className="security-note">
                <ShieldCheck size={18} />
                <span>
                  Protected with two-factor email verification & HIPAA-grade role access controls.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-button"
                disabled={loading}
              >
                {loading ? "Sending Email OTP..." : "Continue with Email Verification"}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </>
        )}

        {/* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION SCREEN */}
        {step === "otp" && (
          <>
            <div className="auth-header">
              <div className="auth-icon" style={{ background: "#eef2ff", color: "#4f46e5" }}>
                <KeyRound size={23} />
              </div>
              <h1>Verify Your Email</h1>
              <p>
                We have sent a 6-digit verification code to <b style={{ color: "#0f172a" }}>{email}</b>.
              </p>
            </div>

            {/* DEV / DEMO PREVIEW PILL */}
            {previewOtp && (
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  color: "#1d4ed8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} /> <b>Simulated Code:</b> {previewOtp}
                </span>
                <button
                  type="button"
                  onClick={() => setOtp(previewOtp)}
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  background: "#f0fdf4",
                  color: "#166534",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  border: "1px solid #fecaca",
                }}
              >
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label style={{ textAlign: "center", display: "block", marginBottom: "8px" }}>
                  Enter 6-Digit One-Time Password
                </label>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    style={{
                      fontSize: "26px",
                      letterSpacing: "12px",
                      textAlign: "center",
                      fontWeight: "800",
                      color: "#1e293b",
                      padding: "12px",
                      width: "100%",
                      maxWidth: "280px",
                      borderRadius: "12px",
                      border: "2px solid #93c5fd",
                      background: "#f8fafc",
                    }}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-button"
                disabled={loading || otp.length !== 6}
                style={{ marginTop: "12px" }}
              >
                {loading ? "Verifying OTP..." : "Verify & Complete Registration"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", fontSize: "13px" }}>
                <button
                  type="button"
                  onClick={() => { setStep("form"); setError(""); }}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", textDecoration: "underline" }}
                >
                  Change Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCountdown > 0 || loading}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendCountdown > 0 ? "#94a3b8" : "#2563eb",
                    fontWeight: "700",
                    cursor: resendCountdown > 0 ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP Code"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;