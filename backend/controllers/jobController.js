import jobModel from "../models/jobModel.js";
import userModel from "../models/userModel.js";

export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      jobLocation,
      category,
      salaryMin,
      salaryMax,
      duration,
    } = req.body;
    const userId = req.user.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !location ||
      !salaryMin ||
      !salaryMax ||
      !duration
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const user = await userModel.findById(userId).select("role");
    if (!user || user.role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Only employers can create jobs",
      });
    }

    const newJob = await jobModel.create({
      title,
      description,
      requirements,
      location,
      jobLocation: jobLocation || "",
      category: category || "",
      salaryMin,
      salaryMax,
      duration,
      company: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: newJob,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating job",
      error: error.message,
    });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { location, category, search, salaryMin, salaryMax, sortBy } =
      req.query;
    const filter = { isClosed: false };

    if (location) {
      filter.jobLocationLower = location.toLowerCase();
    }
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (salaryMin || salaryMax) {
      filter.$and = [];
      if (salaryMin) {
        filter.$and.push({ salaryMax: { $gte: parseInt(salaryMin) } });
      }
      if (salaryMax) {
        filter.$and.push({ salaryMin: { $lte: parseInt(salaryMax) } });
      }
    }

    let query = jobModel
      .find(filter)
      .populate("company", "name profile profileImage");

    if (sortBy === "newest") {
      query = query.sort({ createdAt: -1 });
    } else if (sortBy === "salary") {
      query = query.sort({ salaryMax: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const jobs = await query;

    return res.status(200).json({
      success: true,
      jobs,
      count: jobs.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await jobModel
      .findById(id)
      .populate("company", "name profile profileImage email phone");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching job",
      error: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      requirements,
      location,
      jobLocation,
      category,
      salaryMin,
      salaryMax,
      duration,
    } = req.body;

    const job = await jobModel.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.company.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job",
      });
    }

    const updatedJob = await jobModel.findByIdAndUpdate(
      id,
      {
        title: title || job.title,
        description: description || job.description,
        requirements: requirements || job.requirements,
        location: location || job.location,
        jobLocation: jobLocation !== undefined ? jobLocation : job.jobLocation,
        category: category !== undefined ? category : job.category,
        salaryMin: salaryMin || job.salaryMin,
        salaryMax: salaryMax || job.salaryMax,
        duration: duration || job.duration,
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating job",
      error: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const job = await jobModel.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.company.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job",
      });
    }

    await jobModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
};

export const toggleCloseJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const job = await jobModel.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.company.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job",
      });
    }

    job.isClosed = !job.isClosed;
    await job.save();

    return res.status(200).json({
      success: true,
      message: `Job ${job.isClosed ? "closed" : "reopened"} successfully`,
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating job status",
      error: error.message,
    });
  }
};

export const getJobsEmployer = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("role");
    if (!user || user.role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Only employers can view their jobs",
      });
    }

    const jobs = await jobModel
      .find({ company: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      jobs,
      count: jobs.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching employer jobs",
      error: error.message,
    });
  }
};
