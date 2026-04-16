import userModel from "../models/userModel.js";
import paymentModel from "../models/paymentModel.js";
import jobModel from "../models/jobModel.js";
import applicationModel from "../models/applicationModel.js";
import proposalModel from "../models/proposalModel.js";
import reviewModel from "../models/reviewModel.js";
import savedModel from "../models/savedModel.js";
import messageModel from "../models/messageModel.js";
import chatRoomModel from "../models/chatRoomModel.js";
import notificationModel from "../models/notificationModel.js";
import analyticsModel from "../models/analyticsModel.js";

const ensureAdmin = (req, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Only admin can access this resource",
    });
    return false;
  }
  return true;
};

export const getAdminOverview = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const [
      totalUsers,
      totalJobseekers,
      totalEmployers,
      pendingVerification,
      totalPayments,
      completedPayments,
      pendingPayments,
    ] = await Promise.all([
      userModel.countDocuments({}),
      userModel.countDocuments({ role: "jobseeker" }),
      userModel.countDocuments({ role: "employer" }),
      userModel.countDocuments({ identityVerificationStatus: "pending" }),
      paymentModel.countDocuments({}),
      paymentModel.countDocuments({ status: "completed" }),
      paymentModel.countDocuments({ status: "pending" }),
    ]);

    return res.json({
      success: true,
      counts: {
        totalUsers,
        totalJobseekers,
        totalEmployers,
        pendingVerification,
        totalPayments,
        completedPayments,
        pendingPayments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { search = "", role = "all" } = req.query;

    const query = {
      ...(role !== "all" ? { role } : {}),
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const users = await userModel
      .find(query)
      .select(
        "name email role avatar isVerified createdAt studentIdCard nationalIdCard identityVerificationStatus suspensionEndsAt suspensionReason",
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { userId } = req.params;
    const {
      role,
      identityVerificationStatus,
      suspensionDays,
      clearSuspension,
      suspensionReason,
    } = req.body;

    const allowedRoles = ["jobseeker", "employer", "admin"];
    const allowedVerificationStatuses = [
      "not_submitted",
      "pending",
      "verified",
      "rejected",
    ];

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (role !== undefined) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      if (String(user._id) === String(req.user.id) && role !== "admin") {
        return res.status(400).json({
          success: false,
          message: "Admin cannot remove own admin role",
        });
      }

      user.role = role;
    }

    if (clearSuspension === true) {
      user.suspensionEndsAt = null;
      user.suspensionReason = "";
    }

    if (suspensionDays !== undefined) {
      const parsedDays = Number(suspensionDays);

      if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 365) {
        return res.status(400).json({
          success: false,
          message: "Suspension days must be an integer between 1 and 365",
        });
      }

      if (String(user._id) === String(req.user.id)) {
        return res.status(400).json({
          success: false,
          message: "Admin cannot suspend own account",
        });
      }

      const durationMs = parsedDays * 24 * 60 * 60 * 1000;
      user.suspensionEndsAt = new Date(Date.now() + durationMs);
      user.suspensionReason = String(suspensionReason || "")
        .trim()
        .slice(0, 200);
    }

    if (identityVerificationStatus !== undefined) {
      if (!allowedVerificationStatuses.includes(identityVerificationStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification status",
        });
      }

      if (
        identityVerificationStatus === "verified" &&
        (!user.studentIdCard || !user.nationalIdCard)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Both Student ID and National ID are required before verification",
        });
      }

      if (
        identityVerificationStatus === "pending" &&
        (!user.studentIdCard || !user.nationalIdCard)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Both Student ID and National ID are required before setting pending",
        });
      }

      user.identityVerificationStatus = identityVerificationStatus;
    }

    await user.save();

    return res.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        identityVerificationStatus: user.identityVerificationStatus,
        suspensionEndsAt: user.suspensionEndsAt,
        suspensionReason: user.suspensionReason,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { status = "all", search = "" } = req.query;

    const payments = await paymentModel
      .find(status === "all" ? {} : { status })
      .populate("job", "title")
      .populate("employer", "name email")
      .populate("freelancer", "name email")
      .sort({ createdAt: -1 });

    const normalizedSearch = String(search || "")
      .trim()
      .toLowerCase();

    const filteredPayments = normalizedSearch
      ? payments.filter((payment) => {
          const jobTitle = payment.job?.title || "";
          const employerName = payment.employer?.name || "";
          const employerEmail = payment.employer?.email || "";
          const freelancerName = payment.freelancer?.name || "";
          const freelancerEmail = payment.freelancer?.email || "";

          const searchable = [
            jobTitle,
            employerName,
            employerEmail,
            freelancerName,
            freelancerEmail,
          ]
            .join(" ")
            .toLowerCase();

          return searchable.includes(normalizedSearch);
        })
      : payments;

    return res.json({
      success: true,
      payments: filteredPayments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { status = "all", search = "" } = req.query;

    const statusFilter = {};
    if (status === "open") {
      statusFilter.isClosed = false;
    }
    if (status === "closed") {
      statusFilter.isClosed = true;
    }

    const query = {
      ...statusFilter,
      ...(search
        ? {
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
              { category: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const jobs = await jobModel
      .find(query)
      .populate("company", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminJob = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { jobId } = req.params;

    const job = await jobModel.findById(jobId).select("_id title");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const payments = await paymentModel
      .find({ job: jobId })
      .select("_id application");

    const paymentIds = payments.map((item) => item._id);
    const applicationIdsFromPayments = payments
      .map((item) => item.application)
      .filter(Boolean);

    await Promise.all([
      savedModel.deleteMany({ job: jobId }),
      proposalModel.deleteMany({ job: jobId }),
      applicationModel.deleteMany({
        $or: [{ job: jobId }, { _id: { $in: applicationIdsFromPayments } }],
      }),
      paymentModel.deleteMany({ job: jobId }),
      reviewModel.deleteMany({
        $or: [{ job: jobId }, { payment: { $in: paymentIds } }],
      }),
      jobModel.findByIdAndDelete(jobId),
    ]);

    return res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { userId } = req.params;

    if (String(userId) === String(req.user?.id || "")) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete own account",
      });
    }

    const user = await userModel.findById(userId).select("_id role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Deleting another admin account is not allowed",
      });
    }

    const jobsByUser = await jobModel.find({ company: userId }).select("_id");
    const jobIds = jobsByUser.map((job) => job._id);

    const chatRooms = await chatRoomModel
      .find({ participants: userId })
      .select("_id");
    const roomIds = chatRooms.map((room) => room._id);

    await Promise.all([
      savedModel.deleteMany({
        $or: [{ jobseeker: userId }, { job: { $in: jobIds } }],
      }),
      proposalModel.deleteMany({
        $or: [{ freelancer: userId }, { job: { $in: jobIds } }],
      }),
      applicationModel.deleteMany({
        $or: [{ applicant: userId }, { job: { $in: jobIds } }],
      }),
      paymentModel.deleteMany({
        $or: [
          { employer: userId },
          { freelancer: userId },
          { job: { $in: jobIds } },
        ],
      }),
      reviewModel.deleteMany({
        $or: [
          { reviewer: userId },
          { reviewee: userId },
          { job: { $in: jobIds } },
        ],
      }),
      notificationModel.deleteMany({
        $or: [{ recipient: userId }, { sender: userId }],
      }),
      analyticsModel.deleteMany({ employer: userId }),
      messageModel.updateMany({}, { $pull: { readBy: userId } }),
      roomIds.length
        ? messageModel.deleteMany({ room: { $in: roomIds } })
        : null,
      roomIds.length
        ? chatRoomModel.deleteMany({ _id: { $in: roomIds } })
        : null,
      jobModel.deleteMany({ company: userId }),
      userModel.findByIdAndDelete(userId),
    ]);

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminReports = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const sixMonthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      totalProposals,
      pendingProposals,
      acceptedProposals,
      rejectedProposals,
      totalReviews,
      avgReviewResult,
      completedPayments,
      completedPaymentAmount,
      usersThisMonth,
      usersPreviousMonth,
      jobsThisMonth,
      jobsPreviousMonth,
      paymentsThisMonth,
      paymentsPreviousMonth,
      monthlyUsers,
      monthlyJobs,
      monthlyPayments,
    ] = await Promise.all([
      jobModel.countDocuments({}),
      jobModel.countDocuments({ isClosed: false }),
      jobModel.countDocuments({ isClosed: true }),
      applicationModel.countDocuments({}),
      applicationModel.countDocuments({ status: "Pending" }),
      applicationModel.countDocuments({ status: "Accepted" }),
      applicationModel.countDocuments({ status: "Rejected" }),
      proposalModel.countDocuments({}),
      proposalModel.countDocuments({ status: "pending" }),
      proposalModel.countDocuments({ status: "accepted" }),
      proposalModel.countDocuments({ status: "rejected" }),
      reviewModel.countDocuments({}),
      reviewModel.aggregate([
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]),
      paymentModel.countDocuments({ status: "completed" }),
      paymentModel.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),
      userModel.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      userModel.countDocuments({
        createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
      }),
      jobModel.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      jobModel.countDocuments({
        createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
      }),
      paymentModel.countDocuments({
        status: "completed",
        createdAt: { $gte: currentMonthStart },
      }),
      paymentModel.countDocuments({
        status: "completed",
        createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
      }),
      userModel.aggregate([
        { $match: { createdAt: { $gte: sixMonthStart } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      jobModel.aggregate([
        { $match: { createdAt: { $gte: sixMonthStart } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      paymentModel.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: sixMonthStart },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const monthlyMap = new Map();

    const ensureMonth = (year, month) => {
      const key = `${year}-${month}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          key,
          label: new Date(year, month - 1, 1).toLocaleString("en-US", {
            month: "short",
            year: "numeric",
          }),
          users: 0,
          jobs: 0,
          completedPayments: 0,
        });
      }
      return monthlyMap.get(key);
    };

    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      ensureMonth(date.getFullYear(), date.getMonth() + 1);
    }

    monthlyUsers.forEach((entry) => {
      const target = ensureMonth(entry._id.year, entry._id.month);
      target.users = entry.count;
    });

    monthlyJobs.forEach((entry) => {
      const target = ensureMonth(entry._id.year, entry._id.month);
      target.jobs = entry.count;
    });

    monthlyPayments.forEach((entry) => {
      const target = ensureMonth(entry._id.year, entry._id.month);
      target.completedPayments = entry.count;
    });

    return res.json({
      success: true,
      reports: {
        jobs: {
          total: totalJobs,
          open: openJobs,
          closed: closedJobs,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
        },
        proposals: {
          total: totalProposals,
          pending: pendingProposals,
          accepted: acceptedProposals,
          rejected: rejectedProposals,
        },
        reviews: {
          total: totalReviews,
          averageRating: Number(avgReviewResult?.[0]?.avgRating || 0),
        },
        payments: {
          completedCount: completedPayments,
          completedRevenue: Number(
            completedPaymentAmount?.[0]?.totalAmount || 0,
          ),
        },
        growth: {
          users: {
            thisMonth: usersThisMonth,
            previousMonth: usersPreviousMonth,
          },
          jobs: {
            thisMonth: jobsThisMonth,
            previousMonth: jobsPreviousMonth,
          },
          completedPayments: {
            thisMonth: paymentsThisMonth,
            previousMonth: paymentsPreviousMonth,
          },
        },
        monthlyTrend: Array.from(monthlyMap.values()),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentStatusByAdmin = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { paymentId } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const payment = await paymentModel
      .findByIdAndUpdate(paymentId, { status }, { new: true })
      .populate("job", "title")
      .populate("employer", "name email")
      .populate("freelancer", "name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.json({
      success: true,
      message: "Payment status updated",
      payment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
