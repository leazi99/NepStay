import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  createProposal,
  getMyProposals,
  getProposalsForJob,
  updateProposalStatus,
} from "../controllers/proposalController.js";

const proposalRouter = express.Router();

proposalRouter.post("/:jobId", userAuth, createProposal);
proposalRouter.get("/mine", userAuth, getMyProposals);
proposalRouter.get("/job/:jobId", userAuth, getProposalsForJob);
proposalRouter.patch("/:id/status", userAuth, updateProposalStatus);

export default proposalRouter;
