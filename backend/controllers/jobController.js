import userModel from "../models/userModel.js";
import mongoose from "mongoose";
import jobModel from "../models/jobModel.js";
import applicationModel from "../models/applicationModel.js";
import savedModel from "../models/savedModel.js";
import notificationModel from "../models/notificationModel.js";
import reviewModel from "../models/reviewModel.js";

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildEmployerReviewSummaryMap = async (companyIds = []) => {
  const uniqueCompanyIds = [...new Set(companyIds.map(String))];
  if (uniqueCompanyIds.length === 0) {
    return new Map();
  }

  const reviewSummary = await reviewModel.aggregate([
    {
      $match: {
        reviewee: {
          $in: uniqueCompanyIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        isPublicVisible: { $ne: false },
      },
    },
    {
      $group: {
        _id: "$reviewee",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const summaryMap = new Map();
  reviewSummary.forEach((item) => {
    summaryMap.set(String(item._id), {
      averageRating: Number((item.averageRating || 0).toFixed(1)),
      totalReviews: Number(item.totalReviews || 0),
    });
  });

  return summaryMap;
};

const withEmployerReviewSummary = (job, reviewSummaryMap) => {
  const baseJob = job.toObject ? job.toObject() : { ...job };
  const companyId = String(baseJob?.company?._id || baseJob?.company || "");
  const summary = reviewSummaryMap.get(companyId) || {
    averageRating: 0,
    totalReviews: 0,
  };

  return {
    ...baseJob,
    company: {
      ...(baseJob.company || {}),
      ratingAvg: summary.averageRating,
      ratingCount: summary.totalReviews,
    },
  };
};

export const createJob = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.json({
        success: false,
        message: "Only employers can create jobs",
      });
    }

    const job = await jobModel.create({
      ...req.body,
      company: req.user.id,
    });

    try {
      const [employer, jobseekers] = await Promise.all([
        userModel.findById(req.user.id).select("name companyName"),
        userModel.find({ role: "jobseeker" }).select("_id"),
      ]);

      const employerDisplayName =
        employer?.companyName || employer?.name || "An employer";

      const notifications = [
        {
          recipient: req.user.id,
          sender: null,
          type: "system",
          title: "Job posted successfully",
          body: `Your job \"${job.title}\" has been posted.`,
          link: `/employer-job/${job._id}`,
        },
        ...jobseekers.map((jobseeker) => ({
          recipient: jobseeker._id,
          sender: req.user.id,
          type: "system",
          title: "New job posted",
          body: `${employerDisplayName} posted a new job: \"${job.title}\".`,
          link: `/job/${job._id}`,
        })),
      ];

      if (notifications.length) {
        await notificationModel.insertMany(notifications, { ordered: false });
      }
    } catch (notificationError) {
      console.error(
        "Failed to create job-post notifications:",
        notificationError,
      );
    }

    return res.json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getJobs = async (req, res) => {
  const {
    keyword,
    location,
    jobLocation,
    category,
    type,
    minSalary,
    maxSalary,
    userId,
  } = req.query;

  const normalizedJobLocation = String(jobLocation || "")
    .trim()
    .toLowerCase();

  const query = {
    isClosed: false,
    ...(keyword && { title: { $regex: keyword, $options: "i" } }),
    ...(location && { location: { $regex: location, $options: "i" } }),
    ...(normalizedJobLocation && {
      jobLocationLower: { $regex: escapeRegex(normalizedJobLocation) },
    }),
    ...(category && { category }),
    ...(type && { type }),
  };

  if (minSalary || maxSalary) {
    query.$and = [];

    if (minSalary) {
      query.$and.push({ salaryMax: { $gte: Number(minSalary) } });
    }
    if (maxSalary) {
      query.$and.push({ salaryMin: { $lte: Number(maxSalary) } });
    }

    if (query.$and.length === 0) {
      delete query.$and;
    }
  }

  try {
    const jobs = await jobModel
      .find(query)
      .populate("company", "name companyName companyLogo");

    const reviewSummaryMap = await buildEmployerReviewSummaryMap(
      jobs.map((job) => job?.company?._id || job?.company).filter(Boolean),
    );

    const jobsWithReviewSummary = jobs.map((job) =>
      withEmployerReviewSummary(job, reviewSummaryMap),
    );

    let savedJobIds = [];
    let appliedJobStatusMap = {};

    if (userId) {
      const savedJobs = await savedModel
        .find({ jobseeker: userId })
        .select("job");
      savedJobIds = savedJobs.map((s) => String(s.job));

      const applications = await applicationModel
        .find({ applicant: userId })
        .select("job status");
      applications.forEach((app) => {
        appliedJobStatusMap[String(app.job)] = app.status;
      });

      const jobsWithExtras = jobs.map((job) => {
        const enrichedJob = withEmployerReviewSummary(job, reviewSummaryMap);
        const jobIdStr = String(enrichedJob._id);
        return {
          ...enrichedJob,
          isSaved: savedJobIds.includes(jobIdStr),
          applicationStatus: appliedJobStatusMap[jobIdStr] || null,
        };
      });

      return res.json({
        success: true,
        jobs: jobsWithExtras,
      });
    }

    return res.json({
      success: true,
      jobs: jobsWithReviewSummary,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getJobsEmployer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.user;

    if (role !== "employer") {
      return res.json({
        success: false,
        message: "Only employers can access their jobs",
      });
    }

    const jobs = await jobModel
      .find({ company: userId })
      .populate("company", "name companyName companyLogo")
      .lean();

    const jobsWithApplicationCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await applicationModel.countDocuments({
          job: job._id,
        });
        return {
          ...job,
          applicationCount: applicantCount,
        };
      }),
    );

    return res.json({
      success: true,
      jobs: jobsWithApplicationCounts,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const job = await jobModel
      .findById(id)
      .populate("company", "name companyName companyLogo");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    let applicationStatus = null;
    if (userId) {
      const application = await applicationModel
        .findOne({
          job: job._id,
          applicant: userId,
        })
        .select("status");
      if (application) {
        applicationStatus = application.status;
      }
    }

    const reviewSummaryMap = await buildEmployerReviewSummaryMap([
      job?.company?._id || job?.company,
    ]);

    const jobWithReviewSummary = withEmployerReviewSummary(
      job,
      reviewSummaryMap,
    );

    return res.json({
      success: true,
      job: {
        ...jobWithReviewSummary,
        applicationStatus,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await jobModel.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "job not found",
      });
    }

    if (job.company.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job",
      });
    }

    Object.assign(job, req.body);
    const updatedJob = await job.save();
    return res.json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await jobModel.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "job not found",
      });
    }

    if (job.company.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job",
      });
    }

    await jobModel.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: "job deleted successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleCloseJob = async (req, res) => {
  try {
    const job = await jobModel.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "job not found",
      });
    }

    if (job.company.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to close this job",
      });
    }

    job.isClosed = !job.isClosed;
    await job.save();

    return res.json({
      success: true,
      message: "job marked as " + (job.isClosed ? "closed" : "open"),
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
