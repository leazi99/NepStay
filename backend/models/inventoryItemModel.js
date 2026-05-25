import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    quantityOnHand: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: "unit",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

inventoryItemSchema.index({ hotel: 1, sku: 1 }, { unique: true });
inventoryItemSchema.index({ hotel: 1, category: 1 });

const inventoryItemModel =
  mongoose.models.InventoryItem ||
  mongoose.model("InventoryItem", inventoryItemSchema);

export default inventoryItemModel;
