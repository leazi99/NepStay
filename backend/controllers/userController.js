import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";

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
        linkedinUrl: user.linkedinUrl || "",
        bio: user.bio || "",
        interests: user.interests || [],
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
      linkedinUrl,
      bio,
      interests,
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
    if (typeof linkedinUrl === "string") user.linkedinUrl = linkedinUrl.trim();
    if (typeof bio === "string") user.bio = bio.trim();
    if (interests !== undefined) user.interests = parseInterests(interests);

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
        linkedinUrl: user.linkedinUrl || "",
        bio: user.bio || "",
        interests: user.interests || [],
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
    const user = await userModel.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
