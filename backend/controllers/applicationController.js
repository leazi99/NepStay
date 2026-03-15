import applicationModel from "../models/applicationModel.js";
import jobModel from "../models/jobModel.js";
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";

export const applyToJob = async (req, res) => {
  try {
    const { jobId, resume } = req.body;
    const userId = req.user.id;

    if (!jobId) {
      return res.json({
        success: false,
        message: "Job ID is required",
      });
    }

    const existingApplication = await applicationModel.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const job = await jobModel.findById(jobId);
    if (!job) {
      return res.json({
        success: false,
        message: "Job not found",
      });
    }

    const application = await applicationModel.create({
      job: jobId,
      applicant: userId,
      resume: resume || "",
    });

    if (typeof resume === "string" && resume.trim()) {
      await userModel.findByIdAndUpdate(userId, { resume: resume.trim() });
    }

    return res.json({
      success: true,
      message: "Applied successfully",
      application,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await applicationModel
      .find({ applicant: userId })
      .populate({
        path: "job",
        populate: {
          path: "company",
          select: "name companyName companyLogo",
        },
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      applications,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = String(req.user.id);

    const job = await jobModel.findById(jobId);
    if (!job) {
      return res.json({
        success: false,
        message: "Job not found",
      });
    }

    if (String(job.company) !== userId) {
      return res.json({
        success: false,
        message: "Unauthorized: Only the job creator can view applications",
      });
    }

    const applications = await applicationModel
      .find({ job: jobId })
      .populate("applicant", "name email avatar role")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      applications,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await applicationModel
      .findById(id)
      .populate("job applicant");

    if (!application) {
      return res.json({
        success: false,
        message: "Application not found",
      });
    }

    return res.json({
      success: true,
      application,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = String(req.user.id);

    const application = await applicationModel
      .findById(id)
      .populate("job", "title company")
      .populate("applicant", "name");
    if (!application) {
      return res.json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify if the requester is the owner of the job
    if (String(application.job.company) !== userId) {
      return res.json({
        success: false,
        message: "Unauthorized: Only the job creator can update status",
      });
    }

    const previousStatus = application.status;
    application.status = status;
    await application.save();

    if (application.status === "Rejected" && previousStatus !== "Rejected") {
      try {
        const employer = await userModel
          .findById(userId)
          .select("name companyName");

        const employerDisplayName =
          employer?.companyName || employer?.name || "Employer";
        const applicantName = application.applicant?.name || "Applicant";
        const jobTitle = application.job?.title || "the job";

        await notificationModel.insertMany([
          {
            recipient: application.applicant._id,
            sender: application.job.company,
            type: "system",
            title: "Application declined",
            body: `Your application for \"${jobTitle}\" was declined by ${employerDisplayName}.`,
            link: `/job/${application.job._id}`,
          },
          {
            recipient: application.job.company,
            sender: null,
            type: "system",
            title: "Application declined",
            body: `You declined ${applicantName}'s application for \"${jobTitle}\".`,
            link: `/applicants/${application.job._id}`,
          },
        ]);
      } catch (notificationError) {
        console.error(
          "Failed to create decline notifications:",
          notificationError,
        );
      }
    }

    return res.json({
      success: true,
      message: "Application status updated",
      application,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
