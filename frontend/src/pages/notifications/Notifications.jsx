import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  CalendarCheck,
  Pill,
  RefreshCw,
  Check,
  Trash2,
  Clock3,
  FlaskConical,
  XCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  const loadNotifications = async (showRefresh = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to view notifications.");
      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load notifications."
        );
      }

      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Notifications error:", err);

      setError(
        err.message || "Unable to load notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // MARK SINGLE NOTIFICATION AS READ
  // ==========================================

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error("Mark notification error:", err);

      setError(
        err.message || "Unable to update notification."
      );
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setMarkingAll(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to mark all notifications as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setSuccess("All notifications marked as read.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Mark all notifications error:", err);

      setError(
        err.message || "Unable to update notifications."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  const deleteNotification = async (notificationId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete notification."
        );
      }

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification.id !== notificationId
        )
      );
    } catch (err) {
      console.error("Delete notification error:", err);

      setError(
        err.message || "Unable to delete notification."
      );
    }
  };

  // ==========================================
  // COUNTS
  // ==========================================

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) =>
        notification.is_read === false
    ).length;
  }, [notifications]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="notifications-page">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="notifications-header">

        <div className="notifications-header-content">

          <span className="notifications-eyebrow">
            STAY INFORMED
          </span>

          <div className="notifications-title-row">

            <h1>Notifications</h1>

            {unreadCount > 0 && (
              <span className="unread-count">
                {unreadCount} unread
              </span>
            )}

          </div>

          <p>
            Important updates and healthcare reminders
            from MedNexus.
          </p>

        </div>

        <div className="notifications-header-actions">

          {unreadCount > 0 && (
            <button
              type="button"
              className="notification-action mark-all"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              {markingAll ? (
                <RefreshCw
                  size={16}
                  className="notification-spin"
                />
              ) : (
                <Check size={17} />
              )}

              {markingAll
                ? "Marking..."
                : "Mark All Read"}
            </button>
          )}

          <button
            type="button"
            className="notification-action refresh"
            onClick={() => loadNotifications(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "notification-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

      </div>

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {success && (
        <div className="notification-alert success">

          <CheckCircle2 size={18} />

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <XCircle size={16} />
          </button>

        </div>
      )}

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (
        <div className="notification-alert error">

          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <XCircle size={16} />
          </button>

        </div>
      )}

      {/* ======================================
          LOADING
      ====================================== */}

      {loading ? (
        <div className="notifications-loading">

          <RefreshCw
            size={30}
            className="notification-spin"
          />

          <h3>Loading notifications...</h3>

          <p>
            Please wait while we fetch your
            latest updates.
          </p>

        </div>
      ) : notifications.length === 0 ? (

        /* ======================================
           EMPTY STATE
        ====================================== */

        <div className="notifications-empty">

          <div className="notifications-empty-icon">
            <Bell size={30} />
          </div>

          <h2>
            You're all caught up
          </h2>

          <p>
            No new notifications at the moment.
          </p>

        </div>

      ) : (

        /* ======================================
           NOTIFICATION LIST
        ====================================== */

        <div className="notifications-list">

          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}

        </div>
      )}

      {/* ======================================
          END OF NOTIFICATIONS
      ====================================== */}

      {!loading &&
        notifications.length > 0 && (
          <div className="notifications-end">

            <span />

            <p>
              You've reached the end of notifications
            </p>

            <span />

          </div>
        )}

      {/* ======================================
          PAGE STYLES
      ====================================== */}

      <style>
        {`

          /* ===================================
             MAIN PAGE
          =================================== */

          .notifications-page {
            width: 100%;
            max-width: 1280px;
            margin: 0 auto;
            padding: 32px 36px 45px;
            box-sizing: border-box;
          }

          /* ===================================
             HEADER
          =================================== */

          .notifications-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 25px;
            margin-bottom: 26px;
          }

          .notifications-header-content {
            min-width: 0;
          }

          .notifications-eyebrow {
            display: block;
            margin-bottom: 8px;
            color: #0f8b8d;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
          }

          .notifications-title-row {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .notifications-title-row h1 {
            margin: 0;
            color: #0f2742;
            font-size: 34px;
            line-height: 1.15;
            font-weight: 750;
            letter-spacing: -0.02em;
          }

          .notifications-header-content p {
            margin: 8px 0 0;
            color: #64748b;
            font-size: 13px;
            line-height: 1.5;
          }

          .unread-count {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 5px 10px;
            border: 1px solid #93c5fd;
            border-radius: 999px;
            background: #eff6ff;
            color: #2563eb;
            font-size: 11px;
            font-weight: 700;
          }

          /* ===================================
             HEADER BUTTONS
          =================================== */

          .notifications-header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
          }

          .notification-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 42px;
            padding: 0 17px;
            border-radius: 9px;
            background: white;
            font-family: inherit;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .notification-action:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .notification-action.mark-all {
            border: 1px solid #5db8b8;
            color: #087f80;
          }

          .notification-action.mark-all:hover:not(:disabled) {
            background: #f0fdfa;
          }

          .notification-action.refresh {
            border: 1px solid #93b8ff;
            color: #2563eb;
          }

          .notification-action.refresh:hover:not(:disabled) {
            background: #eff6ff;
          }

          /* ===================================
             ALERTS
          =================================== */

          .notification-alert {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
            padding: 12px 14px;
            border-radius: 9px;
            font-size: 12px;
          }

          .notification-alert button {
            margin-left: auto;
            border: 0;
            background: transparent;
            cursor: pointer;
          }

          .notification-alert.success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #15803d;
          }

          .notification-alert.error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #b91c1c;
          }

          /* ===================================
             NOTIFICATION LIST
          =================================== */

          .notifications-list {
            display: grid;
            gap: 10px;
          }

          /* ===================================
             NOTIFICATION CARD
          =================================== */

          .notification-card {
            position: relative;
            display: grid;
            grid-template-columns: 8px 62px minmax(0, 1fr) 145px auto;
            align-items: center;
            gap: 17px;
            min-height: 108px;
            padding: 17px 20px 17px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 13px;
            background: #ffffff;
            box-sizing: border-box;
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease,
              border-color 0.2s ease;
          }

          .notification-card:hover {
            transform: translateY(-1px);
            border-color: #cbd5e1;
            box-shadow:
              0 8px 25px
              rgba(15, 23, 42, 0.06);
          }

          .notification-card.unread {
            border-left: 3px solid #2563eb;
          }

          .notification-card.read {
            border-left: 3px solid #e2e8f0;
          }

          /* ===================================
             UNREAD DOT
          =================================== */

          .notification-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #2563eb;
          }

          .notification-dot.empty {
            background: transparent;
          }

          /* ===================================
             ICON
          =================================== */

          .notification-icon {
            width: 54px;
            height: 54px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
          }

          .notification-icon.appointment {
            background: #eff6ff;
            color: #2563eb;
          }

          .notification-icon.medication {
            background: #faf5ff;
            color: #9333ea;
          }

          .notification-icon.lab {
            background: #fff7ed;
            color: #ea580c;
          }

          .notification-icon.success {
            background: #f0fdf4;
            color: #16a34a;
          }

          .notification-icon.warning {
            background: #fff7ed;
            color: #ea580c;
          }

          .notification-icon.info {
            background: #eff6ff;
            color: #2563eb;
          }

          /* ===================================
             CONTENT
          =================================== */

          .notification-content {
            min-width: 0;
          }

          .notification-content h3 {
            margin: 0;
            color: #172033;
            font-size: 14px;
            line-height: 1.35;
            font-weight: 750;
          }

          .notification-content p {
            margin: 5px 0 0;
            color: #64748b;
            font-size: 12px;
            line-height: 1.5;
          }

          .notification-type {
            display: inline-flex;
            margin-top: 7px;
            padding: 4px 9px;
            border-radius: 999px;
            background: #eff6ff;
            color: #2563eb;
            font-size: 9px;
            font-weight: 750;
          }

          .notification-type.medication {
            background: #faf5ff;
            color: #9333ea;
          }

          .notification-type.lab {
            background: #fff7ed;
            color: #ea580c;
          }

          .notification-type.success {
            background: #f0fdf4;
            color: #16a34a;
          }

          .notification-type.general {
            background: #eff6ff;
            color: #2563eb;
          }

          /* ===================================
             DATE / TIME
          =================================== */

          .notification-time {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            color: #64748b;
            font-size: 11px;
            line-height: 1.5;
          }

          .notification-time svg {
            margin-top: 2px;
            flex-shrink: 0;
          }

          .notification-time-date {
            display: block;
            font-weight: 600;
          }

          .notification-time-hour {
            display: block;
            margin-top: 2px;
          }

          /* ===================================
             CARD ACTIONS
          =================================== */

          .notification-card-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
          }

          .mark-read-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            min-width: 118px;
            height: 40px;
            padding: 0 12px;
            border: 1px solid #5db8b8;
            border-radius: 8px;
            background: #ffffff;
            color: #087f80;
            font-family: inherit;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s ease;
          }

          .mark-read-btn:hover {
            background: #f0fdfa;
          }

          .read-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            min-width: 118px;
            color: #087f80;
            font-size: 11px;
            font-weight: 700;
          }

          .delete-btn {
            width: 40px;
            height: 40px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            background: #ffffff;
            color: #ef4444;
            cursor: pointer;
            transition: 0.2s ease;
          }

          .delete-btn:hover {
            background: #fef2f2;
          }

          /* ===================================
             EMPTY STATE
          =================================== */

          .notifications-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 320px;
            padding: 40px 20px;
            border: 1px solid #e2e8f0;
            border-radius: 15px;
            background: #ffffff;
            text-align: center;
          }

          .notifications-empty-icon {
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px;
            background: #eff6ff;
            color: #2563eb;
          }

          .notifications-empty h2 {
            margin: 17px 0 0;
            color: #172033;
            font-size: 18px;
          }

          .notifications-empty p {
            margin: 7px 0 0;
            color: #94a3b8;
            font-size: 12px;
          }

          /* ===================================
             LOADING
          =================================== */

          .notifications-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 320px;
            border: 1px solid #e2e8f0;
            border-radius: 15px;
            background: #ffffff;
            text-align: center;
            color: #2563eb;
          }

          .notifications-loading h3 {
            margin: 15px 0 0;
            color: #334155;
            font-size: 14px;
          }

          .notifications-loading p {
            margin: 6px 0 0;
            color: #94a3b8;
            font-size: 11px;
          }

          /* ===================================
             END
          =================================== */

          .notifications-end {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-top: 30px;
          }

          .notifications-end span {
            flex: 1;
            height: 1px;
            background: #e2e8f0;
          }

          .notifications-end p {
            margin: 0;
            color: #94a3b8;
            font-size: 11px;
            white-space: nowrap;
          }

          /* ===================================
             SPINNER
          =================================== */

          .notification-spin {
            animation:
              mednexus-notification-spin
              1s linear infinite;
          }

          @keyframes mednexus-notification-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          /* ===================================
             RESPONSIVE
          =================================== */

          @media (max-width: 1100px) {

            .notification-card {
              grid-template-columns:
                8px
                55px
                minmax(0, 1fr)
                auto;
            }

            .notification-time {
              display: none;
            }

          }

          @media (max-width: 800px) {

            .notifications-page {
              padding: 25px 20px 35px;
            }

            .notifications-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .notifications-header-actions {
              width: 100%;
            }

            .notification-action {
              flex: 1;
            }

            .notification-card {
              grid-template-columns:
                8px
                52px
                minmax(0, 1fr);
              gap: 13px;
              padding: 15px;
            }

            .notification-card-actions {
              grid-column: 3;
              justify-content: flex-start;
            }

            .notification-time {
              display: flex;
              grid-column: 3;
            }

          }

          @media (max-width: 550px) {

            .notifications-page {
              padding: 20px 14px 30px;
            }

            .notifications-title-row h1 {
              font-size: 28px;
            }

            .notifications-header-actions {
              flex-direction: column;
            }

            .notification-action {
              width: 100%;
            }

            .notification-card {
              grid-template-columns:
                8px
                48px
                minmax(0, 1fr);
            }

            .notification-icon {
              width: 48px;
              height: 48px;
            }

            .notification-time,
            .notification-card-actions {
              grid-column: 3;
            }

            .notifications-end {
              gap: 10px;
            }

            .notifications-end p {
              font-size: 9px;
            }

          }

        `}
      </style>

    </section>
  );
}

