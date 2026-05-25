import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
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
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: false,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "esewa", "khalti", "bank_transfer"],
      default: "stripe",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "usd",
    },
    transactionId: {
      type: String,
      default: "",
      index: true,
    },
    stripeSessionId: {
      type: String,
      default: "",
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
      index: true,
    },
    khaltiPidx: {
      type: String,
      default: "",
      index: true,
    },
    khaltiTransactionId: {
      type: String,
      default: "",
      index: true,
    },
  },
  { timestamps: true },
);

paymentSchema.index({ booking: 1 });

const paymentModel =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default paymentModel;
