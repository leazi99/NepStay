import express from "express";
import { Router } from "express";

import userAuth from "../middleware/userAuth.js";
import {
  saveJob,
  unsaveJob,
  getSavedJobs,
} from "../controllers/savedJobsController.js";

const savedJobsRouter = express.Router();

savedJobsRouter.post("/save/:jobId", userAuth, saveJob);
savedJobsRouter.delete("/unsave/:jobId", userAuth, unsaveJob);
savedJobsRouter.get("/", userAuth, getSavedJobs);

export default savedJobsRouter;
