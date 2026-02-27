import express from"express";
import { applyToJob,
   getMyApplications,
   getApplicationsForJob,
    getApplicationById,
     updateApplicationStatus, } from "../controllers/applicationController.js";
import userAuth from "../middleware/userAuth.js";

const applicationRouter = express.Router();

applicationRouter.route("/").post(userAuth, applyToJob).get(userAuth, getMyApplications);
applicationRouter.route("/job/:jobId").get(userAuth, getApplicationsForJob);
applicationRouter.route("/:id").get(userAuth, getApplicationById).put(userAuth, updateApplicationStatus);

export default applicationRouter;