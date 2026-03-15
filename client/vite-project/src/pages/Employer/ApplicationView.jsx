import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  ArrowLeft,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const STATUS_OPTIONS = ["Pending", "Accepted", "Rejected"];

const statusConfig = {
  Pending: {
    label: "Pending",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  Accepted: {
    label: "Accepted",
    cls: "bg-green-50 text-green-700 border border-green-200",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  Rejected: {
    label: "Rejected",
    cls: "bg-red-50 text-red-600 border border-red-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const ApplicationView = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get(API_PATHS.APPLICATIONS.GET_APPLICATIONS_FOR_JOB(jobId));
      if (res.data.success) {
        setApplications(res.data.applications || []);
      } else {
        setError(res.data.message || "Failed to load applications");
      }

      // Also fetch job title for context
      const jobRes = await axiosInstance.get(API_PATHS.JOBS.GET_JOB_BY_ID(jobId));
      if (jobRes.data.success) {
        setJobTitle(jobRes.data.job?.title || "");
      }
    } catch {
      setError("Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const res = await axiosInstance.put(API_PATHS.APPLICATIONS.UPDATE_STATUS(appId), {
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      } else {
        toast.error(res.data.message || "Failed to update status");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/manage-jobs")}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
            {jobTitle && (
              <p className="text-sm text-gray-500 mt-0.5">
                For: <span className="font-medium text-gray-700">{jobTitle}</span>
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-500">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">{error}</p>
            <button onClick={fetchApplications} className="text-blue-600 text-sm hover:underline">Retry</button>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 py-20 gap-4 text-gray-400">
            <Users className="h-14 w-14 opacity-40" />
            <p className="text-sm">No applicants yet for this job</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {applications.length} applicant{applications.length !== 1 ? "s" : ""}
            </p>
            {applications.map((app) => {
              const cfg = statusConfig[app.status] || statusConfig.Pending;
              const initials = app.applicant?.name?.[0]?.toUpperCase() || "?";

              return (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                      {app.applicant?.avatar ? (
                        <img
                          src={app.applicant.avatar}
                          alt={app.applicant.name}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-base font-bold text-blue-600">{initials}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{app.applicant?.name || "Unknown"}</p>
                          <p className="text-sm text-gray-500">{app.applicant?.email || "—"}</p>
                        </div>

                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Applied {formatDate(app.createdAt)}
                        </span>
                        {app.applicant?._id ? (
                          <button
                            onClick={() => navigate(`/freelancer/${app.applicant._id}`)}
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            View Profile
                          </button>
                        ) : null}
                        {app.resume && (
                          <a
                            href={app.resume}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View Resume
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {STATUS_OPTIONS.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(app._id, status)}
                            disabled={updatingId === app._id || app.status === status}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${app.status === status
                                ? status === "Accepted"
                                  ? "bg-green-600 text-white"
                                  : status === "Rejected"
                                    ? "bg-red-600 text-white"
                                    : "bg-amber-500 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5`}
                          >
                            {updatingId === app._id && app.status !== status ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : null}
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationView;
