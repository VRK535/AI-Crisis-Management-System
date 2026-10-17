
import notificationService from "../services/notification.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

// Get all notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotifications(
    req.user.id,
    req.query
  );

  res.status(200).json(
    new ApiResponse(
      200,
      notifications,
      "Notifications fetched successfully"
    )
  );
});

// Mark a notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.user.id,
    req.params.notificationId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      notification,
      "Notification marked as read"
    )
  );
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(
    req.user.id,
    req.params.notificationId
  );

  res.status(200).json(
    new ApiResponse(200, null, "Notification deleted successfully")
  );
});