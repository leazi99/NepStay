import mongoose from "mongoose";

const aiRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["room", "hotel", "offer", "activity"],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    explanation: {
      type: String,
      default: "",
    },
    context: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

aiRecommendationSchema.index({ user: 1, type: 1, createdAt: -1 });

const aiRecommendationModel =
  mongoose.models.AiRecommendation ||
  mongoose.model("AiRecommendation", aiRecommendationSchema);

export default aiRecommendationModel;
