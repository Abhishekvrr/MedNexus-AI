import {
  ArrowLeft,
  HeartPulse,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API_BASE_URL from "../../config/api";

function Login() {
  const navigate = useNavigate();

  // Mode: 'password' | 'otp'
  const [loginMode, setLoginMode] = useState("password");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP Login states
  const [otpStep, setOtpStep] = useState("request"); // 'request' | 'verify'
  const [otp, setOtp] = useState("");
  const [previewOtp, setPreviewOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(60);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let timer;
    if (loginMode === "otp" && otpStep === "verify" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loginMode, otpStep, resendCountdown]);

  // =========================================================
  // STANDARD PASSWORD LOGIN
  // =========================================================
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Invalid email or password.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = String(data.user?.role || "patient").trim().toLowerCase();
      if (role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setError(err.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 2FA / EMAIL OTP LOGIN: SEND CODE
  // =========================================================
  const handleSendLoginOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Server error (${response.status}). Please verify database connection.`);
      }

      setSuccessMsg("6-digit login verification code sent to your email!");
      if (data.previewOtp) {
        setPreviewOtp(data.previewOtp);
      }
      setOtpStep("verify");
      setResendCountdown(60);
    } catch (err) {
      if (err.name === "TypeError" && (err.message.includes("fetch") || err.message.includes("NetworkError"))) {
        setError("Unable to reach backend API. Make sure DATABASE_URL is set in Vercel Environment Variables.");
      } else {
        setError(err.message || "Unable to send login OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 2FA / EMAIL OTP LOGIN: VERIFY CODE
  // =========================================================
  const handleVerifyLoginOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Invalid or expired OTP code.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = String(data.user?.role || "patient").trim().toLowerCase();
      if (role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* BRAND */}
      <div className="auth-brand">
        <Link to="/login" className="brand">
          <div className="brand-icon">
            <HeartPulse size={22} />
          </div>
          <div>
            <div className="brand-name">MedNexus</div>
            <div className="brand-ai">AI</div>
          </div>
        </Link>
      </div>

      {/* LOGIN CONTAINER */}
      <div className="auth-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        {/* HEADER */}
        <div className="auth-header">
          <div className="auth-icon">
            {loginMode === "otp" ? <ShieldCheck size={23} /> : <Lock size={23} />}
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to access your MedNexus healthcare workspace.</p>
        </div>

        {/* AUTH METHOD SELECTOR TABS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => { setLoginMode("password"); setError(""); setSuccessMsg(""); }}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: `1px solid ${loginMode === "password" ? "#2563eb" : "#e2e8f0"}`,
              background: loginMode === "password" ? "#eff6ff" : "white",
              color: loginMode === "password" ? "#2563eb" : "#64748b",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Password Sign-In
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode("otp"); setOtpStep("request"); setError(""); setSuccessMsg(""); }}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: `1px solid ${loginMode === "otp" ? "#2563eb" : "#e2e8f0"}`,
              background: loginMode === "otp" ? "#eff6ff" : "white",
              color: loginMode === "otp" ? "#2563eb" : "#64748b",
              fontWeight: "700",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
          >
            <KeyRound size={14} />
            Email OTP 2FA
          </button>
        </div>

        {/* ALERTS */}
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

        {/* PREVIEW OTP FOR DEMO/DEV */}
        {loginMode === "otp" && previewOtp && (
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

        {/* OPTION 1: PASSWORD LOGIN FORM */}
        {loginMode === "password" && (
          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Email address</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setLoginMode("otp");
                    setOtpStep("request");
                  }}
                >
                  Forgot / Login with OTP?
                </a>
              </div>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {/* OPTION 2: EMAIL OTP 2FA LOGIN */}
        {loginMode === "otp" && otpStep === "request" && (
          <form className="auth-form" onSubmit={handleSendLoginOTP}>
            <div className="form-group">
              <label>Enter Registered Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="security-note">
              <ShieldCheck size={18} />
              <span>
                A secure 6-digit One-Time Password will be sent to your inbox to authenticate your session.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-button"
              disabled={loading}
            >
              {loading ? "Sending OTP Code..." : "Send 6-Digit Verification Code"}
            </button>
          </form>
        )}

        {loginMode === "otp" && otpStep === "verify" && (
          <form className="auth-form" onSubmit={handleVerifyLoginOTP}>
            <div className="form-group">
              <label style={{ textAlign: "center", display: "block", marginBottom: "8px" }}>
                Enter 6-Digit Login Code for <b style={{ color: "#0f172a" }}>{email}</b>
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
            >
              {loading ? "Authenticating..." : "Verify OTP & Log In"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", fontSize: "13px" }}>
              <button
                type="button"
                onClick={() => { setOtpStep("request"); setError(""); }}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", textDecoration: "underline" }}
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={handleSendLoginOTP}
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
                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Code"}
              </button>
            </div>
          </form>
        )}

        {/* REGISTER LINK */}
        <div className="auth-divider">
          <span>New to MedNexus?</span>
        </div>

        <Link to="/register" className="btn btn-outline auth-button">
          Create an account with Email OTP
        </Link>
      </div>
    </div>
  );
}

export default Login;