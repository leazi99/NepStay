import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "job",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ["employer", "freelancer"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    publicTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 140,
    },
    criteria: {
      quality: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      deadline: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      collaboration: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
    },
    privateFeedback: {
      recommendAgain: {
        type: Boolean,
        default: null,
      },
      privateComment: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      cooperation: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
    },
    isPublicVisible: {
      type: Boolean,
      default: false,
    },
    publicVisibleAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

reviewSchema.index({ payment: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ payment: 1, isPublicVisible: 1 });

const reviewModel =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default reviewModel;
