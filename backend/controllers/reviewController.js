import paymentModel from "../models/paymentModel.js";
import reviewModel from "../models/reviewModel.js";

const normalizeReviewerRole = (role) => {
  if (role === "jobseeker") return "freelancer";
  return role;
};

const parsePagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  return { page, limit };
};

const applyReviewFilters = (reviews, query) => {
  const search = String(query.search || "")
    .trim()
    .toLowerCase();
  const ratingFilter = String(query.rating || "all");
  const roleFilter = String(query.role || "all");

  return reviews.filter((review) => {
    const matchesRating =
      ratingFilter === "all" || Number(review.rating) === Number(ratingFilter);

    const reviewerRole =
      review.reviewer?.role === "jobseeker"
        ? "freelancer"
        : review.reviewer?.role;
    const revieweeRole =
      review.reviewee?.role === "jobseeker"
        ? "freelancer"
        : review.reviewee?.role;

    const matchesRole =
      roleFilter === "all" ||
      reviewerRole === roleFilter ||
      revieweeRole === roleFilter;

    const searchable = [
      review.comment || "",
      review.job?.title || "",
      review.reviewer?.name || "",
      review.reviewer?.email || "",
      review.reviewee?.name || "",
      review.reviewee?.email || "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !search || searchable.includes(search);

    return matchesRating && matchesRole && matchesSearch;
  });
};

const buildPaginatedResult = (items, page, limit) => {
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const start = (page - 1) * limit;
  const paginated = items.slice(start, start + limit);

  return {
    items: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const getEligibleReviews = async (req, res) => {
  try {
    const currentUserId = String(req.user.id);
    const role = normalizeReviewerRole(req.user.role);

    if (!["employer", "freelancer"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Only employers and freelancers can review",
      });
    }

    const baseQuery = {
      status: "completed",
      ...(role === "employer"
        ? { employer: currentUserId }
        : { freelancer: currentUserId }),
    };

    const [payments, submittedReviews] = await Promise.all([
      paymentModel
        .find(baseQuery)
        .populate("job", "title")
        .populate("employer", "name email avatar")
        .populate("freelancer", "name email avatar")
        .sort({ createdAt: -1 }),
      reviewModel.find({ reviewer: currentUserId }).select("payment"),
    ]);

    const reviewedPaymentIds = new Set(
      submittedReviews.map((review) => String(review.payment)),
    );

    const eligible = payments
      .filter((payment) => !reviewedPaymentIds.has(String(payment._id)))
      .map((payment) => {
        const reviewee =
          role === "employer" ? payment.freelancer : payment.employer;

        return {
          paymentId: payment._id,
          job: payment.job,
          amount: payment.amount,
          completedAt: payment.updatedAt || payment.createdAt,
          reviewee,
        };
      });

    return res.json({
      success: true,
      eligible,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const currentUserId = String(req.user.id);
    const role = normalizeReviewerRole(req.user.role);
    const { paymentId, rating, comment } = req.body;

    if (!["employer", "freelancer"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Only employers and freelancers can review",
      });
    }

    if (!paymentId || rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        message: "Payment and rating are required",
      });
    }

    const ratingNumber = Number(rating);
    if (
      !Number.isFinite(ratingNumber) ||
      ratingNumber < 1 ||
      ratingNumber > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const payment = await paymentModel
      .findById(paymentId)
      .populate("job", "title")
      .populate("employer", "name email avatar")
      .populate("freelancer", "name email avatar");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Review can only be added after completed payment",
      });
    }

    const isEmployerReviewer = String(payment.employer?._id) === currentUserId;
    const isFreelancerReviewer =
      String(payment.freelancer?._id) === currentUserId;

    if (!isEmployerReviewer && !isFreelancerReviewer) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this payment",
      });
    }

    const existingReview = await reviewModel.findOne({
      payment: payment._id,
      reviewer: currentUserId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this project",
      });
    }

    const reviewee = isEmployerReviewer
      ? payment.freelancer?._id
      : payment.employer?._id;

    const review = await reviewModel.create({
      payment: payment._id,
      job: payment.job?._id,
      reviewer: currentUserId,
      reviewee,
      reviewerRole: isEmployerReviewer ? "employer" : "freelancer",
      rating: ratingNumber,
      comment: String(comment || "").trim(),
    });

    const populatedReview = await reviewModel
      .findById(review._id)
      .populate("reviewer", "name email avatar role")
      .populate("reviewee", "name email avatar role")
      .populate("job", "title");

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getReceivedReviews = async (req, res) => {
  try {
    const requestedUserId = req.query.userId || req.user.id;
    const { page, limit } = parsePagination(req.query);

    const allReviews = await reviewModel
      .find({ reviewee: requestedUserId })
      .populate("reviewer", "name email avatar role")
      .populate("reviewee", "name email avatar role")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    const filtered = applyReviewFilters(allReviews, req.query);

    const { items: reviews, pagination } = buildPaginatedResult(
      filtered,
      page,
      limit,
    );

    const total = filtered.length;
    const averageRating =
      total > 0
        ? Number(
            (
              filtered.reduce(
                (sum, review) => sum + Number(review.rating || 0),
                0,
              ) / total
            ).toFixed(1),
          )
        : 0;

    return res.json({
      success: true,
      averageRating,
      total,
      pagination,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getGivenReviews = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { page, limit } = parsePagination(req.query);

    const allReviews = await reviewModel
      .find({ reviewer: currentUserId })
      .populate("reviewer", "name email avatar role")
      .populate("reviewee", "name email avatar role")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    const filtered = applyReviewFilters(allReviews, req.query);
    const { items: reviews, pagination } = buildPaginatedResult(
      filtered,
      page,
      limit,
    );

    return res.json({
      success: true,
      total: filtered.length,
      pagination,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
