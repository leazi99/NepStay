// import express from "express";
// import jobModel from "../models/jobModel";
// import Proposal from "../models/proposalModel";
// import jwt from "jsonwebtoken";
// import User from "../models/userModel";

// const router = express.Router();

// const protect = async (req, res, next) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split("")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select("-password");
//       next();
//     } catch (error) {
//       res.status(401).json({
//         message: "Not authorized,token failed",
//       });
//     }
//   }
//   if (!token) {
//     res.status(401).json({
//       message: "Not authorized ,no token",
//     });
//   }
// };

// router.post("/:jobId", protect, async (req, res) => {
//   if (req.user.role !== "freelancer") {
//     return res.status(403).json({
//       message: "Only freelancers can submit proposals",
//     });
//   }
//   const { coverLetter, proposedAmount } = req.body;
//   const jobId = req.params.jobId;

//   try {
//     const job = await jobModel.findById(jobId);
//     if (!job) {
//       return res.status(404).json({
//         message: "Job not found",
//       });
//     }

//     const existingProposal = await Proposal.findOne({
//       job: jobId,
//       freelancer: req.user._id,
//     });
//     if (existingProposal) {
//       return res.status(400).json({
//         message: "You have already submitted a proposal for this job",
//       });
//     }
//     const proposal = await Proposal.create({
//       job: jobId,
//       freelancer: req.user._id,
//       coverLetter,
//       proposedAmount,
//     });
//     res.status(201).json(proposal);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });

// router.get("/job/:jobid", protect, async (req, res) => {
//   try {
//     const job = await jobModel.findById(req.params.jobId);
//     if (!job) {
//       return res.status(404).json({
//         message: "Job not found",
//       });
//     }

//     if (job.client.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         message: "Not authorized to view proposals for this job",
//       });
//     }

//     const proposals = await proposalModel
//       .find({ job: req.params.jobid })
//       .populate("freelancer", "name email skills rating bio");
//     res.json(proposals);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// export default router;
