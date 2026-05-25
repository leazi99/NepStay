import userModel from "../models/userModel.js";
import paymentModel from "../models/paymentModel.js";
import hotelModel from "../models/hotelModel.js";
import roomModel from "../models/roomModel.js";
import bookingModel from "../models/bookingModel.js";
import reviewModel from "../models/reviewModel.js";
import messageModel from "../models/messageModel.js";
import chatRoomModel from "../models/chatRoomModel.js";
import notificationModel from "../models/notificationModel.js";
import analyticsModel from "../models/analyticsModel.js";

const ensureAdmin = (req, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Only admin can access this resource",
    });
    return false;
  }
  return true;
};

export const getAdminOverview = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const [
      totalUsers,
      totalCustomers,
      totalStaff,
      pendingVerification,
      totalHotels,
      totalRooms,
      totalBookings,
      totalPayments,
      completedPayments,
      pendingPayments,
    ] = await Promise.all([
      userModel.countDocuments({}),
      userModel.countDocuments({ role: "customer" }),
      userModel.countDocuments({ role: "hotelstaff" }),
      userModel.countDocuments({ identityVerificationStatus: "pending" }),
      hotelModel.countDocuments({}),
      roomModel.countDocuments({}),
      bookingModel.countDocuments({}),
      paymentModel.countDocuments({}),
      paymentModel.countDocuments({ status: "completed" }),
      paymentModel.countDocuments({ status: "pending" }),
    ]);

    return res.json({
      success: true,
      counts: {
        totalUsers,
        totalCustomers,
        totalStaff,
        pendingVerification,
        totalHotels,
        totalRooms,
        totalBookings,
        totalPayments,
        completedPayments,
        pendingPayments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { search = "", role = "all" } = req.query;

    const query = {
      ...(role !== "all" ? { role } : {}),
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const users = await userModel
      .find(query)
      .select(
        "name email role avatar isVerified createdAt identityVerificationStatus suspensionEndsAt suspensionReason",
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { userId } = req.params;
    const {
      role,
      identityVerificationStatus,
      suspensionDays,
      clearSuspension,
      suspensionReason,
    } = req.body;

    const allowedRoles = ["customer", "hotelstaff", "admin"];
    const allowedVerificationStatuses = [
      "not_submitted",
      "pending",
      "verified",
      "rejected",
    ];

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (role !== undefined) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      if (String(user._id) === String(req.user.id) && role !== "admin") {
        return res.status(400).json({
          success: false,
          message: "Admin cannot remove own admin role",
        });
      }

      user.role = role;
    }

    if (clearSuspension === true) {
      user.suspensionEndsAt = null;
      user.suspensionReason = "";
    }

    if (suspensionDays !== undefined) {
      const parsedDays = Number(suspensionDays);

      if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 365) {
        return res.status(400).json({
          success: false,
          message: "Suspension days must be an integer between 1 and 365",
        });
      }

      if (String(user._id) === String(req.user.id)) {
        return res.status(400).json({
          success: false,
          message: "Admin cannot suspend own account",
        });
      }

      const durationMs = parsedDays * 24 * 60 * 60 * 1000;
      user.suspensionEndsAt = new Date(Date.now() + durationMs);
      user.suspensionReason = String(suspensionReason || "")
        .trim()
        .slice(0, 200);
    }

    if (identityVerificationStatus !== undefined) {
      if (!allowedVerificationStatuses.includes(identityVerificationStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification status",
        });
      }

      if (
        identityVerificationStatus === "verified" &&
        (!user.studentIdCard || !user.nationalIdCard)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Both Student ID and National ID are required before verification",
        });
      }

      if (
        identityVerificationStatus === "pending" &&
        (!user.studentIdCard || !user.nationalIdCard)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Both Student ID and National ID are required before setting pending",
        });
      }

      user.identityVerificationStatus = identityVerificationStatus;
    }

    await user.save();

    return res.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        identityVerificationStatus: user.identityVerificationStatus,
        suspensionEndsAt: user.suspensionEndsAt,
        suspensionReason: user.suspensionReason,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { status = "all", search = "" } = req.query;
    const payments = await paymentModel
      .find(status === "all" ? {} : { status })
      .populate({
        path: "booking",
        populate: [{ path: "room" }, { path: "hotel" }],
      })
      .populate("customer", "name email")
      .populate("hotel", "name location")
      .sort({ createdAt: -1 });

    const normalizedSearch = String(search || "")
      .trim()
      .toLowerCase();

    const filteredPayments = normalizedSearch
      ? payments.filter((payment) => {
          const roomTitle = String(payment.booking?.room?.title || "");
          const hotelName = String(
            payment.hotel?.name || payment.booking?.hotel?.name || "",
          );
          const customerName = String(payment.customer?.name || "");
          const customerEmail = String(payment.customer?.email || "");

          const searchable = [roomTitle, hotelName, customerName, customerEmail]
            .join(" ")
            .toLowerCase();

          return searchable.includes(normalizedSearch);
        })
      : payments;

    return res.json({ success: true, payments: filteredPayments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Hotel-focused admin endpoints — hotel/room/booking/payment reports are below

export const deleteAdminUser = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { userId } = req.params;

    if (String(userId) === String(req.user?.id || "")) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete own account",
      });
    }

    const user = await userModel.findById(userId).select("_id role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Deleting another admin account is not allowed",
      });
    }

    // If user is a hotel manager, collect hotels/rooms/bookings to cascade-delete
    const hotelsByUser = await hotelModel
      .find({ manager: userId })
      .select("_id");
    const hotelIds = hotelsByUser.map((h) => h._id);

    const chatRooms = await chatRoomModel
      .find({ participants: userId })
      .select("_id");
    const roomIds = chatRooms.map((room) => room._id);

    await Promise.all([
      // cascade delete bookings/payments/reviews related to user's hotels
      bookingModel.deleteMany({ hotel: { $in: hotelIds } }),
      paymentModel.deleteMany({ hotel: { $in: hotelIds } }),
      reviewModel.deleteMany({ hotel: { $in: hotelIds } }),
      notificationModel.deleteMany({
        $or: [{ recipient: userId }, { sender: userId }],
      }),
      analyticsModel.deleteMany({ hotel: { $in: hotelIds } }),
      messageModel.updateMany({}, { $pull: { readBy: userId } }),
      roomIds.length
        ? messageModel.deleteMany({ room: { $in: roomIds } })
        : null,
      roomIds.length
        ? chatRoomModel.deleteMany({ _id: { $in: roomIds } })
        : null,
      hotelModel.deleteMany({ manager: userId }),
      userModel.findByIdAndDelete(userId),
    ]);

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminReports = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const sixMonthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalHotels,
      totalRooms,
      totalBookings,
      totalReviews,
      avgReviewResult,
      completedPayments,
      completedPaymentAmount,
      usersThisMonth,
      usersPreviousMonth,
      hotelsThisMonth,
      hotelsPreviousMonth,
      paymentsThisMonth,
      paymentsPreviousMonth,
      monthlyUsers,
      monthlyHotels,
      monthlyPayments,
    ] = await Promise.all([
      hotelModel.countDocuments({}),
      roomModel.countDocuments({}),
      bookingModel.countDocuments({}),
      reviewModel.countDocuments({}),
      reviewModel.aggregate([
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]),
      paymentModel.countDocuments({ status: "completed" }),
      paymentModel.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),
      userModel.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      userModel.countDocuments({
        createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
      }),
      hotelModel.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      hotelModel.countDocuments({
        createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
      }),
      paymentModel.countDocuments({
        status: "completed",
        createdAt: { $gte: currentMonthStart },
      }),
      paymentModel.countDocuments({
        status: "completed",
        createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
      }),
      userModel.aggregate([
        { $match: { createdAt: { $gte: sixMonthStart } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      hotelModel.aggregate([
        { $match: { createdAt: { $gte: sixMonthStart } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      paymentModel.aggregate([
        { $match: { status: "completed", createdAt: { $gte: sixMonthStart } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const monthlyMap = new Map();

    const ensureMonth = (year, month) => {
      const key = `${year}-${month}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          key,
          label: new Date(year, month - 1, 1).toLocaleString("en-US", {
            month: "short",
            year: "numeric",
          }),
          users: 0,
          jobs: 0,
          completedPayments: 0,
        });
      }
      return monthlyMap.get(key);
    };

    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      ensureMonth(date.getFullYear(), date.getMonth() + 1);
    }

    monthlyUsers.forEach((entry) => {
      const target = ensureMonth(entry._id.year, entry._id.month);
      target.users = entry.count;
    });

    monthlyJobs.forEach((entry) => {
      const target = ensureMonth(entry._id.year, entry._id.month);
      target.jobs = entry.count;
    });

    monthlyPayments.forEach((entry) => {
      const target = ensureMonth(entry._id.year, entry._id.month);
      target.completedPayments = entry.count;
    });

    return res.json({
      success: true,
      reports: {
        hotels: {
          total: totalHotels,
        },
        rooms: {
          total: totalRooms,
        },
        bookings: {
          total: totalBookings,
        },
        reviews: {
          total: totalReviews,
          averageRating: Number(avgReviewResult?.[0]?.avgRating || 0),
        },
        payments: {
          completedCount: completedPayments,
          completedRevenue: Number(
            completedPaymentAmount?.[0]?.totalAmount || 0,
          ),
        },
        growth: {
          users: {
            thisMonth: usersThisMonth,
            previousMonth: usersPreviousMonth,
          },
          hotels: {
            thisMonth: hotelsThisMonth,
            previousMonth: hotelsPreviousMonth,
          },
          completedPayments: {
            thisMonth: paymentsThisMonth,
            previousMonth: paymentsPreviousMonth,
          },
        },
        monthlyTrend: Array.from(monthlyMap.values()),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentStatusByAdmin = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { paymentId } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const payment = await paymentModel
      .findByIdAndUpdate(paymentId, { status }, { new: true })
      .populate({
        path: "booking",
        populate: [{ path: "room" }, { path: "hotel" }],
      })
      .populate("customer", "name email")
      .populate("hotel", "name location");

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    return res.json({
      success: true,
      message: "Payment status updated",
      payment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