// ======================================================
// NOTIFICATION CARD
// ======================================================

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}) {
  const type = String(
    notification.notification_type ||
      notification.type ||
      "general"
  ).toLowerCase();

  const title =
    notification.title ||
    notification.subject ||
    "Notification";

  const message =
    notification.message ||
    notification.description ||
    notification.content ||
    "You have a new notification.";

  const isRead =
    notification.is_read === true ||
    notification.read === true;

  const Icon = getNotificationIcon(type);

  const typeClass = getTypeClass(type);

  return (
    <article
      className={`notification-card ${
        isRead ? "read" : "unread"
      }`}
    >

      {/* UNREAD DOT */}

      <div
        className={`notification-dot ${
          isRead ? "empty" : ""
        }`}
      />

      {/* ICON */}

      <div
        className={`notification-icon ${typeClass}`}
      >
        <Icon size={25} />
      </div>

      {/* CONTENT */}

      <div className="notification-content">

        <h3>{title}</h3>

        <p>{message}</p>

        <span
          className={`notification-type ${typeClass}`}
        >
          {formatNotificationType(type)}
        </span>

      </div>

      {/* DATE / TIME */}

      <div className="notification-time">

        <Clock3 size={15} />

        <div>

          <span className="notification-time-date">
            {formatDate(notification.created_at)}
          </span>

          <span className="notification-time-hour">
            {formatTime(notification.created_at)}
          </span>

        </div>

      </div>

      {/* ACTIONS */}

      <div className="notification-card-actions">

        {!isRead ? (
          <button
            type="button"
            className="mark-read-btn"
            onClick={() =>
              onMarkRead(notification.id)
            }
          >
            <Check size={15} />
            Mark Read
          </button>
        ) : (
          <span className="read-status">
            <Check size={16} />
            Read
          </span>
        )}

        <button
          type="button"
          className="delete-btn"
          title="Delete notification"
          onClick={() =>
            onDelete(notification.id)
          }
        >
          <Trash2 size={17} />
        </button>

      </div>

    </article>
  );
}

