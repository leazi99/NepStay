import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createPayment,
  getEligibleBookings,
  getHotelPayments,
  createKhaltiPaymentSession,
  confirmKhaltiPayment,
  createStripeCheckoutSession,
} from "../controllers/paymentController.js";

const paymentRoutes = express.Router();

paymentRoutes.get("/", userAuth, getHotelPayments);
paymentRoutes.get("/eligible-bookings", userAuth, getEligibleBookings);
paymentRoutes.post("/", userAuth, createPayment);
paymentRoutes.post("/stripe/session", userAuth, createStripeCheckoutSession);
paymentRoutes.post("/khalti/initiate", userAuth, createKhaltiPaymentSession);
paymentRoutes.post("/khalti/confirm", userAuth, confirmKhaltiPayment);

export default paymentRoutes;
