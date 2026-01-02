import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const companyModel =
  mongoose.models.company || mongoose.model("company", companySchema);

export default companyModel;
