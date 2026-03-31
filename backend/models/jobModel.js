import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      trim: true,
    },
    jobLocationLower: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      enum: ["Remote", "Full-Time", "Part-Time", "Internship", "Contract"],
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    salaryMin: {
      type: Number,
      required: true,
    },
    salaryMax: {
      type: Number,
      required: true,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: String,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

jobSchema.index({ jobLocation: 1 });
jobSchema.index({ jobLocationLower: 1 });

jobSchema.pre("save", function () {
  if (this.isModified("jobLocation")) {
    const normalized = String(this.jobLocation || "").trim();
    this.jobLocationLower = normalized ? normalized.toLowerCase() : undefined;
  }
});

const jobModel = mongoose.models.job || mongoose.model("job", jobSchema);

export default jobModel;
