import mongoose from "mongoose";

export const locationModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true },
);

export const Location = mongoose.model("Location", locationModel);
