import mongoose from "mongoose";

const activityHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      default: "",
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    summary: {
      type: String,
      default: "",
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true },
);

activityHistorySchema.index({ user: 1, createdAt: -1 });
activityHistorySchema.index({ entityType: 1, entityId: 1 });

const activityHistoryModel =
  mongoose.models.ActivityHistory ||
  mongoose.model("ActivityHistory", activityHistorySchema);

export default activityHistoryModel;
