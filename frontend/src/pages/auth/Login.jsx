import {
  ArrowLeft,
  HeartPulse,
  Lock,
  Mail,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import API_BASE_URL from "../../config/api";


function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setLoading(true);
    setError("");


    try {

      /*
        IMPORTANT:
        Remove any old/expired authentication
        before creating a new session.
      */

      localStorage.removeItem("token");
      localStorage.removeItem("user");


      // =====================================================
      // LOGIN API
      // =====================================================

      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );


      const data = await response.json();


      console.log(
        "LOGIN API RESPONSE:",
        data
      );


      // =====================================================
      // API ERROR
      // =====================================================

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          "Invalid email or password."
        );

      }


      // =====================================================
      // CHECK TOKEN
      // =====================================================

      if (!data.token) {

        throw new Error(
          "Login successful, but authentication token was not received."
        );

      }


      // =====================================================
      // CHECK USER
      // =====================================================

      if (!data.user) {

        throw new Error(
          "Login successful, but user information was not received."
        );

      }


      // =====================================================
      // SAVE SESSION
      // =====================================================

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );


      // =====================================================
      // VERIFY STORAGE
      // =====================================================

      console.log(
        "TOKEN SAVED:",
        localStorage.getItem("token")
      );

      console.log(
        "USER SAVED:",
        localStorage.getItem("user")
      );


      // =====================================================
      // ROLE
      // =====================================================

      const role = String(
        data.user?.role || "patient"
      )
        .trim()
        .toLowerCase();


      // =====================================================
      // REDIRECT
      // =====================================================

      if (role === "doctor") {

        navigate(
          "/doctor-dashboard",
          {
            replace: true,
          }
        );

      } else {

        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );

      }

    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );


      /*
        Make absolutely sure a failed login
        does not leave an invalid token behind.
      */

      localStorage.removeItem("token");
      localStorage.removeItem("user");


      setError(
        err.message ||
        "Unable to login. Please try again."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="auth-page">

      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="auth-brand">

        <Link
          to="/login"
          className="brand"
        >

          <div className="brand-icon">
            <HeartPulse size={22} />
          </div>

          <div>

            <div className="brand-name">
              MedNexus
            </div>

            <div className="brand-ai">
              AI
            </div>

          </div>

        </Link>

      </div>


      {/* =====================================================
          LOGIN CONTAINER
      ===================================================== */}

      <div className="auth-container">

        <Link
          to="/login"
          className="back-link"
        >

          <ArrowLeft size={16} />

          Back to login

        </Link>


        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="auth-header">

          <div className="auth-icon">
            <Lock size={23} />
          </div>

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to access your MedNexus
            healthcare workspace.
          </p>

        </div>


        {/* ===================================================
            ERROR
        =================================================== */}

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


        {/* ===================================================
            FORM
        =================================================== */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="form-group">

            <label>
              Email address
            </label>

            <div className="input-wrapper">

              <Mail size={18} />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
                autoComplete="email"
              />

            </div>

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="form-group">

            <div className="label-row">

              <label>
                Password
              </label>

              <a
                href="#forgot"
                onClick={(event) =>
                  event.preventDefault()
                }
              >
                Forgot password?
              </a>

            </div>

            <div className="input-wrapper">

              <Lock size={18} />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                autoComplete="current-password"
              />

            </div>

          </div>


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="btn btn-primary auth-button"
            disabled={loading}
          >

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>

        </form>


        {/* ===================================================
            REGISTER
        =================================================== */}

        <div className="auth-divider">

          <span>
            New to MedNexus?
          </span>

        </div>


        <Link
          to="/register"
          className="btn btn-outline auth-button"
        >
          Create an account
        </Link>

      </div>

    </div>

  );
}

export default Login;