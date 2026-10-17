
import admin from "firebase-admin";
import ApiError from "../../utils/ApiError.js";

const notificationProvider = {
  async sendPushNotification({
    token,
    title,
    body,
    data = {},
  }) {
    if (!token || !title || !body) {
      throw new ApiError(
        400,
        "Token, title and body are required"
      );
    }

    if (!admin.apps.length) {
      throw new ApiError(
        503,
        "Firebase is not configured"
      );
    }

    try {
      const messageId = await admin.messaging().send({
        token,
        notification: {
          title,
          body,
        },
        data,
      });

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      throw new ApiError(
        502,
        "Failed to send push notification"
      );
    }
  },
};

export default notificationProvider;