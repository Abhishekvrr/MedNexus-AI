import {
  ArrowLeft,
  HeartPulse,
  Mail,
  Lock,
  UserRound,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/dashboard');
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

        <div className="auth-header">

          <div className="auth-icon">
            <UserRound size={23} />
          </div>

          <h1>Create your account</h1>

          <p>
            Join the connected healthcare experience.
          </p>

        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="form-row">

            <div className="form-group">
              <label>First name</label>

              <div className="input-wrapper">
                <UserRound size={18} />
                <input
                  type="text"
                  placeholder="First name"
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
                  required
                />
              </div>
            </div>

          </div>

          <div className="form-group">
            <label>Email address</label>

            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Create a strong password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>I am registering as</label>

            <select className="select-input" defaultValue="patient">
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
              Your healthcare information will be protected by
              role-based access controls.
            </span>
          </div>

          <button type="submit" className="btn btn-primary auth-button">
            Create Account
          </button>

        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </div>

      </div>

    </div>
  );
}

export default Register;