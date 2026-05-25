import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  },
  { timestamps: true },
);

favoriteSchema.index({ user: 1, room: 1 }, { unique: true });

const favoriteModel =
  mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);

export default favoriteModel;
