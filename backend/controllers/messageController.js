import chatRoomModel from "../models/chatRoomModel.js";
import messageModel from "../models/messageModel.js";
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";

const ONLINE_WINDOW_MS = 90 * 1000;

const toPresencePayload = (user) => {
  const lastSeenAt = user?.lastSeenAt ? new Date(user.lastSeenAt) : null;
  const isOnline =
    lastSeenAt instanceof Date &&
    !Number.isNaN(lastSeenAt.getTime()) &&
    Date.now() - lastSeenAt.getTime() <= ONLINE_WINDOW_MS;

  return {
    isOnline,
    lastSeenAt: lastSeenAt ? lastSeenAt.toISOString() : null,
  };
};

const serializeRoom = (room, currentUserId) => {
  const otherParticipant = room.participants.find(
    (participant) => String(participant._id) !== String(currentUserId),
  );

  return {
    _id: room._id,
    otherParticipant: otherParticipant
      ? {
          _id: otherParticipant._id,
          name: otherParticipant.name,
          email: otherParticipant.email,
          role: otherParticipant.role,
          avatar: otherParticipant.avatar || "",
          ...toPresencePayload(otherParticipant),
        }
      : null,
    lastMessage: room.lastMessage
      ? {
          _id: room.lastMessage._id,
          text: room.lastMessage.text,
          sender: room.lastMessage.sender,
          createdAt: room.lastMessage.createdAt,
        }
      : null,
    updatedAt: room.updatedAt,
  };
};

export const createOrGetRoom = async (req, res) => {
  try {
    const { participantId, participantEmail } = req.body;

    if (!participantId && !participantEmail) {
      return res.json({
        success: false,
        message: "Participant id or email is required",
      });
    }

    const currentUserId = req.user._id;

    const participant = participantId
      ? await userModel.findById(participantId)
      : await userModel.findOne({ email: participantEmail });

    if (!participant) {
      return res.json({
        success: false,
        message: "Participant not found",
      });
    }

    if (String(participant._id) === String(currentUserId)) {
      return res.json({
        success: false,
        message: "You cannot create a chat with yourself",
      });
    }

    let room = await chatRoomModel.findOne({
      participants: { $all: [currentUserId, participant._id], $size: 2 },
    });

    if (!room) {
      room = await chatRoomModel.create({
        participants: [currentUserId, participant._id],
      });
    }

    room = await chatRoomModel
      .findById(room._id)
      .populate("participants", "name email role avatar lastSeenAt")
      .populate("lastMessage", "text sender createdAt");

    return res.json({
      success: true,
      room: serializeRoom(room, currentUserId),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const rooms = await chatRoomModel
      .find({ participants: currentUserId })
      .populate("participants", "name email role avatar lastSeenAt")
      .populate("lastMessage", "text sender createdAt")
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      rooms: rooms.map((room) => serializeRoom(room, currentUserId)),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user._id;

    const room = await chatRoomModel.findById(roomId);
    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    const isParticipant = room.participants.some(
      (participant) => String(participant) === String(currentUserId),
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to access this chat",
      });
    }

    const messages = await messageModel
      .find({ room: roomId })
      .populate("sender", "name email role avatar")
      .sort({ createdAt: 1 });

    await messageModel.updateMany(
      {
        room: roomId,
        sender: { $ne: currentUserId },
        readBy: { $ne: currentUserId },
      },
      { $push: { readBy: currentUserId } },
    );

    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text } = req.body;
    const currentUserId = req.user._id;

    if (!text || !String(text).trim()) {
      return res.json({ success: false, message: "Message text is required" });
    }

    const room = await chatRoomModel
      .findById(roomId)
      .populate("participants", "name email role avatar");
    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    const isParticipant = room.participants.some(
      (participant) => String(participant._id) === String(currentUserId),
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to send message in this chat",
      });
    }

    const message = await messageModel.create({
      room: roomId,
      sender: currentUserId,
      text: String(text).trim(),
      readBy: [currentUserId],
    });

    room.lastMessage = message._id;
    await room.save();

    const recipient = room.participants.find(
      (participant) => String(participant._id) !== String(currentUserId),
    );

    const sender = room.participants.find(
      (participant) => String(participant._id) === String(currentUserId),
    );

    if (recipient) {
      await notificationModel.create({
        recipient: recipient._id,
        sender: currentUserId,
        type: "message",
        title: `New message from ${sender?.name || "User"}`,
        body: String(text).trim().slice(0, 120),
        link: `/messages?roomId=${roomId}`,
      });
    }

    const populatedMessage = await messageModel
      .findById(message._id)
      .populate("sender", "name email role avatar");

    const io = req.app.get("io");
    if (io) {
      const eventPayload = {
        roomId,
        message: populatedMessage,
      };

      io.to(`user:${String(currentUserId)}`).emit("message:new", eventPayload);
      if (recipient?._id) {
        io.to(`user:${String(recipient._id)}`).emit(
          "message:new",
          eventPayload,
        );
      }
    }

    return res.json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
