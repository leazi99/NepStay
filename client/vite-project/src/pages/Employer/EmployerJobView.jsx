import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Users, Clock, Briefcase, MapPin, DollarSign } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const EmployerJobView = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJob = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOB_BY_ID(jobId));
      if (!response.data.success || !response.data.job) {
        setError(response.data.message || "Failed to load job");
        return;
      }
      setJob(response.data.job);
    } catch {
      setError("Failed to load job");
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/manage-jobs")}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
              <p className="text-sm text-gray-500">View and manage your posted job</p>
            </div>
          </div>

          {job ? (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/applicants/${job._id}`)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                View Applicants
              </button>
              <button
                onClick={() => navigate(`/post-job/${job._id}/edit`)}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit Job
              </button>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-8 text-center text-red-600">
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchJob}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Retry
            </button>
          </div>
        ) : !job ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
            <p className="text-sm">Job not found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{job.location}</span>
                {job.category ? (
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">{job.category}</span>
                ) : null}
                <span
                  className={`px-2.5 py-1 rounded-full ${job.isClosed ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                >
                  {job.isClosed ? "Closed" : "Open"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Salary Range
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} / month
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Duration
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">{job.duration || "Not specified"}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Posted On
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(job.createdAt)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> Job Description
              </h3>
              <p className="text-sm text-gray-700 leading-6 mt-2 whitespace-pre-line">{job.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">Requirements</h3>
              <p className="text-sm text-gray-700 leading-6 mt-2 whitespace-pre-line">{job.requirements}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployerJobView;
