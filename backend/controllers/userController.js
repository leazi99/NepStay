import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import paymentModel from "../models/paymentModel.js";

const ONLINE_WINDOW_MS = 90 * 1000;

const toPresencePayload = (user) => {
  const lastSeenAt = user?.lastSeenAt ? new Date(user.lastSeenAt) : null;
  const isOnline =
    lastSeenAt instanceof Date &&
    !Number.isNaN(lastSeenAt.getTime()) &&
    Date.now() - lastSeenAt.getTime() <= ONLINE_WINDOW_MS;

  return {
    isOnline,
    lastSeenAt: lastSeenAt ? lastSeenAt.toISOString() : null,
  };
};

export const getAllUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        themePreference: user.themePreference || "light",
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, themePreference } = req.body;

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (typeof name === "string") user.name = name.trim() || user.name;
    if (typeof avatar === "string") user.avatar = avatar;

    if (themePreference === "light" || themePreference === "dark") {
      user.themePreference = themePreference;
    }

    await user.save();

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        themePreference: user.themePreference || "light",
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteResume = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: "Resume profile storage has been removed.",
  });
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let completedProjects = [];
    if (user.role === "jobseeker") {
      const payments = await paymentModel
        .find({ freelancer: user._id, status: "completed" })
        .populate("job", "title")
        .populate("employer", "name")
        .sort({ updatedAt: -1 });

      completedProjects = payments.map((payment) => ({
        _id: payment._id,
        amount: payment.amount,
        currency: payment.currency || "npr",
        completedAt: payment.updatedAt || payment.createdAt,
        job: {
          _id: payment.job?._id,
          title: payment.job?.title || "Untitled Project",
        },
        employer: {
          _id: payment.employer?._id,
          name: payment.employer?.name || "Employer",
        },
      }));
    }

    return res.json({
      success: true,
      user,
      completedProjects,
      completedProjectsCount: completedProjects.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchUsersForChat = async (req, res) => {
  try {
    const queryText = String(req.query.query || "").trim();
    const roleFilter = String(req.query.role || "")
      .trim()
      .toLowerCase();
    const limit = Math.min(Math.max(Number(req.query.limit) || 15, 1), 50);

    const filter = {
      _id: { $ne: req.user._id },
    };

    if (queryText) {
      filter.$or = [
        { name: { $regex: queryText, $options: "i" } },
        { email: { $regex: queryText, $options: "i" } },
      ];
    }

    if (["jobseeker", "employer", "admin"].includes(roleFilter)) {
      filter.role = roleFilter;
    }

    const users = await userModel
      .find(filter)
      .select("name email role avatar lastSeenAt")
      .sort({ name: 1 })
      .limit(limit);

    const usersWithPresence = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      ...toPresencePayload(user),
    }));

    return res.json({
      success: true,
      users: usersWithPresence,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const pingPresence = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.user._id, {
      $set: { lastSeenAt: new Date() },
    });

    return res.json({
      success: true,
      message: "Presence updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
