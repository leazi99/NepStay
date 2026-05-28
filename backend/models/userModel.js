import mongoose from "mongoose";

const normalizeRole = (value) => {
  if (!value) return "customer";
  const role = String(value).toLowerCase();
  if (role === "employer" || role === "customer" || role === "staff") {
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
