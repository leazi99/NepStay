import mongoose from "mongoose";

const restaurantOrderSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        notes: { type: String, default: "" },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "preparing", "served", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

restaurantOrderSchema.index({ hotel: 1, createdAt: -1 });
restaurantOrderSchema.index({ booking: 1 });
restaurantOrderSchema.index({ customer: 1, createdAt: -1 });

const restaurantOrderModel =
  mongoose.models.RestaurantOrder ||
  mongoose.model("RestaurantOrder", restaurantOrderSchema);

export default restaurantOrderModel;
