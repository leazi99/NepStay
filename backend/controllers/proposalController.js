import jobModel from "../models/jobModel.js";
import proposalModel from "../models/proposalModel.js";
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";

const ensureJobSeeker = (req, res) => {
  if (req.user?.role !== "jobseeker") {
    res.status(403).json({
      success: false,
      message: "Only jobseekers can submit proposals",
    });
    return false;
  }

  return true;
};

const ensureEmployer = (req, res) => {
  if (req.user?.role !== "employer") {
    res.status(403).json({
      success: false,
      message: "Only employers can access this proposal action",
    });
    return false;
  }

  return true;
};

export const createProposal = async (req, res) => {
  try {
    if (!ensureJobSeeker(req, res)) return;

    const { jobId } = req.params;
    const { coverLetter, proposedAmount } = req.body;

    if (!jobId || !coverLetter || !proposedAmount) {
      return res.status(400).json({
        success: false,
        message: "jobId, coverLetter and proposedAmount are required",
      });
    }

    const amount = Number(proposedAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "proposedAmount must be a positive number",
      });
    }

    const job = await jobModel
      .findById(jobId)
      .populate("company", "name companyName");
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.isClosed) {
      return res.status(400).json({
        success: false,
        message: "Cannot submit proposal to a closed job",
      });
    }

    const existingProposal = await proposalModel.findOne({
      job: jobId,
      freelancer: req.user.id,
    });

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a proposal for this job",
      });
    }

    const proposal = await proposalModel.create({
      job: jobId,
      freelancer: req.user.id,
      coverLetter: String(coverLetter).trim(),
      proposedAmount: amount,
    });

    try {
      const freelancer = await userModel.findById(req.user.id).select("name");
      const employerId = job.company?._id || job.company;
      const employerName =
        job.company?.companyName || job.company?.name || "Employer";

      await notificationModel.insertMany([
        {
          recipient: req.user.id,
          sender: employerId,
          type: "system",
          title: "Proposal submitted",
          body: `Your proposal for \"${job.title}\" was submitted successfully.`,
          link: `/job/${job._id}`,
        },
        {
          recipient: employerId,
          sender: req.user.id,
          type: "system",
          title: "New proposal received",
          body: `${freelancer?.name || "A freelancer"} submitted a proposal for \"${job.title}\".`,
          link: `/applicants/${job._id}`,
        },
      ]);
    } catch (notificationError) {
      console.error(
        "Failed to create proposal notifications:",
        notificationError,
      );
    }

    const populatedProposal = await proposalModel
      .findById(proposal._id)
      .populate("job", "title company")
      .populate("freelancer", "name email avatar bio specialization");

    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully",
      proposal: populatedProposal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProposalsForJob = async (req, res) => {
  try {
    if (!ensureEmployer(req, res)) return;

    const { jobId } = req.params;
    const job = await jobModel.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.company.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view proposals for this job",
      });
    }

    const proposals = await proposalModel
      .find({ job: jobId })
      .populate("freelancer", "name email avatar bio specialization")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      proposals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyProposals = async (req, res) => {
  try {
    if (!ensureJobSeeker(req, res)) return;

    const proposals = await proposalModel
      .find({ freelancer: req.user.id })
      .populate({
        path: "job",
        select: "title company isClosed",
        populate: {
          path: "company",
          select: "name companyName companyLogo",
        },
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      proposals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProposalStatus = async (req, res) => {
  try {
    if (!ensureEmployer(req, res)) return;

    const { id } = req.params;
    const { status } = req.body;
    const normalizedStatus = String(status || "")
      .trim()
      .toLowerCase();

    if (!["accepted", "rejected"].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "status must be accepted or rejected",
      });
    }

    const proposal = await proposalModel
      .findById(id)
      .populate({
        path: "job",
        select: "title company",
      })
      .populate("freelancer", "name");

    if (!proposal || !proposal.job) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
      });
    }

    if (proposal.job.company.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this proposal",
      });
    }

    proposal.status = normalizedStatus;
    await proposal.save();

    try {
      const employer = await userModel
        .findById(req.user.id)
        .select("name companyName");
      const employerName =
        employer?.companyName || employer?.name || "Employer";
      const jobTitle = proposal.job?.title || "the job";

      await notificationModel.create({
        recipient: proposal.freelancer._id,
        sender: req.user.id,
        type: "system",
        title:
          normalizedStatus === "accepted"
            ? "Proposal accepted"
            : "Proposal not selected",
        body:
          normalizedStatus === "accepted"
            ? `${employerName} accepted your proposal for \"${jobTitle}\".`
            : `${employerName} did not select your proposal for \"${jobTitle}\".`,
        link: `/job/${proposal.job._id}`,
      });
    } catch (notificationError) {
      console.error(
        "Failed to create proposal status notification:",
        notificationError,
      );
    }

    return res.json({
      success: true,
      message: "Proposal status updated",
      proposal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
