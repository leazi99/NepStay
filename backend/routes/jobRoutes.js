import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleCloseJob,
  getJobsEmployer,
} from "../controllers/jobController.js";

import { Router } from "express";

Router.route("/").post(createJob).get(getJobs);
Router.route("/get-jobs-employer").get(getJobsEmployer);
Router.route("/:id").get(getJobById).put(updateJob).delete(deleteJob);
Router.route("/:id/toggle-close").put(toggleCloseJob);

export default Router;
