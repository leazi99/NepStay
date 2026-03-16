import React, { useEffect, useMemo, useState } from "react";
import { Star, Loader2 } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("received");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [averageRating, setAverageRating] = useState(0);

  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("all");
  const [role, setRole] = useState("all");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(pagination.page || 1));
    params.set("limit", "8");
    if (search.trim()) params.set("search", search.trim());
    if (rating !== "all") params.set("rating", rating);
    if (role !== "all") params.set("role", role);
    return params.toString();
  }, [pagination.page, search, rating, role]);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
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
        setPagination({
          page: response.data.pagination?.page || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.pagination?.total || 0,
        });

        if (activeTab === "received") {
          setAverageRating(response.data.averageRating || 0);
        }
      } catch {
        setReviews([]);
        setPagination({ page: 1, totalPages: 1, total: 0 });
        setAverageRating(0);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [activeTab, queryString]);

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
            <h1 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>All Reviews</h1>
            {activeTab === "received" ? (
              <p className={`text-sm mt-1 ${isDark ? "text-slate-300" : "text-gray-500"}`}>
                Average rating: <span className="font-semibold">{averageRating || 0}</span> / 5
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
          </div>

          <div className={`border-t ${isDark ? "border-slate-700" : "border-gray-200"}`}>
            {loading ? (
              <div className="p-6 flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className={`p-10 text-center text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                No reviews found.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {reviews.map((review) => {
                  const counterpart =
                    activeTab === "received" ? review.reviewer : review.reviewee;

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
