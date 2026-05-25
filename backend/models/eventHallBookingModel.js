import mongoose from "mongoose";

const eventHallBookingSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hallName: {
      type: String,
      required: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      default: "",
    },
    endTime: {
      type: String,
      default: "",
    },
    guestCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

eventHallBookingSchema.index({ hotel: 1, eventDate: -1 });
eventHallBookingSchema.index({ customer: 1, eventDate: -1 });

const eventHallBookingModel =
  mongoose.models.EventHallBooking ||
  mongoose.model("EventHallBooking", eventHallBookingSchema);

export default eventHallBookingModel;
