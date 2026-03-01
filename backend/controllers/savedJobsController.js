import SavedJob from "../models/savedModel.js";

export const saveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const exists = await SavedJob.findOne({
      job: jobId,
      jobseeker: userId,
    });

    if (exists) {
      return res.json({
        success: false,
        message: "Job already saved",
      });
    }

    const savedJob = await SavedJob.create({
      job: jobId,
      jobseeker: userId,
    });

    return res.json({
      success: true,
      message: "Job saved successfully",
      savedJob,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const unsaveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    await SavedJob.findOneAndDelete({
      job: jobId,
      jobseeker: userId,
    });

    return res.json({
      success: true,
      message: "Job removed from saved lists",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedJobs = await SavedJob.find({
      jobseeker: userId,
    }).populate({
      path: "job",
      populate: {
        path: "company",
        select: "name companyName companyLogo",
      },
    });

    return res.json({
      success: true,
      savedJobs,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
