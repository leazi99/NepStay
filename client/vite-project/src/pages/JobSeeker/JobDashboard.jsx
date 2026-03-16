import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Heart,
  Briefcase,
  ChevronDown,
  AlertCircle,
  FilterX,
  Building2,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import { JOB_TYPES } from "../../utils/data";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";

const JobCard = ({ job, onSave, onUnsave, onApply, isDark }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const companyName = job.company?.companyName || job.company?.name || "Company";
  const logo = job.company?.companyLogo;
  const normalizedStatus =
    job.applicationStatus === "Accepted" || job.applicationStatus === "Hired"
      ? "Accepted"
      : job.applicationStatus === "Rejected"
        ? "Rejected"
        : job.applicationStatus
          ? "Pending"
          : null;

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    setSaving(true);
    if (job.isSaved) {
      await onUnsave(job._id);
    } else {
      await onSave(job._id);
    }
    setSaving(false);
  };

  return (
    <div
      className={`rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group p-5 flex flex-col gap-4 ${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"
      }`}
      onClick={() => navigate(`/job/${job._id}`)}
    >
     
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border ${
            isDark ? "bg-slate-700 border-slate-600" : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-100"
          }`}>
            {logo ? (
              <img src={logo} alt={companyName} className="h-full w-full object-cover rounded-xl" />
            ) : (
              <Building2 className="h-5 w-5 text-blue-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className={`font-semibold truncate transition-colors ${isDark ? "text-slate-100 group-hover:text-blue-300" : "text-gray-900 group-hover:text-blue-700"}`}>
              {job.title}
            </p>
            <p className={`text-sm truncate ${isDark ? "text-slate-400" : "text-gray-500"}`}>{companyName}</p>
          </div>
        </div>
        <button
          onClick={handleSaveToggle}
          disabled={saving}
          className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
            isDark ? "hover:bg-red-900/30" : "hover:bg-red-50"
          } ${job.isSaved ? "text-red-500" : "text-gray-300 hover:text-red-400"
            } ${saving ? "opacity-40" : ""}`}
        >
          <Heart className={`h-5 w-5 ${job.isSaved ? "fill-current" : ""}`} />
        </button>
      </div>

     
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
          <MapPin className="h-3 w-3" />
          {job.location}
        </span>
        <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
          <DollarSign className="h-3 w-3" />
          ${job.salaryMin?.toLocaleString()} – ${job.salaryMax?.toLocaleString()}
        </span>
        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600"}`}>
          <Clock className="h-3 w-3" />
          {job.duration}
        </span>
      </div>

      
      <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? "text-slate-400" : "text-gray-500"}`}>{job.description}</p>

      
      <div onClick={(e) => e.stopPropagation()}>
        {normalizedStatus ? (
          <span
            className={`inline-block px-3 py-1.5 rounded-xl text-xs font-medium ${normalizedStatus === "Accepted"
                ? "bg-green-100 text-green-700"
                : normalizedStatus === "Rejected"
                  ? "bg-red-100 text-red-600"
                  : "bg-amber-100 text-amber-700"
              }`}
          >
            {normalizedStatus === "Pending"
              ? "⏳ Application Pending"
              : normalizedStatus === "Accepted"
                ? "✅ Accepted"
                : "❌ Rejected"}
          </span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onApply(job._id); }}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Apply Now
          </button>
        )}
      </div>
    </div>
  );
};

const JobDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ keyword: "", location: "" });
  const [appliedFilters, setAppliedFilters] = useState({ keyword: "", location: "" });

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (appliedFilters.keyword) params.append("keyword", appliedFilters.keyword);
      if (appliedFilters.location) params.append("location", appliedFilters.location);
      if (user?._id) params.append("userId", user._id);

      const res = await axiosInstance.get(`${API_PATHS.JOBS.GET_ALL_JOBS}?${params.toString()}`);
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      } else {
        setError("Failed to load jobs");
      }
    } catch {
      setError("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, user?._id]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedFilters({ ...filters });
  };

  const handleClearFilters = () => {
    setFilters({ keyword: "", location: "" });
    setAppliedFilters({ keyword: "", location: "" });
  };

  const handleSave = async (jobId) => {
    if (!isAuthenticated) { toast.error("Login to save jobs"); return; }
    try {
      const res = await axiosInstance.post(API_PATHS.JOBS.SAVE_JOB(jobId));
      if (res.data.success) {
        toast.success("Job saved!");
        setJobs((prev) => prev.map((j) => j._id === jobId ? { ...j, isSaved: true } : j));
      } else {
        toast.error(res.data.message);
      }
    } catch { toast.error("Failed to save job"); }
  };

  const handleUnsave = async (jobId) => {
    if (!isAuthenticated) return;
    try {
      const res = await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
      if (res.data.success) {
        toast.success("Removed from saved");
        setJobs((prev) => prev.map((j) => j._id === jobId ? { ...j, isSaved: false } : j));
      }
    } catch { toast.error("Failed to unsave job"); }
  };

  const handleApply = (jobId) => {
    if (!isAuthenticated) { toast.error("Please login to apply"); navigate("/login"); return; }
    navigate(`/job/${jobId}`);
  };

  const hasFilters = appliedFilters.keyword || appliedFilters.location;
  const isDark = (user?.themePreference || "light") === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      <FreelancerNavbar active="dashboard" />
      {/* Hero Search Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Find Your Dream Job
          </h1>
          <p className="text-blue-100 text-sm sm:text-base">
            Explore thousands of opportunities from top companies
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Job title or keyword..."
                value={filters.keyword}
                onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value }))}
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="relative">
              <select
                value={filters.location}
                onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
                className="w-full sm:w-40 px-4 py-3 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none bg-white"
              >
                <option value="">All Types</option>
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-700 font-semibold text-sm rounded-2xl hover:bg-blue-50 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filter strip */}
        <div className="flex items-center justify-between mb-6">
          <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>
            {isLoading ? "Loading..." : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
            {hasFilters && (
              <span className={`ml-2 ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                {appliedFilters.keyword && `"${appliedFilters.keyword}"`}
                {appliedFilters.location && ` · ${appliedFilters.location}`}
              </span>
            )}
          </p>
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className={`flex items-center gap-1.5 text-xs transition-colors ${isDark ? "text-slate-300 hover:text-red-400" : "text-gray-500 hover:text-red-500"}`}
            >
              <FilterX className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-24 text-red-500">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">{error}</p>
            <button onClick={fetchJobs} className="text-sm text-blue-600 hover:underline">Retry</button>
          </div>
        ) : jobs.length === 0 ? (
          <div className={`flex flex-col items-center gap-4 py-24 ${isDark ? "text-slate-400" : "text-gray-400"}`}>
            <Briefcase className="h-14 w-14 opacity-40" />
            <p className="text-sm">No jobs found</p>
            {hasFilters && (
              <button onClick={handleClearFilters} className="text-sm text-blue-600 hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onSave={handleSave}
                onUnsave={handleUnsave}
                onApply={handleApply}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDashboard;
