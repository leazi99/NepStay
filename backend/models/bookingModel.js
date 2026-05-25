import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      default: 1,
      min: 1,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    couponCode: {
      type: String,
      default: "",
      trim: true,
    },
    qrCheckInToken: {
      type: String,
      default: "",
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ hotel: 1, bookingStatus: 1 });
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1, bookingStatus: 1 });

const bookingModel =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default bookingModel;
