import roomModel from "../models/roomModel.js";
import hotelModel from "../models/hotelModel.js";

const ensureStaffOrAdmin = (req, res) => {
  const role = req.user?.role;
  if (role !== "hotelstaff" && role !== "admin") {
    res.status(403).json({ success: false, message: "Forbidden" });
    return false;
  }
  return true;
};

export const createRoom = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;

    const {
      hotel,
      roomNumber,
      roomType,
      title,
      description,
      pricePerNight,
      capacity,
      amenities,
      images,
      roomCategory,
    } = req.body;

    if (!hotel || !roomNumber || !roomType || !title || !pricePerNight) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const existing = await roomModel.findOne({ hotel, roomNumber });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Room number already exists for this hotel",
        });
    }

    const room = await roomModel.create({
      hotel,
      roomNumber,
      roomType,
      roomCategory: roomCategory || null,
      title,
      description: description || "",
      pricePerNight,
      capacity: capacity || 1,
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
    });

    return res.json({ success: true, room });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const {
      hotel,
      roomType,
      status,
      search = "",
      page = 1,
      perPage = 20,
    } = req.query;
    const q = {};
    if (hotel) q.hotel = hotel;
    if (roomType) q.roomType = roomType;
    if (status) q.status = status;
    if (search) {
      q.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Math.max(Number(page), 1) - 1) * Number(perPage || 20);

    const [rooms, total] = await Promise.all([
      roomModel
        .find(q)
        .populate("hotel", "name address")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(perPage)),
      roomModel.countDocuments(q),
    ]);

    return res.json({ success: true, rooms, total });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await roomModel
      .findById(id)
      .populate("hotel", "name address manager");
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    return res.json({ success: true, room });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;
    const { id } = req.params;
    const updates = req.body || {};
    const room = await roomModel.findByIdAndUpdate(id, updates, { new: true });
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    return res.json({ success: true, room });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;
    const { id } = req.params;
    const room = await roomModel.findByIdAndDelete(id);
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    return res.json({ success: true, message: "Room deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleCloseRoom = async (req, res) => {
  try {
    if (!ensureStaffOrAdmin(req, res)) return;
    const { id } = req.params;
    const room = await roomModel.findById(id);
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    room.isActive = !room.isActive;
    await room.save();
    return res.json({ success: true, room });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomsByStaff = async (req, res) => {
  try {
    const staffId = req.user?.id;
    if (!staffId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const hotels = await hotelModel.find({ manager: staffId }).select("_id");
    const hotelIds = hotels.map((h) => h._id);
    const rooms = await roomModel
      .find({ hotel: { $in: hotelIds } })
      .populate("hotel", "name")
      .sort({ createdAt: -1 });
    return res.json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
