import mongoose from "mongoose";

const normalizeRole = (value) => {
  if (!value) return "jobseeker";
  const role = String(value).toLowerCase();
  if (role === "jobseeker" || role === "freelancer") return "jobseeker";
  if (role === "employer" || role === "client") return "employer";
  if (role === "admin") return "admin";
  return role;
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["jobseeker", "employer", "admin"],
    default: "jobseeker",
    required: true,
    set: normalizeRole,
  },
  avatar: {
    type: String,
    default: "",
  },
  resume: String,
  studentIdCard: {
    type: String,
    default: "",
  },
  nationalIdCard: {
    type: String,
    default: "",
  },
  identityVerificationStatus: {
    type: String,
    enum: ["not_submitted", "pending", "verified", "rejected"],
    default: "not_submitted",
  },
  linkedinUrl: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  interests: {
    type: [String],
    default: [],
  },
  latestEducation: {
    type: String,
    default: "",
  },
  specialization: {
    type: String,
    default: "",
  },
  themePreference: {
    type: String,
    enum: ["light", "dark"],
    default: "light",
  },
  companyName: String,
  companyDescription: String,
  companyLogo: String,
  verifyOtp: {
    type: String,
    default: "",
  },
  verifyOtpExpireAt: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetOtp: {
    type: String,
    default: "",
  },
  resetOtpExpireAt: {
    type: Number,
    default: 0,
  },
  lastSeenAt: {
    type: Date,
    default: null,
  },
});

userSchema.pre("validate", function () {
  this.role = normalizeRole(this.role);
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
