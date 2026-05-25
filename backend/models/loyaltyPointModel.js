import mongoose from "mongoose";

const loyaltyPointSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      default: null,
    },
    pointsBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    lifetimePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    lastEarnedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

loyaltyPointSchema.index({ user: 1, hotel: 1 }, { unique: true });

const loyaltyPointModel =
  mongoose.models.LoyaltyPoint ||
  mongoose.model("LoyaltyPoint", loyaltyPointSchema);

export default loyaltyPointModel;
