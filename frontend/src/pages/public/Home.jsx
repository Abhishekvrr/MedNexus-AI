import {
  Activity,
  ArrowRight,
  Brain,
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  HeartPulse,
  Hospital,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">

      {/* Navigation */}
      <nav className="navbar">
        <div className="container nav-inner">

          <Link to="/" className="brand">
            <div className="brand-icon">
              <HeartPulse size={23} />
            </div>

            <div>
              <div className="brand-name">MedNexus</div>
              <div className="brand-ai">AI</div>
            </div>
          </Link>

          <div className="nav-links">
            <a href="#solutions">Solutions</a>
            <a href="#features">Features</a>
            <a href="#ai">AI Intelligence</a>
            <a href="#security">Security</a>
          </div>

          <div className="nav-actions">
            <Link to="/login" className="btn btn-outline">
              Sign In
            </Link>

            <Link to="/register" className="btn btn-primary">
              Get Started
              <ArrowRight size={17} />
            </Link>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <main>

        <section className="hero">
          <div className="container hero-grid">

            <div className="hero-content">

              <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Intelligent Healthcare Platform
              </div>

              <h1>
                Connected Care.
                <span> Intelligent Decisions.</span>
              </h1>

              <p className="hero-description">
                MedNexus AI connects patients, doctors, hospitals,
                laboratories and pharmacies through one secure healthcare
                intelligence platform.
              </p>

              <div className="hero-actions">

                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started
                  <ArrowRight size={19} />
                </Link>

                <a href="#solutions" className="btn btn-secondary btn-large">
                  Explore Platform
                  <ChevronRight size={19} />
                </a>

              </div>

              <div className="hero-trust">

                <div className="trust-item">
                  <ShieldCheck size={19} />
                  Secure by Design
                </div>

                <div className="trust-item">
                  <Brain size={19} />
                  AI Assisted
                </div>

                <div className="trust-item">
                  <Hospital size={19} />
                  Multi-Hospital
                </div>

              </div>

            </div>

            {/* Healthcare Visual */}
            <div className="hero-visual">

              <div className="visual-glow"></div>

              <div className="health-card main-card">

                <div className="card-top">
                  <div>
                    <span className="small-label">Today's Health</span>
                    <h3>Patient Overview</h3>
                  </div>

                  <div className="status-badge">
                    <span></span>
                    Active
                  </div>
                </div>

                <div className="health-score">
                  <div className="score-ring">
                    <div>
                      <strong>92</strong>
                      <span>/100</span>
                    </div>
                  </div>

                  <div>
                    <h4>Health Score</h4>
                    <p>Based on recent health activity</p>
                  </div>
                </div>

                <div className="health-stats">

                  <div className="mini-stat">
                    <div className="mini-icon blue">
                      <Activity size={17} />
                    </div>
                    <div>
                      <strong>72 bpm</strong>
                      <span>Heart Rate</span>
                    </div>
                  </div>

                  <div className="mini-stat">
                    <div className="mini-icon green">
                      <HeartPulse size={17} />
                    </div>
                    <div>
                      <strong>120/80</strong>
                      <span>Blood Pressure</span>
                    </div>
                  </div>

                </div>

              </div>

              <div className="floating-card appointment-card">

                <div className="floating-icon">
                  <CalendarCheck size={20} />
                </div>

                <div>
                  <span>Upcoming Appointment</span>
                  <strong>Dr. Sarah Mitchell</strong>
                  <small>Today • 10:30 AM</small>
                </div>

              </div>

              <div className="floating-card ai-card">

                <div className="ai-icon">
                  <Brain size={20} />
                </div>

                <div>
                  <span>MedNexus AI</span>
                  <strong>Health insights ready</strong>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* Solutions */}
        <section id="solutions" className="section">

          <div className="container">

            <div className="section-heading">

              <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                One Connected Ecosystem
              </div>

              <h2>
                Healthcare, connected around
                <span> the patient.</span>
              </h2>

              <p>
                From finding a doctor to follow-up care, MedNexus brings
                every important healthcare interaction into one platform.
              </p>

            </div>

            <div className="solution-grid">

              <SolutionCard
                icon={<Users size={23} />}
                title="For Patients"
                text="Discover doctors, book appointments, access medical records and understand your health information."
              />

              <SolutionCard
                icon={<Stethoscope size={23} />}
                title="For Doctors"
                text="Manage appointments, review patient history, create prescriptions and use AI-assisted clinical summaries."
              />

              <SolutionCard
                icon={<Hospital size={23} />}
                title="For Hospitals"
                text="Manage departments, doctors, patients, queues, laboratories, pharmacy and operational analytics."
              />

            </div>

          </div>

        </section>

        {/* Features */}
        <section id="features" className="section section-soft">

          <div className="container">

            <div className="section-heading centered">

              <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Platform Capabilities
              </div>

              <h2>
                Everything healthcare teams
                <span> need in one place.</span>
              </h2>

            </div>

            <div className="feature-grid">

              <FeatureCard
                icon={<CalendarCheck />}
                title="Smart Appointments"
                text="Discover available doctors and book appointments across connected hospitals."
              />

              <FeatureCard
                icon={<ClipboardCheck />}
                title="Digital Medical Records"
                text="Securely organize consultations, prescriptions, reports and health history."
              />

              <FeatureCard
                icon={<Activity />}
                title="Smart Queue"
                text="Track tokens and estimate waiting times using real operational data."
              />

              <FeatureCard
                icon={<Brain />}
                title="AI Health Intelligence"
                text="Understand reports, summarize records and assist healthcare workflows."
              />

              <FeatureCard
                icon={<HeartPulse />}
                title="Laboratory & Pharmacy"
                text="Connect diagnostic reports and prescription fulfillment into one workflow."
              />

              <FeatureCard
                icon={<ShieldCheck />}
                title="Secure Healthcare"
                text="Role-based access and audit controls protect sensitive patient information."
              />

            </div>

          </div>

        </section>

        {/* AI */}
        <section id="ai" className="ai-section">

          <div className="container ai-grid">

            <div className="ai-content">

              <div className="eyebrow light">
                <span className="eyebrow-dot"></span>
                AI-Powered Healthcare
              </div>

              <h2>
                Intelligence that supports
                <span> better healthcare decisions.</span>
              </h2>

              <p>
                MedNexus AI assists patients, doctors and hospital teams
                while keeping healthcare professionals in control of
                clinical decisions.
              </p>

              <div className="ai-list">

                <div>
                  <Brain size={19} />
                  <span>AI medical report explanation</span>
                </div>

                <div>
                  <Stethoscope size={19} />
                  <span>AI doctor and specialty discovery</span>
                </div>

                <div>
                  <ClipboardCheck size={19} />
                  <span>AI patient health summaries</span>
                </div>

                <div>
                  <Activity size={19} />
                  <span>AI-powered hospital analytics</span>
                </div>

              </div>

              <Link to="/register" className="btn btn-white btn-large">
                Explore MedNexus AI
                <ArrowRight size={19} />
              </Link>

            </div>

            <div className="ai-visual">

              <div className="ai-panel">

                <div className="ai-panel-header">
                  <div className="ai-panel-title">
                    <div className="ai-panel-icon">
                      <Brain size={20} />
                    </div>
                    <div>
                      <strong>MedNexus AI</strong>
                      <span>Healthcare Assistant</span>
                    </div>
                  </div>

                  <span className="online-dot"></span>
                </div>

                <div className="ai-message">
                  <span>Patient Question</span>
                  <p>
                    "Can you explain my recent blood report?"
                  </p>
                </div>

                <div className="ai-response">

                  <div className="response-header">
                    <Brain size={17} />
                    <span>AI Explanation</span>
                  </div>

                  <p>
                    Your report contains several health measurements.
                    MedNexus can explain the terminology and values in
                    simple language for better understanding.
                  </p>

                  <div className="ai-disclaimer">
                    AI information is educational and does not replace
                    professional medical advice.
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* Security */}
        <section id="security" className="section">

          <div className="container security-box">

            <div className="security-icon">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h3>Designed with healthcare privacy in mind.</h3>
              <p>
                MedNexus uses role-based access, secure APIs and audit
                controls to protect sensitive healthcare information.
              </p>
            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="footer">

        <div className="container footer-inner">

          <div className="brand footer-brand">

            <div className="brand-icon">
              <HeartPulse size={21} />
            </div>

            <div>
              <div className="brand-name">MedNexus</div>
              <div className="brand-ai">AI</div>
            </div>

          </div>

          <p>
            © 2026 MedNexus AI. Built for connected healthcare.
          </p>

        </div>

      </footer>

    </div>
  );
}

function SolutionCard({ icon, title, text }) {
  return (
    <div className="solution-card">

      <div className="solution-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <a href="#features" className="card-link">
        Explore
        <ArrowRight size={16} />
      </a>

    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

    </div>
  );
}

export default Home;