import userModel from "../models/userModel.js";
import paymentModel from "../models/paymentModel.js";

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
        "name email role avatar isVerified createdAt studentIdCard nationalIdCard identityVerificationStatus",
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
    const { role, identityVerificationStatus } = req.body;

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

    if (identityVerificationStatus !== undefined) {
      if (!allowedVerificationStatuses.includes(identityVerificationStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification status",
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
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { status = "all" } = req.query;

    const payments = await paymentModel
      .find(status === "all" ? {} : { status })
      .populate("job", "title")
      .populate("employer", "name email")
      .populate("freelancer", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      payments,
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
