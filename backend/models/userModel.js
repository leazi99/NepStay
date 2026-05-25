import mongoose from "mongoose";

const normalizeRole = (value) => {
  if (!value) return "customer";
  const role = String(value).toLowerCase();
  if (role === "jobseeker" || role === "freelancer" || role === "guest") {
    return "customer";
  }
  if (
    role === "employer" ||
    role === "client" ||
    role === "staff" ||
    role === "vendor"
  ) {
    return "hotelstaff";
  }
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
    enum: ["customer", "hotelstaff", "admin"],
    default: "customer",
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
  studentInstitutionName: {
    type: String,
    default: "",
  },
  studentFullName: {
    type: String,
    default: "",
  },
  studentDateOfBirth: {
    type: String,
    default: "",
  },
  studentIdNumber: {
    type: String,
    default: "",
  },
  studentContactEmail: {
    type: String,
    default: "",
  },
  studentPhoneNumber: {
    type: String,
    default: "",
  },
  studentAddressLine1: {
    type: String,
    default: "",
  },
  studentAddressLine2: {
    type: String,
    default: "",
  },
  studentCity: {
    type: String,
    default: "",
  },
  studentStateProvince: {
    type: String,
    default: "",
  },
  studentPostalCode: {
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
  suspensionEndsAt: {
    type: Date,
    default: null,
  },
  suspensionReason: {
    type: String,
    default: "",
    trim: true,
  },
  companyName: String,
  companyDescription: String,
  companyLogo: String,
  companyWebsite: {
    type: String,
    default: "",
  },
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
