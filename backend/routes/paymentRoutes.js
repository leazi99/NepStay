import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createPayment,
  getEligibleHiredApplications,
  getEmployerPayments,
  createKhaltiPaymentSession,
  confirmKhaltiPayment,
} from "../controllers/paymentController.js";

const paymentRoutes = express.Router();

paymentRoutes.get("/", userAuth, getEmployerPayments);
paymentRoutes.get(
  "/eligible-applications",
  userAuth,
  getEligibleHiredApplications,
);
paymentRoutes.post("/", userAuth, createPayment);
paymentRoutes.post("/khalti/initiate", userAuth, createKhaltiPaymentSession);
paymentRoutes.post("/khalti/confirm", userAuth, confirmKhaltiPayment);

export default paymentRoutes;
