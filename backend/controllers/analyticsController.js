import hotelModel from "../models/hotelModel.js";
import roomModel from "../models/roomModel.js";
import bookingModel from "../models/bookingModel.js";
import paymentModel from "../models/paymentModel.js";

const getTrend = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const getHotelAnalytics = async (req, res) => {
  try {
    const role = String(req.user.role || "").toLowerCase();
    if (role !== "hotelstaff" && role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const managerId = req.user.id;
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    const prev7Days = new Date(now);
    prev7Days.setDate(now.getDate() - 14);

    const hotels = await hotelModel.find({ manager: managerId }).select("_id");
    const hotelIds = hotels.map((h) => h._id);

    const totalRooms = await roomModel.countDocuments({
      hotel: { $in: hotelIds },
    });
    const totalBookings = await bookingModel.countDocuments({
      hotel: { $in: hotelIds },
    });
    const bookingsLast7 = await bookingModel.countDocuments({
      hotel: { $in: hotelIds },
      createdAt: { $gte: last7Days, $lte: now },
    });
    const bookingsPrev7 = await bookingModel.countDocuments({
      hotel: { $in: hotelIds },
      createdAt: { $gte: prev7Days, $lte: last7Days },
    });

    const bookingTrend = getTrend(bookingsLast7, bookingsPrev7);

    const completedPayments = await paymentModel.countDocuments({
      hotel: { $in: hotelIds },
      status: "completed",
    });
    const revenueAgg = await paymentModel.aggregate([
      { $match: { hotel: { $in: hotelIds }, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = Number(revenueAgg?.[0]?.total || 0);

    const recentBookings = await bookingModel
      .find({ hotel: { $in: hotelIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer", "name email")
      .populate("room", "title roomNumber");

    return res.json({
      success: true,
      counts: {
        totalHotels: hotelIds.length,
        totalRooms,
        totalBookings,
        bookingsThisWeek: bookingsLast7,
        bookingTrend,
        completedPayments,
        totalRevenue,
      },
      data: { recentBookings },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch analytics", error: error.message });
  }
};

export default getHotelAnalytics;
