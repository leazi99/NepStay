import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema(
  {
    jobseeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "job",
      required: true,
    },
  },

  { timestamps: true },
);

const savedModel = mongoose.models.SavedJob || mongoose.model("SavedJob", savedJobSchema);
export default savedModel;
