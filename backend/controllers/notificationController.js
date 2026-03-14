import notificationModel from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await notificationModel
      .find({ recipient: userId })
      .populate("sender", "name email role avatar")
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = notifications.filter((item) => !item.isRead).length;

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await notificationModel.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      notification,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await notificationModel.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true },
    );

    return res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
