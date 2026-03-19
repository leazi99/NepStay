import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createPayment,
  getEligibleHiredApplications,
  getEmployerPayments,
  createStripeCheckoutSession,
  createStripePaymentIntent,
  confirmStripePaymentIntent,
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
paymentRoutes.post("/create-intent", userAuth, createStripePaymentIntent);
paymentRoutes.post("/confirm-intent", userAuth, confirmStripePaymentIntent);

export default paymentRoutes;
