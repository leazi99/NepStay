import mongoose from "mongoose";

const hotelReviewSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    criteria: {
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      service: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comfort: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
    },
    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 140,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    images: {
      type: [String],
      default: [],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

hotelReviewSchema.index({ hotel: 1, customer: 1 });
hotelReviewSchema.index({ hotel: 1, createdAt: -1 });
hotelReviewSchema.index({ booking: 1 }, { unique: true });

const hotelReviewModel =
  mongoose.models.HotelReview ||
  mongoose.model("HotelReview", hotelReviewSchema);

export default hotelReviewModel;
