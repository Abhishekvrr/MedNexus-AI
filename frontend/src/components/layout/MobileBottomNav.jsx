import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  CalendarCheck,
  HeartPulse,
  Bot,
  ShieldAlert,
  Mic,
  Pill,
  User,
} from "lucide-react";

export default function MobileBottomNav({ isDoctor }) {
  const location = useLocation();

  const patientTabs = [
    { path: "/dashboard", label: "Home", icon: Activity },
    { path: "/prescription-decoder", label: "AI Rx", icon: Pill },
    { path: "/emergency-pass", label: "SOS", icon: ShieldAlert, highlight: true },
    { path: "/ai", label: "AI Copilot", icon: Bot },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const doctorTabs = [
    { path: "/doctor-dashboard", label: "Home", icon: Activity },
    { path: "/doctor-voice-scribe", label: "Scribe", icon: Mic, highlight: true },
    { path: "/doctor-appointments", label: "Schedule", icon: CalendarCheck },
    { path: "/doctor-ai", label: "AI Copilot", icon: Bot },
    { path: "/doctor-profile", label: "Profile", icon: User },
  ];

  const tabs = isDoctor ? doctorTabs : patientTabs;

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;

        if (tab.highlight) {
          return (
            <Link
              key={idx}
              to={tab.path}
              className="mobile-fab-link"
              title={tab.label}
            >
              <div className="mobile-fab-button">
                <Icon size={22} color="white" />
              </div>
              <span className="mobile-fab-label">{tab.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={idx}
            to={tab.path}
            className={`mobile-nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={20} />
            <span className="mobile-nav-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
