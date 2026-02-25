import mongoose from "mongoose";

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
      enum: ["Applied", "In Review", "Rejected", "Hired"],
      default: "Applied",
    },

  },
  { timestamps: true },
);

const applicationModel =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
export default applicationModel;