// ======================================================
// ICON
// ======================================================

function getNotificationIcon(type) {
  if (
    type.includes("appointment") ||
    type.includes("calendar")
  ) {
    return CalendarCheck;
  }

  if (
    type.includes("medicine") ||
    type.includes("prescription") ||
    type.includes("medication")
  ) {
    return Pill;
  }

  if (
    type.includes("lab") ||
    type.includes("test") ||
    type.includes("report")
  ) {
    return FlaskConical;
  }

  if (
    type.includes("success") ||
    type.includes("complete") ||
    type.includes("confirmation") ||
    type.includes("confirmed")
  ) {
    return CheckCircle2;
  }

  if (
    type.includes("warning") ||
    type.includes("alert")
  ) {
    return AlertCircle;
  }

  return Info;
}

// ======================================================
// TYPE CLASS
// ======================================================

function getTypeClass(type) {
  if (
    type.includes("appointment") ||
    type.includes("calendar")
  ) {
    return "appointment";
  }

  if (
    type.includes("medicine") ||
    type.includes("prescription") ||
    type.includes("medication")
  ) {
    return "medication";
  }

  if (
    type.includes("lab") ||
    type.includes("test") ||
    type.includes("report")
  ) {
    return "lab";
  }

  if (
    type.includes("success") ||
    type.includes("complete") ||
    type.includes("confirmation") ||
    type.includes("confirmed")
  ) {
    return "success";
  }

  if (
    type.includes("warning") ||
    type.includes("alert")
  ) {
    return "warning";
  }

  return "general";
}

// ======================================================
// TYPE NAME
// ======================================================

function formatNotificationType(type) {
  if (
    type.includes("appointment") ||
    type.includes("calendar")
  ) {
    return "Appointment";
  }

  if (
    type.includes("medicine") ||
    type.includes("prescription") ||
    type.includes("medication")
  ) {
    return "Medication";
  }

  if (
    type.includes("lab") ||
    type.includes("test") ||
    type.includes("report")
  ) {
    return "Lab Report";
  }

  if (
    type.includes("success") ||
    type.includes("complete") ||
    type.includes("confirmation") ||
    type.includes("confirmed")
  ) {
    return "Success";
  }

  if (
    type.includes("warning") ||
    type.includes("alert")
  ) {
    return "Alert";
  }

  return "General";
}

// ======================================================
// DATE
// ======================================================

function formatDate(value) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ======================================================
// TIME
// ======================================================

function formatTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default Notifications;