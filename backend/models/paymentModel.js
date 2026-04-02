import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "job",
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "esewa", "khalti"],
      default: "bank_transfer",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    notes: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "npr",
    },
    stripeSessionId: {
      type: String,
      default: "",
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      default: "",
    },
    khaltiPidx: {
      type: String,
      default: "",
      index: true,
    },
    khaltiTransactionId: {
      type: String,
      default: "",
    },
    transactionId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const paymentModel =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default paymentModel;
