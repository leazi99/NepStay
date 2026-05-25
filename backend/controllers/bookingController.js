import bookingModel from "../models/bookingModel.js";
import roomModel from "../models/roomModel.js";

const isStaffOrAdmin = (req) =>
  req.user && (req.user.role === "hotelstaff" || req.user.role === "admin");

export const createBookingRequest = async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      roomId,
      hotelId,
      checkInDate,
      checkOutDate,
      guests = 1,
      notes = "",
    } = req.body;

    if (!roomId || !hotelId || !checkInDate || !checkOutDate) {
      return res
        .status(400)
        .json({
          success: false,
          message: "roomId, hotelId, checkInDate and checkOutDate are required",
        });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (isNaN(checkIn) || isNaN(checkOut) || checkOut <= checkIn) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid check-in/check-out dates" });
    }

    const room = await roomModel.findById(roomId);
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    if (guests > room.capacity)
      return res
        .status(400)
        .json({ success: false, message: "Guests exceed room capacity" });

    // check availability: any non-cancelled booking overlapping dates
    const overlapping = await bookingModel.findOne({
      room: roomId,
      bookingStatus: { $ne: "cancelled" },
      $or: [{ checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }],
    });
    if (overlapping)
      return res
        .status(409)
        .json({
          success: false,
          message: "Room is not available for selected dates",
        });

    const nights = Math.max(
      1,
      Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
    );
    const totalAmount = nights * (room.pricePerNight || 0);

    const booking = await bookingModel.create({
      customer: customerId,
      hotel: hotelId,
      room: roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      totalAmount,
      notes,
      bookingStatus: "confirmed",
      paymentStatus: "pending",
    });

    return res.status(201).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const customerId = req.user.id;
    const bookings = await bookingModel
      .find({ customer: customerId })
      .sort({ createdAt: -1 })
      .populate("room")
      .populate("hotel");
    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingsForRoom = async (req, res) => {
  try {
    // route may use param name jobId from legacy routes; accept both
    const roomId = req.params.roomId || req.params.jobId;
    if (!roomId)
      return res
        .status(400)
        .json({ success: false, message: "Room id is required" });
    // only staff/admin or the customer may view (for simplicity allow staff/admin)
    if (!isStaffOrAdmin(req))
      return res.status(403).json({ success: false, message: "Forbidden" });
    const bookings = await bookingModel
      .find({ room: roomId })
      .sort({ createdAt: -1 })
      .populate("customer", "name email");
    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const id = req.params.id;
    const booking = await bookingModel
      .findById(id)
      .populate("room")
      .populate("hotel")
      .populate("customer", "name email");
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    // allow owner, hotelstaff, or admin
    if (String(booking.customer._id) !== req.user.id && !isStaffOrAdmin(req))
      return res.status(403).json({ success: false, message: "Forbidden" });
    return res.json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { bookingStatus } = req.body;
    if (!bookingStatus)
      return res
        .status(400)
        .json({ success: false, message: "bookingStatus is required" });
    // only staff/admin can change status (customers can cancel via a different endpoint)
    if (!isStaffOrAdmin(req))
      return res.status(403).json({ success: false, message: "Forbidden" });
    const booking = await bookingModel.findByIdAndUpdate(
      id,
      { bookingStatus },
      { new: true },
    );
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    return res.json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
