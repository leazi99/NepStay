import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";
import DashboardLayout from "../../components/layout/DashboardLayout";

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${Number(rating) >= star ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
      />
    ))}
  </div>
);

const ReviewsContent = ({ isDark, userRole }) => {
  const [searchParams] = useSearchParams();
  const targetUserId = String(searchParams.get("userId") || "").trim();
  const targetName = String(searchParams.get("name") || "").trim();
  const requestedTab = String(searchParams.get("tab") || "").trim().toLowerCase();
  const isClientReviewView = Boolean(targetUserId);

  const [activeTab, setActiveTab] = useState("received");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [eligibleReviews, setEligibleReviews] = useState([]);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [submittingReviewPaymentId, setSubmittingReviewPaymentId] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [averageRating, setAverageRating] = useState(0);
  const [isSelfView, setIsSelfView] = useState(false);

  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");
  const [role, setRole] = useState("all");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(pagination.page || 1));
    params.set("limit", "8");
    if (isClientReviewView) params.set("userId", targetUserId);
    if (search.trim()) params.set("search", search.trim());
    if (rating !== "all") params.set("rating", rating);
    if (role !== "all") params.set("role", role);
    return params.toString();
  }, [isClientReviewView, pagination.page, rating, role, search, targetUserId]);

  useEffect(() => {
    if (isClientReviewView && activeTab !== "received") {
      setActiveTab("received");
    }
  }, [activeTab, isClientReviewView]);

  useEffect(() => {
    if (isClientReviewView) return;
    if (!["received", "given", "pending"].includes(requestedTab)) return;
    setActiveTab(requestedTab);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [isClientReviewView, requestedTab]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (activeTab === "pending") {
          const eligibleResponse = await axiosInstance.get(API_PATHS.REVIEWS.GET_ELIGIBLE);
          if (!eligibleResponse.data?.success) {
            setEligibleReviews([]);
            return;
          }

          setEligibleReviews(eligibleResponse.data.eligible || []);
          return;
        }

        const endpoint =
          activeTab === "received"
            ? API_PATHS.REVIEWS.GET_RECEIVED
            : API_PATHS.REVIEWS.GET_GIVEN;

        const response = await axiosInstance.get(`${endpoint}?${queryString}`);

        if (!response.data?.success) {
          setReviews([]);
          setPagination({ page: 1, totalPages: 1, total: 0 });
          setAverageRating(0);
          return;
        }

        setReviews(response.data.reviews || []);
        setEligibleReviews([]);
        setPagination({
          page: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.pagination?.total || 0,
        });

        if (activeTab === "received") {
          setAverageRating(response.data.averageRating || 0);
          setIsSelfView(Boolean(response.data.isSelfView));
        } else {
          setIsSelfView(true);
        }
      } catch {
        setReviews([]);
        setEligibleReviews([]);
        setPagination({ page: 1, totalPages: 1, total: 0 });
        setAverageRating(0);
        setIsSelfView(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, queryString]);

  const handleReviewDraftChange = (paymentId, field, value) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [paymentId]: {
        rating: prev[paymentId]?.rating || "",
        comment: prev[paymentId]?.comment || "",
        privateComment: prev[paymentId]?.privateComment || "",
        recommendAgain:
          typeof prev[paymentId]?.recommendAgain === "boolean"
            ? prev[paymentId]?.recommendAgain
            : true,
        [field]: value,
      },
    }));
  };

  const handleSubmitReview = async (paymentId) => {
    const draft = reviewDrafts[paymentId] || {};
    const ratingValue = Number(draft.rating);

    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      toast.error("Please choose a rating between 1 and 5 stars");
      return;
    }

    setSubmittingReviewPaymentId(paymentId);
    try {
      const response = await axiosInstance.post(API_PATHS.REVIEWS.CREATE, {
        paymentId,
        rating: ratingValue,
        comment: draft.comment || "",
        privateFeedback: {
          recommendAgain:
            typeof draft.recommendAgain === "boolean"
              ? draft.recommendAgain
              : true,
          privateComment: draft.privateComment || "",
        },
      });

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to submit review");
        return;
      }

      toast.success("Review submitted");
      setEligibleReviews((prev) => prev.filter((item) => item.paymentId !== paymentId));
      setReviewDrafts((prev) => {
        const next = { ...prev };
        delete next[paymentId];
        return next;
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReviewPaymentId("");
    }
  };

  const resetPageOnFilterChange = (updater) => {
    updater();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className={`min-h-[calc(100vh-70px)] ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      {userRole === "jobseeker" ? <FreelancerNavbar active="reviews" /> : null}

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className={`rounded-2xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <div className={`p-4 border-b ${isDark ? "border-slate-700" : "border-gray-200"}`}>
            <h1 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
              {isClientReviewView
                ? `${targetName || "Client"} Reviews`
                : "All Reviews"}
            </h1>
            {activeTab === "received" ? (
              <p className={`text-sm mt-1 ${isDark ? "text-slate-300" : "text-gray-500"}`}>
                Average rating: <span className="font-semibold">{averageRating || 0}</span> / 5
              </p>
            ) : activeTab === "pending" ? (
              <p className={`text-sm mt-1 ${isDark ? "text-slate-300" : "text-gray-500"}`}>
                Submit feedback for completed projects where you have not reviewed yet.
              </p>
            ) : null}
          </div>

          <div className="p-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("received");
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                activeTab === "received"
                  ? "bg-blue-600 text-white"
                  : isDark
                    ? "bg-slate-700 text-slate-200"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              Received
            </button>
            {!isClientReviewView ? (
              <button
                onClick={() => {
                  setActiveTab("given");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeTab === "given"
                    ? "bg-blue-600 text-white"
                    : isDark
                      ? "bg-slate-700 text-slate-200"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                Given
              </button>
            ) : null}
            {!isClientReviewView ? (
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  activeTab === "pending"
                    ? "bg-blue-600 text-white"
                    : isDark
                      ? "bg-slate-700 text-slate-200"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                Pending Reviews
              </button>
            ) : null}

            {activeTab !== "pending" ? (
              <>
                <input
                  value={search}
                  onChange={(event) =>
                    resetPageOnFilterChange(() => setSearch(event.target.value))
                  }
                  placeholder="Search by name, project, comment"
                  className={`ml-auto px-3 py-2 rounded-lg border text-sm w-full sm:w-72 ${
                    isDark
                      ? "border-slate-600 bg-slate-800 text-slate-100"
                      : "border-gray-200 bg-white text-gray-900"
                  }`}
                />

                <select
                  value={rating}
                  onChange={(event) =>
                    resetPageOnFilterChange(() => setRating(event.target.value))
                  }
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    isDark
                      ? "border-slate-600 bg-slate-800 text-slate-100"
                      : "border-gray-200 bg-white text-gray-900"
                  }`}
                >
                  <option value="all">All ratings</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>

                <select
                  value={role}
                  onChange={(event) =>
                    resetPageOnFilterChange(() => setRole(event.target.value))
                  }
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    isDark
                      ? "border-slate-600 bg-slate-800 text-slate-100"
                      : "border-gray-200 bg-white text-gray-900"
                  }`}
                >
                  <option value="all">All roles</option>
                  <option value="employer">Employer</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </>
            ) : null}
          </div>

          <div className={`border-t ${isDark ? "border-slate-700" : "border-gray-200"}`}>
            {loading ? (
              <div className="p-6 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews...
              </div>
            ) : activeTab === "pending" ? (
              eligibleReviews.length === 0 ? (
                <div className={`p-10 text-center text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  No pending reviews right now.
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {eligibleReviews.map((item) => {
                    const draft = reviewDrafts[item.paymentId] || {
                      rating: "",
                      comment: "",
                      privateComment: "",
                      recommendAgain: true,
                    };

                    return (
                      <div key={item.paymentId} className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                              {item.reviewee?.name || "User"}
                            </p>
                            <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                              {item.job?.title || "Project"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-2">
                          <div className={`flex items-center gap-1 px-2 py-2 border rounded-lg ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"}`}>
                            {[1, 2, 3, 4, 5].map((star) => {
                              const selected = Number(draft.rating || 0) >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    handleReviewDraftChange(item.paymentId, "rating", String(star))
                                  }
                                  className="p-0.5"
                                  title={`${star} star${star > 1 ? "s" : ""}`}
                                >
                                  <Star
                                    className={`h-5 w-5 ${selected ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                                  />
                                </button>
                              );
                            })}
                          </div>

                          <input
                            type="text"
                            value={draft.comment}
                            onChange={(event) =>
                              handleReviewDraftChange(item.paymentId, "comment", event.target.value)
                            }
                            placeholder="Write public feedback"
                            className={`px-3 py-2 border rounded-lg text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200"}`}
                          />

                          <button
                            onClick={() => handleSubmitReview(item.paymentId)}
                            disabled={submittingReviewPaymentId === item.paymentId}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
                          >
                            {submittingReviewPaymentId === item.paymentId ? "Submitting..." : "Submit"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-2">
                          <label className={`inline-flex items-center gap-2 text-xs ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                            <input
                              type="checkbox"
                              checked={Boolean(draft.recommendAgain)}
                              onChange={(event) =>
                                handleReviewDraftChange(
                                  item.paymentId,
                                  "recommendAgain",
                                  event.target.checked,
                                )
                              }
                              className="h-4 w-4"
                            />
                            Recommend again (private)
                          </label>

                          <input
                            type="text"
                            value={draft.privateComment}
                            onChange={(event) =>
                              handleReviewDraftChange(item.paymentId, "privateComment", event.target.value)
                            }
                            placeholder="Private feedback (optional)"
                            className={`px-3 py-2 border rounded-lg text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200"}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : reviews.length === 0 ? (
              <div className={`p-10 text-center text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                No reviews found.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {reviews.map((review) => {
                  const counterpart =
                    activeTab === "received" ? review.reviewer : review.reviewee;
                  const isVisible = review.isPublicVisible !== false;
                  const showPendingVisibility =
                    activeTab === "given" || (activeTab === "received" && isSelfView);

                  return (
                    <div key={review._id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                            {counterpart?.name || "User"}
                          </p>
                          <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                            {review.job?.title || "Project"}
                          </p>
                          {review.publicTitle ? (
                            <p className={`text-xs mt-1 font-medium ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                              {review.publicTitle}
                            </p>
                          ) : null}
                          {showPendingVisibility && !isVisible ? (
                            <p className="text-xs mt-1 text-amber-600">
                              Waiting for other party feedback before public visibility.
                            </p>
                          ) : null}
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment ? (
                        <p className={`text-sm mt-2 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                          {review.comment}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {activeTab !== "pending" ? (
            <div className={`p-4 border-t flex items-center justify-between ${isDark ? "border-slate-700" : "border-gray-200"}`}>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                {pagination.total || 0} total reviews
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))
                  }
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className={`text-xs ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                  Page {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.page + 1, prev.totalPages || 1),
                    }))
                  }
                  disabled={pagination.page >= (pagination.totalPages || 1)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Reviews = () => {
  const { user } = useAuth();
  const isDark = (user?.themePreference || "light") === "dark";

  if (user?.role === "employer") {
    return (
      <DashboardLayout activeMenu="reviews">
        <ReviewsContent isDark={isDark} userRole={user?.role} />
      </DashboardLayout>
    );
  }

  return <ReviewsContent isDark={isDark} userRole={user?.role} />;
};

export default Reviews;
