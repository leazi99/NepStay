import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", userAuth, getNotifications);
notificationRouter.put("/read-all", userAuth, markAllNotificationsAsRead);
notificationRouter.put(
  "/:notificationId/read",
  userAuth,
  markNotificationAsRead,
);

export default notificationRouter;
