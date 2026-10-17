import { Router } from "express";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// GET /api/v1/notifications
router.get("/", getNotifications);

// PATCH /api/v1/notifications/:notificationId/read
router.patch("/:notificationId/read", markNotificationAsRead);

// DELETE /api/v1/notifications/:notificationId
router.delete("/:notificationId", deleteNotification);

export default router;

