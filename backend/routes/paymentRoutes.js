import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createPayment,
  getEligibleHiredApplications,
  getEmployerPayments,
  createStripeCheckoutSession,
} from "../controllers/paymentController.js";

const paymentRoutes = express.Router();

paymentRoutes.get("/", userAuth, getEmployerPayments);
paymentRoutes.get(
  "/eligible-applications",
  userAuth,
  getEligibleHiredApplications,
);
paymentRoutes.post("/", userAuth, createPayment);
paymentRoutes.post("/checkout-session", userAuth, createStripeCheckoutSession);

export default paymentRoutes;
