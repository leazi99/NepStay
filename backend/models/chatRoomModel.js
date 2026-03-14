import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
      default: null,
    },
  },
  { timestamps: true },
);

chatRoomSchema.index({ participants: 1 });

const chatRoomModel =
  mongoose.models.chatRoom || mongoose.model("chatRoom", chatRoomSchema);

export default chatRoomModel;
