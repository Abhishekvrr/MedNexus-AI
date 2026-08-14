import express from "express";

import {
  createNotification,
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

/*
====================================================
NOTIFICATION ROUTES
====================================================
*/

/*
Create notification
POST /api/notifications
*/
router.post("/", authenticate, createNotification);

/*
Get logged-in user's notifications
GET /api/notifications
*/
router.get("/", authenticate, getNotifications);

/*
Get unread notifications
GET /api/notifications/unread
*/
router.get("/unread", authenticate, getUnreadNotifications);

/*
Mark all notifications as read
PUT /api/notifications/read-all
*/
router.put(
  "/read-all",
  authenticate,
  markAllNotificationsAsRead
);

/*
Mark one notification as read
PUT /api/notifications/:id/read
*/
router.put(
  "/:id/read",
  authenticate,
  markNotificationAsRead
);

/*
Delete notification
DELETE /api/notifications/:id
*/
router.delete(
  "/:id",
  authenticate,
  deleteNotification
);

export default router;