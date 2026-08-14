import {
  Search,
} from "lucide-react";

function AppointmentFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
}) {
  return (
    <div className="doctor-filter-bar">

      <div className="doctor-search">
        <Search size={17} />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search patient name or email..."
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value)
        }
      >
        <option value="All">All Status</option>
        <option value="Scheduled">Scheduled</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <select
        value={dateFilter}
        onChange={(e) =>
          setDateFilter(e.target.value)
        }
      >
        <option value="All">All Dates</option>
        <option value="Today">Today</option>
        <option value="Upcoming">Upcoming</option>
        <option value="Past">Past</option>
      </select>

    </div>
  );
}

export default AppointmentFilters;