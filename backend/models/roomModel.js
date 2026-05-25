import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    roomType: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "standard",
        "deluxe",
        "suite",
        "vip-suite",
        "family",
        "presidential",
      ],
    },
    roomCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomCategory",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["available", "booked", "occupied", "maintenance"],
      default: "available",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ status: 1 });
roomSchema.index({ roomType: 1 });

const roomModel = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default roomModel;
