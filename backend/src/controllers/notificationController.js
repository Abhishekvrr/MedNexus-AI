import { query } from "../config/database.js";

/*
====================================================
CREATE NOTIFICATION
POST /api/notifications
====================================================
*/
export const createNotification = async (req, res) => {
  try {
    const {
      user_id,
      title,
      message,
      notification_type,
    } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "user_id, title and message are required",
      });
    }

    // Check whether user exists
    const userResult = await query(
      `
      SELECT id, full_name, email
      FROM users
      WHERE id = $1
      `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const result = await query(
      `
      INSERT INTO notifications (
        user_id,
        title,
        message,
        notification_type
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        user_id,
        title,
        message,
        notification_type || "general",
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

/*
====================================================
GET ALL NOTIFICATIONS FOR LOGGED-IN USER
GET /api/notifications
====================================================
*/
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `
      SELECT
        id,
        user_id,
        title,
        message,
        notification_type,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      notifications: result.rows,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/*
====================================================
GET UNREAD NOTIFICATIONS
GET /api/notifications/unread
====================================================
*/
export const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `
      SELECT
        id,
        user_id,
        title,
        message,
        notification_type,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
        AND is_read = false
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      notifications: result.rows,
    });
  } catch (error) {
    console.error("Get unread notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notifications",
      error: error.message,
    });
  }
};

/*
====================================================
MARK NOTIFICATION AS READ
PUT /api/notifications/:id/read
====================================================
*/
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1
        AND user_id = $2
      RETURNING *
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

/*
====================================================
MARK ALL NOTIFICATIONS AS READ
PUT /api/notifications/read-all
====================================================
*/
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1
        AND is_read = false
      RETURNING *
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
      error: error.message,
    });
  }
};

/*
====================================================
DELETE NOTIFICATION
DELETE /api/notifications/:id
====================================================
*/
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `
      DELETE FROM notifications
      WHERE id = $1
        AND user_id = $2
      RETURNING id
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      notification_id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};