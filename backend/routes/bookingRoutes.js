import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createBookingRequest,
  getMyBookings,
  getBookingsForRoom,
  getBookingById,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const bookingRoutes = express.Router();

bookingRoutes
  .route("/")
  .post(userAuth, createBookingRequest)
  .get(userAuth, getMyBookings);
bookingRoutes.route("/room/:roomId").get(userAuth, getBookingsForRoom);
bookingRoutes.route("/room/:jobId").get(userAuth, getBookingsForRoom);
bookingRoutes
  .route("/:id")
  .get(userAuth, getBookingById)
  .put(userAuth, updateBookingStatus);

export default bookingRoutes;
