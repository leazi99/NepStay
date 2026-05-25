import express from "express";
import userAuth from "../middleware/userAuth.js";
import getHotelAnalytics from "../controllers/analyticsController.js";

const hotelAnalyticsRoutes = express.Router();

hotelAnalyticsRoutes.get("/overview", userAuth, getHotelAnalytics);

export default hotelAnalyticsRoutes;
