import mongoose from "mongoose";

const normalizeApplicationStatus = (value) => {
  if (!value) return "Pending";
  const status = String(value).trim().toLowerCase();

  if (status === "applied" || status === "in review" || status === "pending") {
    return "Pending";
  }

  if (status === "accepted" || status === "hired") {
    return "Accepted";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return value;
};

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Applied",
        "In Review",
        "Hired",
      ],
      default: "Pending",
      set: normalizeApplicationStatus,
    },
  },
  { timestamps: true },
);

applicationSchema.pre("validate", function () {
  this.status = normalizeApplicationStatus(this.status);
});

const applicationModel =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
export default applicationModel;
