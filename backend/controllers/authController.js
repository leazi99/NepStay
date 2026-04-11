import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const normalizeAuthRole = (role) => {
  const value = String(role || "")
    .toLowerCase()
    .trim();
  if (value === "freelancer" || value === "jobseeker") return "jobseeker";
  if (value === "client" || value === "employer") return "employer";
  if (value === "admin") return "admin";
  return value;
};

const buildAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSiteFromEnv = String(process.env.COOKIE_SAME_SITE || "").trim();
  const cookieDomain = String(process.env.COOKIE_DOMAIN || "").trim();

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSiteFromEnv || (isProduction ? "none" : "lax"),
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  };

  if (cookieDomain) {
    cookieOptions.domain = cookieDomain;
  }

  return cookieOptions;
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, buildAuthCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie("token", buildAuthCookieOptions());
};

const getSuspensionEndTs = (user) => {
  if (!user?.suspensionEndsAt) return 0;
  const timestamp = new Date(user.suspensionEndsAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const isUserSuspended = (user) => getSuspensionEndTs(user) > Date.now();

const getSuspensionMessage = (user) => {
  const endTimestamp = getSuspensionEndTs(user);
  if (!endTimestamp) return "Your account is currently suspended.";

  return `Your account is suspended until ${new Date(endTimestamp).toLocaleString()}.`;
};

const enforceSuspension = (res, user) => {
  if (!isUserSuspended(user)) return false;

  clearAuthCookie(res);
  return res.status(403).json({
    success: false,
    suspended: true,
    message: getSuspensionMessage(user),
    suspensionEndsAt: user.suspensionEndsAt,
    suspensionReason: user.suspensionReason || "",
  });
};

const getPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  avatar: user.avatar || "",
  companyName: user.companyName || "",
  companyDescription: user.companyDescription || "",
  companyLogo: user.companyLogo || "",
  resume: user.resume || "",
  studentIdCard: user.studentIdCard || "",
  nationalIdCard: user.nationalIdCard || "",
  identityVerificationStatus:
    user.identityVerificationStatus || "not_submitted",
  linkedinUrl: user.linkedinUrl || "",
  bio: user.bio || "",
  interests: user.interests || [],
  latestEducation: user.latestEducation || "",
  specialization: user.specialization || "",
  themePreference: user.themePreference || "light",
  suspensionEndsAt: user.suspensionEndsAt || null,
  suspensionReason: user.suspensionReason || "",
});

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.json({
      success: false,
      message: "All fields are required",
    });
  }
  try {
    const normalizedEmail = normalizeEmail(email);

    const normalizedRole = normalizeAuthRole(role);

    if (!["jobseeker", "employer"].includes(normalizedRole)) {
      return res.json({
        success: false,
        message: "Invalid role",
      });
    }

    const existingUser = await userModel.findOne({
      email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
    });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    setAuthCookie(res, token);

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: normalizedEmail,
      subject: "Verify your KaamSathi account",
      text: `Hello ${name}, your OTP for email verification is ${otp}. It is valid for 1 hour.`,
    };

    await transporter.sendMail(mailOption);
    return res.json({
      success: true,
      message:
        "Registered successfully. Please verify your email before login.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        studentIdCard: user.studentIdCard || "",
        nationalIdCard: user.nationalIdCard || "",
        identityVerificationStatus:
          user.identityVerificationStatus || "not_submitted",
        linkedinUrl: user.linkedinUrl || "",
        bio: user.bio || "",
        interests: user.interests || [],
        latestEducation: user.latestEducation || "",
        specialization: user.specialization || "",
        themePreference: user.themePreference || "light",
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required",
    });
  }
  try {
    const normalizedEmail = normalizeEmail(email);

    const user = await userModel.findOne({
      email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
    });
    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid Password",
      });
    }

    if (!user.isVerified) {
      return res.json({
        success: false,
        requiresVerification: true,
        message: "Please verify your email before login",
        email: user.email,
      });
    }

    if (isUserSuspended(user)) {
      clearAuthCookie(res);
      return res.status(403).json({
        success: false,
        suspended: true,
        message: getSuspensionMessage(user),
        suspensionEndsAt: user.suspensionEndsAt,
        suspensionReason: user.suspensionReason || "",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    setAuthCookie(res, token);
    return res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        _id: user._id,

        name: user.name,
        email: user.email,

        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar || "",
        companyName: user.companyName || "",
        companyDescription: user.companyDescription || "",
        companyLogo: user.companyLogo || "",
        resume: user.resume || "",
        studentIdCard: user.studentIdCard || "",
        nationalIdCard: user.nationalIdCard || "",
        identityVerificationStatus:
          user.identityVerificationStatus || "not_submitted",
        linkedinUrl: user.linkedinUrl || "",
        bio: user.bio || "",
        interests: user.interests || [],
        latestEducation: user.latestEducation || "",
        specialization: user.specialization || "",
        themePreference: user.themePreference || "light",
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    clearAuthCookie(res);
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId, email } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = userId
      ? await userModel.findById(userId)
      : await userModel.findOne({
          email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
        });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: false,
        message: "User is already verified",
      });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 60 * 60 * 1000;

    await user.save();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP ",
      text: `Your OTP for account verification is ${otp}.Verify your account within 1 hour.`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "Verification OTP sent successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, email, otp } = req.body;
  if ((!userId && !email) || !otp) {
    return res.json({
      success: false,
      message: "Email/UserId and OTP are required",
    });
  }
  try {
    const normalizedEmail = normalizeEmail(email);
    const user = userId
      ? await userModel.findById(userId)
      : await userModel.findOne({
          email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
        });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP is Invalid or Expired",
      });
    }
    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select(
        "_id name email role isVerified avatar companyName companyDescription companyLogo resume studentIdCard nationalIdCard identityVerificationStatus linkedinUrl bio interests latestEducation specialization themePreference",
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const suspendedResponse = enforceSuspension(res, user);
    if (suspendedResponse) {
      return suspendedResponse;
    }

    return res.json({
      success: true,
      message: "User is authenticated",
      user,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getSession = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select(
        "_id name email role isVerified avatar companyName companyDescription companyLogo resume studentIdCard nationalIdCard identityVerificationStatus linkedinUrl bio interests latestEducation specialization themePreference",
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const suspendedResponse = enforceSuspension(res, user);
    if (suspendedResponse) {
      return suspendedResponse;
    }

    const expiresAt = req.user?.exp ? req.user.exp * 1000 : null;
    const expiresInSeconds = req.user?.exp
      ? Math.max(req.user.exp - Math.floor(Date.now() / 1000), 0)
      : null;

    return res.json({
      success: true,
      message: "Session is active",
      session: {
        expiresAt,
        expiresInSeconds,
      },
      user: getPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const refreshSession = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const suspendedResponse = enforceSuspension(res, user);
    if (suspendedResponse) {
      return suspendedResponse;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    setAuthCookie(res, token);

    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? decoded.exp * 1000 : null;
    const expiresInSeconds = decoded?.exp
      ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 0)
      : null;

    return res.json({
      success: true,
      message: "Session refreshed successfully",
      token,
      session: {
        expiresAt,
        expiresInSeconds,
      },
      user: getPublicUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//send password reset otp

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({
      success: false,
      message: "Email is required",
    });
  }
  try {
    const normalizedEmail = normalizeEmail(email);
    const user = await userModel.findOne({
      email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
    });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset  OTP ",
      text: `Your Password reset  OTP  is ${otp}.Use this OTP to reset your password .`,
    };
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Reset OTP sent to your email",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//Reset User Password

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({
      success: false,
      message: "All fields are required",
    });
  }
  try {
    const normalizedEmail = normalizeEmail(email);
    const user = await userModel.findOne({
      email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
    });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP is invalid or expired",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
