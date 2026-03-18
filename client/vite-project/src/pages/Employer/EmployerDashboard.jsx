import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Briefcase,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  AlertCircle,
  ListChecks,
  Check,
  Circle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";

const StatCard = ({ icon: Icon, label, value, trend, color }) => {
  const isPositive = trend >= 0;
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span
          className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {Math.abs(trend)}%
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
};

const StatusBadge = ({ isClosed }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isClosed ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
      }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${isClosed ? "bg-red-500" : "bg-green-500"}`} />
    {isClosed ? "Closed" : "Open"}
  </span>
);

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  const counts = analytics?.counts || {};
  const trends = counts?.trends || {};
  const recentJobs = Array.isArray(analytics?.data?.recentJobs)
    ? analytics.data.recentJobs
    : [];
  const recentApplications = Array.isArray(analytics?.data?.recentApplications)
    ? analytics.data.recentApplications
    : [];

  const onboardingItems = [
    {
      key: "firstJob",
      label: "Post your first job",
      done: Number(counts?.totalActiveJobs || 0) > 0,
      actionLabel: "Post Job",
      action: () => navigate("/post-job"),
    },
    {
      key: "firstApplicant",
      label: "Receive first applicant",
      done: Number(counts?.totalApplications || 0) > 0,
      actionLabel: "Manage Jobs",
      action: () => navigate("/manage-jobs"),
    },
    {
      key: "firstHire",
      label: "Hire your first candidate",
      done: Number(counts?.totalHired || 0) > 0,
      actionLabel: "View Applicants",
      action: () => navigate("/manage-jobs"),
    },
    {
      key: "companyProfile",
      label: "Complete company profile",
      done: Boolean(
        recentJobs.length > 0 ||
          recentApplications.length > 0 ||
          analytics?.companyProfileCompleted,
      ),
      actionLabel: "Company Profile",
      action: () => navigate("/company-profile"),
    },
  ];

  const completedOnboardingCount = onboardingItems.filter((item) => item.done).length;
  const onboardingProgress = Math.round(
    (completedOnboardingCount / onboardingItems.length) * 100,
  );

  const getFallbackAnalytics = useCallback(async () => {
    const jobsResponse = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);

    if (!jobsResponse?.data?.success) {
      throw new Error(jobsResponse?.data?.message || "Failed to load jobs");
    }

    const jobs = Array.isArray(jobsResponse.data.jobs) ? jobsResponse.data.jobs : [];

    const applicationsByJob = await Promise.all(
      jobs.map(async (job) => {
        try {
          const response = await axiosInstance.get(
            API_PATHS.APPLICATIONS.GET_APPLICATIONS_FOR_JOB(job._id),
          );

          if (!response?.data?.success || !Array.isArray(response.data.applications)) {
            return [];
          }

          return response.data.applications.map((application) => ({
            ...application,
            job: application.job || { _id: job._id, title: job.title },
          }));
        } catch {
          return [];
        }
      }),
    );

    const allApplications = applicationsByJob
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalApplications = allApplications.length;
    const totalActiveJobs = jobs.filter((job) => !job.isClosed).length;
    const totalHired = allApplications.filter((application) =>
      ["Accepted", "Hired"].includes(application.status),
    ).length;

    return {
      counts: {
        totalActiveJobs,
        totalApplications,
        totalHired,
        trends: {
          activeJobs: 0,
          totalApplications: 0,
          totalHired: 0,
        },
      },
      data: {
        recentJobs: jobs
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5),
        recentApplications: allApplications.slice(0, 5),
      },
    };
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axiosInstance.get(API_PATHS.ANALYTICS.EMPLOYER_ANALYTICS);
      const hasValidAnalyticsShape =
        response?.data &&
        typeof response.data === "object" &&
        response.data.counts &&
        response.data.data;

      if (hasValidAnalyticsShape) {
        setAnalytics(response.data);
        return;
      }

      const fallbackAnalytics = await getFallbackAnalytics();
      setAnalytics(fallbackAnalytics);
      setError("Analytics service returned incomplete data. Showing fallback data.");
    } catch (err) {
      try {
        const fallbackAnalytics = await getFallbackAnalytics();
        setAnalytics(fallbackAnalytics);
        setError("Analytics service unavailable. Showing fallback data.");
      } catch {
        setError("Failed to load analytics data");
      }
      console.error("Error fetching dashboard analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getFallbackAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout activeMenu="employer-dashboard">
      <div className="max-w-7xl mx-auto space-y-8">

          {isLoading && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Loading dashboard data...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {error}
              </span>
              <button
                onClick={fetchAnalytics}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track your recruitment activity and performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/payments")}
                className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Payments
              </button>
              <button
                onClick={() => navigate("/post-job")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-blue-200"
              >
                <Plus className="h-4 w-4" />
                Post a Job
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              icon={Briefcase}
              label="Active Job Listings"
              value={counts?.totalActiveJobs ?? 0}
              trend={trends?.activeJobs ?? 0}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              icon={Users}
              label="Total Applications"
              value={counts?.totalApplications ?? 0}
              trend={trends?.totalApplications ?? 0}
              color="bg-gradient-to-br from-violet-500 to-violet-600"
            />
            <StatCard
              icon={CheckCircle2}
              label="Candidates Hired"
              value={counts?.totalHired ?? 0}
              trend={trends?.totalHired ?? 0}
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 inline-flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-blue-600" />
                  Getting Started Checklist
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Complete these steps to make your hiring setup market-ready.
                </p>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {completedOnboardingCount}/{onboardingItems.length} completed ({onboardingProgress}%)
              </span>
            </div>

            <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-5">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${onboardingProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {onboardingItems.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3 ${
                    item.done ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.done ? (
                      <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    <p className={`text-sm truncate ${item.done ? "text-emerald-700" : "text-gray-700"}`}>
                      {item.label}
                    </p>
                  </div>
                  {!item.done && (
                    <button
                      onClick={item.action}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
                <button
                  onClick={() => navigate("/manage-jobs")}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {recentJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                    <Briefcase className="h-10 w-10 opacity-40" />
                    <p className="text-sm">No jobs posted yet</p>
                    <button
                      onClick={() => navigate("/post-job")}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Post your first job →
                    </button>
                  </div>
                ) : (
                  recentJobs.map((job) => (
                    <div
                      key={job._id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      <StatusBadge isClosed={job.isClosed} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Applicants */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Applicants</h2>
                <button
                  onClick={() => navigate("/manage-jobs")}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {recentApplications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                    <Users className="h-10 w-10 opacity-40" />
                    <p className="text-sm">No applications yet</p>
                  </div>
                ) : (
                  recentApplications.map((app) => (
                    <div
                      key={app._id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                        {app.applicant?.avatar ? (
                          <img
                            src={app.applicant.avatar}
                            alt={app.applicant.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-blue-600">
                            {app.applicant?.name?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {app.applicant?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          Applied for{" "}
                          <span className="text-gray-600 font-medium">{app.job?.title}</span>
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDate(app.createdAt)}
                      </span>
                      {app.applicant?._id ? (
                        <button
                          onClick={() => navigate(`/freelancer/${app.applicant._id}`)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View Profile
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
