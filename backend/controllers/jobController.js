import userModel from "../models/userModel.js";
import jobModel from "../models/jobModel.js";
import applicationModel from "../models/applicationModel.js";
import savedModel from "../models/savedModel.js";
import notificationModel from "../models/notificationModel.js";

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
  const { keyword, location, category, type, minSalary, maxSalary, userId } =
    req.query;

  const query = {
    isClosed: false,
    ...(keyword && { title: { $regex: keyword, $options: "i" } }),
    ...(location && { location: { $regex: location, $options: "i" } }),
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
        const jobIdStr = String(job._id);
        return {
          ...job.toObject(),
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
      jobs,
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

    return res.json({
      success: true,
      job: {
        ...job.toObject(),
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
