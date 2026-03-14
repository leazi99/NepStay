import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

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

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axiosInstance.get(API_PATHS.ANALYTICS.EMPLOYER_ANALYTICS);
      setAnalytics(response.data);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error("Error fetching dashboard analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">

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
              value={analytics?.counts?.totalActiveJobs ?? 0}
              trend={analytics?.counts?.trends?.activeJobs ?? 0}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              icon={Users}
              label="Total Applications"
              value={analytics?.counts?.totalApplications ?? 0}
              trend={analytics?.counts?.trends?.totalApplications ?? 0}
              color="bg-gradient-to-br from-violet-500 to-violet-600"
            />
            <StatCard
              icon={CheckCircle2}
              label="Candidates Hired"
              value={analytics?.counts?.totalHired ?? 0}
              trend={analytics?.counts?.trends?.totalHired ?? 0}
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
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
                {analytics?.data?.recentJobs?.length === 0 ? (
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
                  analytics?.data?.recentJobs?.map((job) => (
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
                {analytics?.data?.recentApplications?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                    <Users className="h-10 w-10 opacity-40" />
                    <p className="text-sm">No applications yet</p>
                  </div>
                ) : (
                  analytics?.data?.recentApplications?.map((app) => (
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
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployerDashboard;
