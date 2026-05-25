import mongoose from "mongoose";

const localizationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    locale: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    namespace: {
      type: String,
      default: "common",
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

localizationSchema.index({ key: 1, locale: 1, namespace: 1 }, { unique: true });

const localizationModel =
  mongoose.models.Localization ||
  mongoose.model("Localization", localizationSchema);

export default localizationModel;
