import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getAdminOverview,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminPayments,
  getAdminReports,
  updatePaymentStatusByAdmin,
} from "../controllers/adminController.js";

const adminRoutes = express.Router();

adminRoutes.get("/overview", userAuth, getAdminOverview);
adminRoutes.get("/users", userAuth, getAdminUsers);
adminRoutes.put("/users/:userId", userAuth, updateAdminUser);
adminRoutes.delete("/users/:userId", userAuth, deleteAdminUser);
adminRoutes.get("/payments", userAuth, getAdminPayments);
adminRoutes.get("/reports", userAuth, getAdminReports);
adminRoutes.put(
  "/payments/:paymentId/status",
  userAuth,
  updatePaymentStatusByAdmin,
);

export default adminRoutes;
