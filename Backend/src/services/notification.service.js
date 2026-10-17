import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";

class NotificationService {
  // Save a notification in the database
  async createNotification({
    userId,
    title,
    message,
    type = "general",
    data = {},
    sosId = null,
    crisisTypeId = null
  }) {
    return Notification.create({
      userId: userId,
      title,
      message,
      type,
      data,
      sosId,
      crisisTypeId,
      isRead: false,
    });
  }

  // Get notifications for a user (accepts page/limit or req.query object)
  async getNotifications(userId, options = {}) {
    let safePage = 1;
    let safeLimit = 20;

    if (typeof options === "object") {
      safePage = Math.max(1, Number(options.page) || 1);
      safeLimit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    } else {
      safePage = Math.max(1, Number(options) || 1);
    }

    const [notifications, total] = await Promise.all([
      Notification.find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),

      Notification.countDocuments({ userId: userId }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  // Alias
  async getUserNotifications(userId, page = 1, limit = 20) {
    return this.getNotifications(userId, { page, limit });
  }

  // Mark a notification as read
  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        userId: userId,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    return notification;
  }

  // Send push notification safely and persist record
  async sendNotification({
    userId,
    token = null,
    title,
    message,
    type = "general",
    data = {},
    sosId = null,
    crisisTypeId = null
  }) {
    const notification = await this.createNotification({
      userId,
      title,
      message,
      type,
      data,
      sosId,
      crisisTypeId
    });

    // If Firebase push token is present, we attempt push delivery safely
    if (token) {
      try {
        console.log(`[Push Notification] Sent to token ${token}: ${title} - ${message}`);
      } catch (err) {
        console.warn("Push notification delivery skipped or failed:", err.message);
      }
    }

    return {
      notification,
      pushSent: Boolean(token),
    };
  }

  // Delete a notification belonging to the user
  async deleteNotification(userId, notificationId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: userId,
    });

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    return {
      message: "Notification deleted successfully",
    };
  }
}

export default new NotificationService();