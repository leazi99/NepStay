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

const jobRouter = express.Router();
import userAuth from "../middleware/userAuth.js";

jobRouter.route("/").post(userAuth, createJob).get(getJobs);
jobRouter.route("/get-jobs-employer").get(userAuth, getJobsEmployer);
jobRouter.route("/:id").get(getJobById).put(userAuth, updateJob).delete(userAuth, deleteJob);
jobRouter.route("/:id/toggle-close").put(userAuth, toggleCloseJob);

export default jobRouter;
