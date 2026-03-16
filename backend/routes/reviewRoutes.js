import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createReview,
  getEligibleReviews,
  getGivenReviews,
  getReceivedReviews,
} from "../controllers/reviewController.js";

const reviewRoutes = express.Router();

reviewRoutes.get("/eligible", userAuth, getEligibleReviews);
reviewRoutes.get("/received", userAuth, getReceivedReviews);
reviewRoutes.get("/given", userAuth, getGivenReviews);
reviewRoutes.post("/", userAuth, createReview);

export default reviewRoutes;
