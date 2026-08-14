import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  Bell,
  CalendarCheck,
  HeartPulse,
  LogOut,
  Stethoscope,
  Users,
  Bot,
  UserRound,
  FlaskConical,
  Pill,
} from "lucide-react";

function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================================
  // USER
  // ============================================================

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Unable to parse user:",
      error
    );
  }

  const userName =
    user?.full_name ||
    user?.name ||
    user?.username ||
    "User";

  const role = String(
    user?.role ||
      user?.user_role ||
      user?.type ||
      ""
  )
    .trim()
    .toLowerCase();

  // ============================================================
  // PORTAL DETECTION
  // ============================================================

  /*
   * URL is the strongest signal for the current portal.
   *
   * This prevents the doctor sidebar from changing into
   * the patient sidebar if localStorage.user is temporarily
   * missing or incomplete.
   */

  const isDoctorPath =
    location.pathname.startsWith("/doctor-");

  const isDoctor =
    isDoctorPath ||
    role === "doctor";

  const isAdmin =
    role === "admin" ||
    role === "administrator";

  const displayRole =
    isDoctor
      ? "Doctor"
      : isAdmin
      ? "Administrator"
      : "Patient";

  // ============================================================
  // INITIALS
  // ============================================================

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (name) => name[0]
      )
      .join("")
      .toUpperCase() || "U";

  // ============================================================
  // PATIENT NAVIGATION
  // ============================================================

  const patientNavigation = [
    {
      path: "/dashboard",
      label: "Overview",
      icon: Activity,
    },
    {
      path: "/appointments",
      label: "Appointments",
      icon: CalendarCheck,
    },
    {
      path: "/doctors",
      label: "Doctors",
      icon: Stethoscope,
    },
    {
      path: "/medical-records",
      label: "Medical Records",
      icon: HeartPulse,
    },
    {
      path: "/prescriptions",
      label: "Prescriptions",
      icon: Pill,
    },
    {
      path: "/lab-reports",
      label: "Lab Reports",
      icon: FlaskConical,
    },
    {
      path: "/health-metrics",
      label: "Health Metrics",
      icon: Activity,
    },
    {
      path: "/family",
      label: "Family",
      icon: Users,
    },
    {
      path: "/ai",
      label: "AI Assistant",
      icon: Bot,
    },
    {
      path: "/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: UserRound,
    },
  ];

  // ============================================================
  // DOCTOR NAVIGATION
  // ============================================================

  const doctorNavigation = [
    {
      path: "/doctor-dashboard",
      label: "Dashboard",
      icon: Activity,
    },
    {
      path: "/doctor-appointments",
      label: "Manage Appointments",
      icon: CalendarCheck,
    },
    {
      path: "/doctor-patients",
      label: "Patients",
      icon: Users,
    },
    {
      path: "/doctor-medical-records",
      label: "Patient Records",
      icon: HeartPulse,
    },
    {
      path: "/doctor-prescriptions",
      label: "Prescriptions",
      icon: Pill,
    },
    {
      path: "/doctor-ai",
      label: "AI Assistant",
      icon: Bot,
    },
    {
      path: "/doctor-profile",
      label: "Profile",
      icon: UserRound,
    },
  ];

  const navigation =
    isDoctor
      ? doctorNavigation
      : patientNavigation;

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="dashboard-layout">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="dashboard-sidebar">

        {/* BRAND */}

        <div className="sidebar-brand">

          <div className="sidebar-brand-icon">
            <HeartPulse size={22} />
          </div>

          <div>
            <div className="sidebar-brand-name">
              MedNexus
            </div>

            <div className="sidebar-brand-ai">
              AI HEALTHCARE
            </div>
          </div>

        </div>

        {/* USER */}

        <div className="sidebar-user">

          <div className="sidebar-avatar">
            {initials}
          </div>

          <div className="sidebar-user-info">

            <strong>
              {userName}
            </strong>

            <span>
              {displayRole}
            </span>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-navigation">

          <div
            className={
              isDoctor
                ? "sidebar-section-title doctor-section-title"
                : "sidebar-section-title"
            }
          >
            {isDoctor
              ? "DOCTOR PORTAL"
              : "WORKSPACE"}
          </div>

          {navigation.map(
            (item) => {

              const Icon =
                item.icon;

              const active =
                location.pathname ===
                item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    active
                      ? isDoctor
                        ? "sidebar-link doctor-link active"
                        : "sidebar-link active"
                      : isDoctor
                      ? "sidebar-link doctor-link"
                      : "sidebar-link"
                  }
                >
                  <Icon size={18} />

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            }
          )}

        </nav>

        {/* LOGOUT */}

        <div className="sidebar-footer">

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="dashboard-main">
        <Outlet />
      </main>

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style>
        {`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          background: #f8fafc;
        }

        .dashboard-layout {
          min-height: 100vh;
          display: flex;
          background: #f8fafc;
        }

        /* ====================================================
           SIDEBAR
        ==================================================== */

        .dashboard-sidebar {
          position: fixed;
          inset: 0 auto 0 0;

          width: 250px;
          height: 100vh;

          display: flex;
          flex-direction: column;

          padding: 20px 14px;

          background: #ffffff;

          border-right:
            1px solid #e2e8f0;

          z-index: 1000;
        }

        /* ====================================================
           BRAND
        ==================================================== */

        .sidebar-brand {
          display: flex;
          align-items: center;

          gap: 10px;

          padding:
            4px 10px 22px;
        }

        .sidebar-brand-icon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0ea5e9
            );

          color: #ffffff;
        }

        .sidebar-brand-name {
          color: #0f172a;

          font-size: 19px;

          font-weight: 800;
        }

        .sidebar-brand-ai {
          margin-top: 3px;

          color: #2563eb;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1.5px;
        }

        /* ====================================================
           USER
        ==================================================== */

        .sidebar-user {
          display: flex;
          align-items: center;

          gap: 10px;

          padding: 12px;

          margin-bottom: 12px;

          border-radius: 12px;

          background: #f8fafc;

          border:
            1px solid #e2e8f0;
        }

        .sidebar-avatar {
          width: 40px;
          height: 40px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #dbeafe;

          color: #2563eb;

          font-size: 13px;

          font-weight: 800;
        }

        .sidebar-user-info {
          min-width: 0;

          display: flex;
          flex-direction: column;
        }

        .sidebar-user-info strong {
          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;

          color: #0f172a;

          font-size: 12px;
        }

        .sidebar-user-info span {
          margin-top: 3px;

          color: #64748b;

          font-size: 10px;

          font-weight: 600;
        }

        /* ====================================================
           NAVIGATION
        ==================================================== */

        .sidebar-navigation {
          flex: 1;

          overflow-y: auto;

          padding-right: 3px;
        }

        .sidebar-section-title {
          padding: 12px;

          color: #94a3b8;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1.2px;
        }

        .doctor-section-title {
          color: #2563eb;
        }

        .sidebar-link {
          width: 100%;

          display: flex;
          align-items: center;

          gap: 11px;

          margin-bottom: 4px;

          padding: 10px 12px;

          border-radius: 9px;

          color: #64748b;

          text-decoration: none;

          font-size: 12px;

          font-weight: 500;

          transition:
            background .2s ease,
            color .2s ease,
            transform .2s ease;
        }

        .sidebar-link:hover {
          background: #eff6ff;

          color: #2563eb;

          transform:
            translateX(2px);
        }

        .sidebar-link.active {
          background: #eff6ff;

          color: #2563eb;

          font-weight: 700;
        }

        .doctor-link.active {
          background: #2563eb;

          color: #ffffff;

          box-shadow:
            0 5px 14px
            rgba(
              37,
              99,
              235,
              0.18
            );
        }

        .doctor-link.active svg {
          color: #ffffff;
        }

        /* ====================================================
           FOOTER
        ==================================================== */

        .sidebar-footer {
          padding-top: 12px;

          border-top:
            1px solid #e2e8f0;
        }

        .sidebar-logout {
          width: 100%;

          display: flex;
          align-items: center;

          gap: 11px;

          padding: 10px 12px;

          border: none;

          border-radius: 9px;

          background: transparent;

          color: #64748b;

          font-family: inherit;

          font-size: 12px;

          cursor: pointer;

          text-align: left;
        }

        .sidebar-logout:hover {
          background: #fef2f2;

          color: #dc2626;
        }

        /* ====================================================
           MAIN
        ==================================================== */

        .dashboard-main {
          width:
            calc(100% - 250px);

          min-height: 100vh;

          margin-left: 250px;

          padding: 0;

          background: #f8fafc;
        }

        /* ====================================================
           RESPONSIVE
        ==================================================== */

        @media (max-width: 800px) {

          .dashboard-sidebar {
            width: 220px;
          }

          .dashboard-main {
            width:
              calc(100% - 220px);

            margin-left: 220px;
          }

        }

        @media (max-width: 650px) {

          .dashboard-layout {
            flex-direction: column;
          }

          .dashboard-sidebar {
            position: relative;

            width: 100%;

            height: auto;

            min-height: auto;
          }

          .dashboard-main {
            width: 100%;

            margin-left: 0;
          }

          .sidebar-navigation {
            max-height: 450px;
          }

        }

        `}
      </style>

    </div>
  );
}

export default DashboardLayout;