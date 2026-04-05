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

const parseInterests = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
        resume: user.resume || "",
        studentIdCard: user.studentIdCard || "",
        nationalIdCard: user.nationalIdCard || "",
        studentInstitutionName: user.studentInstitutionName || "",
        studentFullName: user.studentFullName || "",
        studentDateOfBirth: user.studentDateOfBirth || "",
        studentIdNumber: user.studentIdNumber || "",
        studentContactEmail: user.studentContactEmail || "",
        studentPhoneNumber: user.studentPhoneNumber || "",
        studentAddressLine1: user.studentAddressLine1 || "",
        studentAddressLine2: user.studentAddressLine2 || "",
        studentCity: user.studentCity || "",
        studentStateProvince: user.studentStateProvince || "",
        studentPostalCode: user.studentPostalCode || "",
        identityVerificationStatus:
          user.identityVerificationStatus || "not_submitted",
        linkedinUrl: user.linkedinUrl || "",
        bio: user.bio || "",
        interests: user.interests || [],
        latestEducation: user.latestEducation || "",
        specialization: user.specialization || "",
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
    const {
      name,
      avatar,
      companyName,
      companyDescription,
      companyLogo,
      resume,
      studentIdCard,
      nationalIdCard,
      studentInstitutionName,
      studentFullName,
      studentDateOfBirth,
      studentIdNumber,
      studentContactEmail,
      studentPhoneNumber,
      studentAddressLine1,
      studentAddressLine2,
      studentCity,
      studentStateProvince,
      studentPostalCode,
      linkedinUrl,
      bio,
      interests,
      latestEducation,
      specialization,
      themePreference,
    } = req.body;

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (typeof name === "string") user.name = name.trim() || user.name;
    if (typeof avatar === "string") user.avatar = avatar;
    if (typeof resume === "string") user.resume = resume;
    if (typeof studentIdCard === "string") user.studentIdCard = studentIdCard;
    if (typeof nationalIdCard === "string")
      user.nationalIdCard = nationalIdCard;
    if (typeof linkedinUrl === "string") user.linkedinUrl = linkedinUrl.trim();
    if (typeof bio === "string") user.bio = bio.trim();
    if (interests !== undefined) user.interests = parseInterests(interests);
    if (typeof latestEducation === "string") {
      user.latestEducation = latestEducation.trim();
    }
    if (typeof specialization === "string") {
      user.specialization = specialization.trim();
    }
    if (typeof studentInstitutionName === "string") {
      user.studentInstitutionName = studentInstitutionName.trim();
    }
    if (typeof studentFullName === "string") {
      user.studentFullName = studentFullName.trim();
    }
    if (typeof studentDateOfBirth === "string") {
      user.studentDateOfBirth = studentDateOfBirth.trim();
    }
    if (typeof studentIdNumber === "string") {
      user.studentIdNumber = studentIdNumber.trim();
    }
    if (typeof studentContactEmail === "string") {
      user.studentContactEmail = studentContactEmail.trim();
    }
    if (typeof studentPhoneNumber === "string") {
      user.studentPhoneNumber = studentPhoneNumber.trim();
    }
    if (typeof studentAddressLine1 === "string") {
      user.studentAddressLine1 = studentAddressLine1.trim();
    }
    if (typeof studentAddressLine2 === "string") {
      user.studentAddressLine2 = studentAddressLine2.trim();
    }
    if (typeof studentCity === "string") {
      user.studentCity = studentCity.trim();
    }
    if (typeof studentStateProvince === "string") {
      user.studentStateProvince = studentStateProvince.trim();
    }
    if (typeof studentPostalCode === "string") {
      user.studentPostalCode = studentPostalCode.trim();
    }

    if (user.identityVerificationStatus !== "verified") {
      if (user.studentIdCard && user.nationalIdCard) {
        user.identityVerificationStatus = "pending";
      } else {
        user.identityVerificationStatus = "not_submitted";
      }
    }

    if (themePreference === "light" || themePreference === "dark") {
      user.themePreference = themePreference;
    }

    if (user.role === "employer") {
      if (typeof companyName === "string") user.companyName = companyName;
      if (typeof companyDescription === "string") {
        user.companyDescription = companyDescription;
      }
      if (typeof companyLogo === "string") user.companyLogo = companyLogo;
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
        resume: user.resume || "",
        studentIdCard: user.studentIdCard || "",
        nationalIdCard: user.nationalIdCard || "",
        studentInstitutionName: user.studentInstitutionName || "",
        studentFullName: user.studentFullName || "",
        studentDateOfBirth: user.studentDateOfBirth || "",
        studentIdNumber: user.studentIdNumber || "",
        studentContactEmail: user.studentContactEmail || "",
        studentPhoneNumber: user.studentPhoneNumber || "",
        studentAddressLine1: user.studentAddressLine1 || "",
        studentAddressLine2: user.studentAddressLine2 || "",
        studentCity: user.studentCity || "",
        studentStateProvince: user.studentStateProvince || "",
        studentPostalCode: user.studentPostalCode || "",
        identityVerificationStatus:
          user.identityVerificationStatus || "not_submitted",
        linkedinUrl: user.linkedinUrl || "",
        bio: user.bio || "",
        interests: user.interests || [],
        latestEducation: user.latestEducation || "",
        specialization: user.specialization || "",
        themePreference: user.themePreference || "light",
        companyName: user.companyName || "",
        companyDescription: user.companyDescription || "",
        companyLogo: user.companyLogo || "",
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
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.resume = "";
    await user.save();

    return res.json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select("-password -studentIdCard -nationalIdCard");

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
        .populate("employer", "name companyName")
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
          name:
            payment.employer?.companyName ||
            payment.employer?.name ||
            "Employer",
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
        { companyName: { $regex: queryText, $options: "i" } },
      ];
    }

    if (["jobseeker", "employer", "admin"].includes(roleFilter)) {
      filter.role = roleFilter;
    }

    const users = await userModel
      .find(filter)
      .select("name email role avatar companyName lastSeenAt")
      .sort({ name: 1 })
      .limit(limit);

    const usersWithPresence = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      companyName: user.companyName || "",
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
