import express from "express";
import userAuth from "../middleware/userAuth.js";
import getEmployerAnalytics from "../controllers/analyticsController.js";

const analyticsRouter = express.Router();

analyticsRouter.get("/overview", userAuth, getEmployerAnalytics);

export default analyticsRouter;
