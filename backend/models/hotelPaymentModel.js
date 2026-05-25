import mongoose from "mongoose";

const hotelPaymentSchema = new mongoose.Schema(
  {
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
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "npr",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "khalti", "esewa", "cash"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
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
    esewaRefId: {
      type: String,
      default: "",
    },
    transactionId: {
      type: String,
      default: "",
    },
    invoiceNumber: {
      type: String,
      default: "",
      unique: true,
      sparse: true,
    },
    notes: {
      type: String,
      default: "",
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Indexes as specified in requirements
hotelPaymentSchema.index({ booking: 1 }, { unique: true });
hotelPaymentSchema.index({ customer: 1, createdAt: -1 });
hotelPaymentSchema.index({ khaltiPidx: 1 });
hotelPaymentSchema.index({ stripeSessionId: 1 });

// Pre-save hook to auto-generate invoice number in format INV-{year}-{sequence}
hotelPaymentSchema.pre("save", async function (next) {
  if (this.isNew && !this.invoiceNumber && this.status === "paid") {
    try {
      const currentYear = new Date().getFullYear();
      const prefix = `INV-${currentYear}-`;

      // Find the last invoice number for the current year
      const lastPayment = await mongoose
        .model("HotelPayment")
        .findOne({
          invoiceNumber: { $regex: `^${prefix}` },
        })
        .sort({ invoiceNumber: -1 })
        .select("invoiceNumber")
        .lean();

      let sequence = 1;
      if (lastPayment && lastPayment.invoiceNumber) {
        const lastSequence = parseInt(
          lastPayment.invoiceNumber.replace(prefix, ""),
          10,
        );
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }

      // Pad sequence with leading zeros (e.g., 0001, 0002, etc.)
      this.invoiceNumber = `${prefix}${String(sequence).padStart(4, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const hotelPaymentModel =
  mongoose.models.HotelPayment ||
  mongoose.model("HotelPayment", hotelPaymentSchema);

export default hotelPaymentModel;
