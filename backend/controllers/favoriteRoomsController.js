import favoriteModel from "../models/favoriteModel.js";

export const saveRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.body?.roomId || req.params?.roomId || req.params?.jobId;
    if (!roomId)
      return res
        .status(400)
        .json({ success: false, message: "roomId is required" });
    const fav = await favoriteModel.findOneAndUpdate(
      { user: userId, room: roomId },
      { user: userId, room: roomId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return res.status(201).json({ success: true, favorite: fav });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const unsaveRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const roomId = req.body?.roomId || req.params?.roomId || req.params?.jobId;
    if (!roomId)
      return res
        .status(400)
        .json({ success: false, message: "roomId is required" });
    await favoriteModel.findOneAndDelete({ user: userId, room: roomId });
    return res.json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFavoriteRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await favoriteModel
      .find({ user: userId })
      .populate("room")
      .sort({ createdAt: -1 });
    return res.json({ success: true, favorites });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
