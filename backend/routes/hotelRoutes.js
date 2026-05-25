import express from "express";
import userAuth from "../middleware/userAuth.js";
import requireRole from "../middleware/requireRole.js";
import {
  getHotels,
  getFeaturedHotels,
  getHotelById,
  getHotelRooms,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";

const hotelRoutes = express.Router();

// Public routes - no authentication required
hotelRoutes.route("/").get(getHotels);
hotelRoutes.route("/featured").get(getFeaturedHotels);
hotelRoutes.route("/:id").get(getHotelById);
hotelRoutes.route("/:id/rooms").get(getHotelRooms);

// Admin-only routes - require authentication and admin role
hotelRoutes.route("/").post(userAuth, requireRole("admin"), createHotel);
hotelRoutes.route("/:id").put(userAuth, requireRole("admin"), updateHotel);
hotelRoutes.route("/:id").delete(userAuth, requireRole("admin"), deleteHotel);

export default hotelRoutes;
