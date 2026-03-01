import jobModel from "../models/jobModel";

import applicationModel from "../models/applicationModel";

const getTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getEmployerAlaytics = async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const companyId = req.user._id;

    const now = new Date();

    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    const prev7Days = new Date(now);
    prev7Days.setDate(now.getDate() - 14);

    const totalActiveJobs = await Job.countDocuments({
      company: companyId,
      isClosed: false,
    });
    const jobs = await Job.find({
      company: companyId,
    })
      .select("_id")
      .lean();

    const jobIds = jobs.map((job) => job._id);

    const totalApplications = await Application.countDocuments({
      job: { $in: jobIds },
    });

    const totalHired = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
    });

    const activeJobsLast7 = await Job.countDocuments({
      company: companyId,
      createdAt: { $gte: last7Days, $lte: now },
    });

    const activeJobsPrev7 = await Job.countDocuments({
      company: companyId,
      createdAt: { $gte: prev7Days, $lte: last7Days },
    });

    const activateJobTrend = getTrend(activeJobsLast7, activeJobsPrev7);

    const applicationsLast7 = await Application.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: prev7Days, $lte: last7Days },
    });

    const applicationPrev7 = await Application.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: prev7Days, $lte: last7Days },
    });

    const applicantTrend = getTrend(applicationPrev7, applicationsLast7);

    const hiredLast7 = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
      createdAt: { $gte: last7Days, $lte: now },
    });

    const hiredPrev7 = await Application.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
      createdAt: { $gte: prev7Days, $lte: last7Days },
    });

    const hiredTrend = getTrend(hiredLast7, hiredPrev7);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};
