import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

function AppointmentStats({ stats }) {
  const cards = [
    {
      label: "Total Appointments",
      value: stats.total,
      icon: <ClipboardList size={20} />,
      type: "blue",
    },
    {
      label: "Scheduled Today",
      value: stats.today,
      icon: <CalendarDays size={20} />,
      type: "teal",
    },
    {
      label: "Confirmed Visits",
      value: stats.confirmed,
      icon: <CheckCircle2 size={20} />,
      type: "green",
    },
    {
      label: "Completed Visits",
      value: stats.completed,
      icon: <CheckCircle2 size={20} />,
      type: "purple",
    },
  ];

  return (
    <section className="doctor-stat-grid">
      {cards.map((card) => (
        <div
          key={card.label}
          className="doctor-stat-card"
        >
          <div
            className={`doctor-stat-icon ${card.type}`}
          >
            {card.icon}
          </div>

          <div>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        </div>
      ))}
    </section>
  );
}

export default AppointmentStats;