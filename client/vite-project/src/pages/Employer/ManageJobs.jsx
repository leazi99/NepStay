import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Briefcase,
  Plus,
  Users,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  AlertCircle,
  Clock,
  Search,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { useAuth } from "../../context/AuthContext";

const StatusBadge = ({ isClosed, isDark }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isClosed
      ? isDark
        ? "bg-red-900/30 text-red-300"
        : "bg-red-50 text-red-600"
      : isDark
        ? "bg-emerald-900/30 text-emerald-300"
        : "bg-green-50 text-green-600"
      }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${isClosed ? "bg-red-500" : "bg-green-500"}`} />
    {isClosed ? "Closed" : "Open"}
  </span>
);

const ActionIconButton = ({ label, onClick, className, disabled, isDark, children }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={label}
    >
      {children}
    </button>
    <span
      className={`pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium opacity-0 invisible transition-all duration-150 delay-75 group-hover:opacity-100 group-hover:visible group-hover:-translate-y-0.5 ${isDark ? "bg-slate-700 text-slate-100" : "bg-gray-900 text-white"}`}
    >
      {label}
    </span>
  </div>
);

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, loading, isDark }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={`rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
        <h3 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>{title}</h3>
        <p className={`text-sm mt-2 ${isDark ? "text-slate-300" : "text-gray-500"}`}>{message}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark ? "text-slate-200 bg-slate-800 hover:bg-slate-700" : "text-gray-600 bg-gray-100 hover:bg-gray-200"}`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ open: false, jobId: null, loading: false });
  const [toggling, setToggling] = useState(null);
  const isDark = (user?.themePreference || "light") === "dark";

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      } else {
        setError(res.data.message || "Failed to load jobs");
      }
    } catch {
      setError("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleToggleClose = async (jobId) => {
    setToggling(jobId);
    try {
      const res = await axiosInstance.put(API_PATHS.JOBS.TOGGLE_CLOSE(jobId));
      if (res.data.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, isClosed: !j.isClosed } : j))
        );
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message || "Failed to toggle job status");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setToggling(null);
    }
  };

  const handleDeleteConfirm = async () => {
    setConfirmDelete((prev) => ({ ...prev, loading: true }));
    try {
      const res = await axiosInstance.delete(API_PATHS.JOBS.DELETE_JOB(confirmDelete.jobId));
      if (res.data.success) {
        toast.success("Job deleted");
        setJobs((prev) => prev.filter((j) => j._id !== confirmDelete.jobId));
      } else {
        toast.error(res.data.message || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setConfirmDelete({ open: false, jobId: null, loading: false });
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Manage Jobs</h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
          </div>
          <button
            onClick={() => navigate("/post-job")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-blue-200 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Post Job
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-slate-500" : "text-gray-400"}`} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition ${isDark ? "border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500" : "border-gray-200 bg-white text-gray-900"}`}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-500">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">{error}</p>
            <button onClick={fetchJobs} className="text-blue-600 text-sm hover:underline">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center rounded-2xl border py-20 gap-4 ${isDark ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-white border-gray-100 text-gray-400"}`}>
            <Briefcase className="h-14 w-14 opacity-40" />
            <p className="text-sm">{search ? "No jobs match your search" : "No jobs posted yet"}</p>
            {!search && (
              <button
                onClick={() => navigate("/post-job")}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors"
              >
                Post Your First Job
              </button>
            )}
          </div>
        ) : (
          <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`${isDark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"} border-b`}>
                  <th className={`text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-500"}`}>Job Title</th>
                  <th className={`text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wide hidden sm:table-cell ${isDark ? "text-slate-400" : "text-gray-500"}`}>Type</th>
                  <th className={`text-center px-6 py-3.5 text-xs font-semibold uppercase tracking-wide hidden md:table-cell ${isDark ? "text-slate-400" : "text-gray-500"}`}>Applications</th>
                  <th className={`text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell ${isDark ? "text-slate-400" : "text-gray-500"}`}>Posted</th>
                  <th className={`text-center px-6 py-3.5 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-500"}`}>Status</th>
                  <th className={`text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-500"}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDark ? "divide-slate-800" : "divide-gray-50"} divide-y`}>
                {filtered.map((job) => (
                  <tr key={job._id} className={`transition-colors ${isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4">
                      <p className={`font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>{job.title}</p>
                      <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>NPR {job.salaryMin?.toLocaleString()} – NPR {job.salaryMax?.toLocaleString()}/mo</p>
                      <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Location: {job.jobLocation || "Not specified"}</p>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-50 text-blue-700"}`}>{job.location}</span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <button
                        onClick={() => navigate(`/applicants/${job._id}`)}
                        className={`flex items-center gap-1.5 mx-auto transition-colors ${isDark ? "text-slate-300 hover:text-blue-300" : "text-gray-700 hover:text-blue-600"}`}
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span className="font-medium">{job.applicationCount || 0}</span>
                      </button>
                    </td>
                    <td className={`px-6 py-4 hidden lg:table-cell ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(job.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge isClosed={job.isClosed} isDark={isDark} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <ActionIconButton
                          label="View Job"
                          onClick={() => navigate(`/employer-job/${job._id}`)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          isDark={isDark}
                        >
                          <Eye className="h-4 w-4" />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Edit Job"
                          onClick={() => navigate(`/post-job/${job._id}/edit`)}
                          className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                          isDark={isDark}
                        >
                          <Pencil className="h-4 w-4" />
                        </ActionIconButton>
                        <ActionIconButton
                          label={job.isClosed ? "Reopen Job" : "Close Job"}
                          onClick={() => handleToggleClose(job._id)}
                          disabled={toggling === job._id}
                          className="p-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-40"
                          isDark={isDark}
                        >
                          {toggling === job._id ? (
                            <span className="h-4 w-4 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin block" />
                          ) : job.isClosed ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </ActionIconButton>
                        <button
                          title="Delete Job"
                          onClick={() => setConfirmDelete({ open: true, jobId: job._id, loading: false })}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete this job?"
        message="This will permanently remove the job listing. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ open: false, jobId: null, loading: false })}
        loading={confirmDelete.loading}
        isDark={isDark}
      />
    </DashboardLayout>
  );
};

export default ManageJobs;
