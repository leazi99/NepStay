import mongoose from "mongoose";

const normalizeRole = (value) => {
  if (!value) return "jobseeker";
  const role = String(value).toLowerCase();
  if (role === "jobseeker" || role === "freelancer") return "jobseeker";
  if (role === "employer" || role === "client") return "employer";
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
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["jobseeker", "employer"],
    default: "jobseeker",
    required: true,
    set: normalizeRole,
  },
  avatar: {
    type: String,
    default: "",
  },
  resume: String,
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
});

userSchema.pre("validate", function () {
  this.role = normalizeRole(this.role);
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
