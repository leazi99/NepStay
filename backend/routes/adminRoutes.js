import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getAdminOverview,
  getAdminUsers,
  updateAdminUser,
  getAdminPayments,
  updatePaymentStatusByAdmin,
} from "../controllers/adminController.js";

const adminRoutes = express.Router();

adminRoutes.get("/overview", userAuth, getAdminOverview);
adminRoutes.get("/users", userAuth, getAdminUsers);
adminRoutes.put("/users/:userId", userAuth, updateAdminUser);
adminRoutes.get("/payments", userAuth, getAdminPayments);
adminRoutes.put(
  "/payments/:paymentId/status",
  userAuth,
  updatePaymentStatusByAdmin,
);

export default adminRoutes;
