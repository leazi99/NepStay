import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  MapPin,
  Heart,
  AlertCircle,
  FilterX,
  ThumbsDown,
  ChevronDown,
  BadgeCheck,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import { JOB_TYPES } from "../../utils/data";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";

const EXPERIENCE_LEVELS = ["Entry Level", "Intermediate", "Expert"];
const BUDGET_RANGES = [
  { label: "Less than NPR 100", min: 0, max: 100 },
  { label: "NPR 100 to NPR 500", min: 100, max: 500 },
  { label: "NPR 500 - NPR 1K", min: 500, max: 1000 },
  { label: "NPR 1K - NPR 5K", min: 1000, max: 5000 },
  { label: "NPR 5K+", min: 5000, max: Infinity },
];

const JobListItem = ({ job, onSave, onUnsave, onApply, onDislike, nowTs, isDark }) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const companyName = job.company?.companyName || job.company?.name || "Company";
  const companySpent = job.company?.totalSpent || job.company?.spent || "";
  const experienceLevel = job.experienceLevel || job.level || "";
  const estimateBudget = Number(job.fixedBudget || job.salaryMax || job.salaryMin || 0);
  const proposalText =
    job.proposalsRange
    || (typeof job.proposalsCount === "number" ? `Proposals: ${job.proposalsCount}` : "")
    || (typeof job.proposalCount === "number" ? `Proposals: ${job.proposalCount}` : "");
  const tags = String(job.requirements || "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
  const normalizedStatus =
    job.applicationStatus === "Accepted" || job.applicationStatus === "Hired"
      ? "Accepted"
      : job.applicationStatus === "Rejected"
        ? "Rejected"
        : job.applicationStatus
          ? "Pending"
          : null;

  const postedText = () => {
    const diff = Math.max(nowTs - new Date(job.createdAt).getTime(), 0);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `Posted ${Math.max(minutes, 1)} minute${minutes === 1 ? "" : "s"} ago`;
    if (hours < 24) return `Posted ${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (days === 1) return "Posted yesterday";
    if (days < 7) return `Posted ${days} days ago`;
    const weeks = Math.floor(days / 7);
    return `Posted ${weeks} week${weeks === 1 ? "" : "s"} ago`;
  };

  const handleSaveToggle = async (event) => {
    event.stopPropagation();
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
      className={`rounded-2xl border p-5 sm:p-6 transition shadow-sm hover:shadow-md cursor-pointer ${
        isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
      }`}
      onClick={() => navigate(`/job/${job._id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{postedText()}</p>
          <h3 className={`mt-1 text-lg sm:text-xl font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>{job.title}</h3>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            {["Fixed-price", experienceLevel, `Est. Budget: NPR${estimateBudget.toLocaleString()}`]
              .filter(Boolean)
              .join(" - ")}
          </p>
        </div>
        <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
          <button
            onClick={() => onDislike(job._id)}
            className={`h-9 w-9 rounded-full inline-flex items-center justify-center transition ${
              isDark ? "text-slate-300 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
          <button
            onClick={handleSaveToggle}
            disabled={saving}
            className={`h-9 w-9 rounded-full inline-flex items-center justify-center transition ${
              isDark ? "text-slate-300 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Heart className={`h-4 w-4 ${job.isSaved ? "fill-current text-red-500" : ""}`} />
          </button>
        </div>
      </div>

      <p className={`mt-4 text-sm leading-6 ${isDark ? "text-slate-300" : "text-gray-700"}`}>{job.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={`${job._id}-tag-${index}`}
            className={`px-2.5 py-1 rounded-full text-xs ${
              isDark ? "bg-slate-800 text-slate-300" : "bg-gray-100 text-gray-700"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className={`mt-4 pt-4 border-t text-xs flex flex-wrap items-center gap-x-3 gap-y-2 ${isDark ? "border-slate-700 text-slate-400" : "border-gray-200 text-gray-500"}`}>
        <span className="inline-flex items-center gap-1">{companyName === "Company" ? "Enterprise" : companyName}</span>
        <span className="inline-flex items-center gap-1 text-blue-400"><BadgeCheck className="h-4 w-4" /> Payment verified</span>
        {companySpent ? <span>{companySpent}</span> : null}
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
      </div>

      {proposalText ? (
        <p className={`mt-3 text-xs ${isDark ? "text-slate-500" : "text-gray-500"}`}>{proposalText}</p>
      ) : null}

      <div className="mt-4" onClick={(event) => event.stopPropagation()}>
        {normalizedStatus ? (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              normalizedStatus === "Accepted"
                ? "bg-emerald-100 text-emerald-700"
                : normalizedStatus === "Rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {normalizedStatus}
          </span>
        ) : (
          <button
            onClick={() => onApply(job._id)}
            className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Apply
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
  const [nowTs] = useState(() => Date.now());
  const [dislikedJobIds, setDislikedJobIds] = useState([]);
  const isDark = (user?.themePreference || "light") === "dark";

  const dislikedStorageKey = `disliked_jobs_${user?._id || "guest"}`;

  const [filters, setFilters] = useState({
    keyword: "",
    selectedTypes: [],
    minSalary: "",
    maxSalary: "",
    experience: [],
    budgetRange: "",
    sortBy: "best",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    keyword: "",
    selectedTypes: [],
    minSalary: "",
    maxSalary: "",
    experience: [],
    budgetRange: "",
    sortBy: "best",
  });

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (appliedFilters.keyword) params.append("keyword", appliedFilters.keyword);
      if (appliedFilters.minSalary) params.append("minSalary", appliedFilters.minSalary);
      if (appliedFilters.maxSalary) params.append("maxSalary", appliedFilters.maxSalary);
      if (user?._id) params.append("userId", user._id);

      const response = await axiosInstance.get(`${API_PATHS.JOBS.GET_ALL_JOBS}?${params.toString()}`);
      if (!response.data.success) {
        setError(response.data.message || "Failed to load jobs");
        return;
      }

      let nextJobs = response.data.jobs || [];

      if (appliedFilters.selectedTypes.length > 0) {
        nextJobs = nextJobs.filter((job) =>
          appliedFilters.selectedTypes.includes(job.location),
        );
      }

      if (appliedFilters.budgetRange) {
        const range = BUDGET_RANGES.find((item) => item.label === appliedFilters.budgetRange);
        if (range) {
          nextJobs = nextJobs.filter((job) => {
            const avg = (Number(job.salaryMin || 0) + Number(job.salaryMax || 0)) / 2;
            return avg >= range.min && avg < range.max;
          });
        }
      }

      if (appliedFilters.sortBy === "newest" || appliedFilters.sortBy === "best") {
        nextJobs = nextJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      if (appliedFilters.sortBy === "salary_high") {
        nextJobs = nextJobs.sort((a, b) => Number(b.salaryMax || 0) - Number(a.salaryMax || 0));
      }
      if (appliedFilters.sortBy === "salary_low") {
        nextJobs = nextJobs.sort((a, b) => Number(a.salaryMin || 0) - Number(b.salaryMin || 0));
      }

      if (dislikedJobIds.length > 0) {
        nextJobs = nextJobs.filter((job) => !dislikedJobIds.includes(job._id));
      }

      setJobs(nextJobs);
    } catch {
      setError("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, dislikedJobIds, user?._id]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(dislikedStorageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      setDislikedJobIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setDislikedJobIds([]);
    }
  }, [dislikedStorageKey]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSave = async (jobId) => {
    if (!isAuthenticated) {
      toast.error("Login to save jobs");
      return;
    }
    try {
      const res = await axiosInstance.post(API_PATHS.JOBS.SAVE_JOB(jobId));
      if (res.data.success) {
        setJobs((prev) => prev.map((job) => (job._id === jobId ? { ...job, isSaved: true } : job)));
        toast.success("Job saved!");
      } else {
        toast.error(res.data.message || "Failed to save job");
      }
    } catch {
      toast.error("Failed to save job");
    }
  };

  const handleUnsave = async (jobId) => {
    if (!isAuthenticated) return;
    try {
      const res = await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
      if (res.data.success) {
        setJobs((prev) => prev.map((job) => (job._id === jobId ? { ...job, isSaved: false } : job)));
        toast.success("Removed from saved");
      }
    } catch {
      toast.error("Failed to unsave job");
    }
  };

  const handleApply = (jobId) => {
    if (!isAuthenticated) {
      toast.error("Please login to apply");
      navigate("/login");
      return;
    }
    navigate(`/job/${jobId}`);
  };

  const handleDislike = (jobId) => {
    if (dislikedJobIds.includes(jobId)) {
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      return;
    }

    const nextDisliked = [...dislikedJobIds, jobId];
    setDislikedJobIds(nextDisliked);
    localStorage.setItem(dislikedStorageKey, JSON.stringify(nextDisliked));
    setJobs((prev) => prev.filter((job) => job._id !== jobId));
    toast.success("Job removed from your feed");
  };

  const handleResetHiddenJobs = () => {
    setDislikedJobIds([]);
    localStorage.removeItem(dislikedStorageKey);
    toast.success("Hidden jobs restored");
  };

  const applyFilterChanges = () => {
    setAppliedFilters({ ...filters });
  };

  const clearAllFilters = () => {
    const reset = {
      keyword: "",
      selectedTypes: [],
      minSalary: "",
      maxSalary: "",
      experience: [],
      budgetRange: "",
      sortBy: "best",
    };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  const toggleType = (type) => {
    setFilters((prev) => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter((item) => item !== type)
        : [...prev.selectedTypes, type],
    }));
  };

  const toggleExperience = (level) => {
    setFilters((prev) => ({
      ...prev,
      experience: prev.experience.includes(level)
        ? prev.experience.filter((item) => item !== level)
        : [...prev.experience, level],
    }));
  };

  return (
    <div className={`${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"} min-h-screen`}>
      <FreelancerNavbar active="dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          <aside className={`lg:sticky lg:top-24 rounded-2xl border p-5 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
            <div className="space-y-5">
              <div>
                <p className={`text-xs uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Category</p>
                <select className={`w-full rounded-xl border px-3 py-2.5 text-sm ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-800"}`}>
                  <option>Select Categories</option>
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>Marketing</option>
                </select>
              </div>

              <div>
                <p className={`text-xs uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Experience level</p>
                <div className="space-y-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <label key={level} className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                      <input
                        type="checkbox"
                        checked={filters.experience.includes(level)}
                        onChange={() => toggleExperience(level)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className={`text-xs uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Job type</p>
                <div className="space-y-2">
                  {JOB_TYPES.map((type) => (
                    <label key={type.value} className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                      <input
                        type="checkbox"
                        checked={filters.selectedTypes.includes(type.value)}
                        onChange={() => toggleType(type.value)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className={`text-xs uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Budget</p>
                <div className="space-y-2">
                  {BUDGET_RANGES.map((range) => (
                    <label key={range.label} className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                      <input
                        type="radio"
                        name="budget-range"
                        checked={filters.budgetRange === range.label}
                        onChange={() => setFilters((prev) => ({ ...prev, budgetRange: range.label }))}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {range.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className={`text-xs uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Custom salary range</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={filters.minSalary}
                    onChange={(event) => setFilters((prev) => ({ ...prev, minSalary: event.target.value }))}
                    className={`rounded-xl border px-3 py-2 text-sm ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-800"}`}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={filters.maxSalary}
                    onChange={(event) => setFilters((prev) => ({ ...prev, maxSalary: event.target.value }))}
                    className={`rounded-xl border px-3 py-2 text-sm ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-800"}`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={applyFilterChanges}
                  className="flex-1 rounded-xl bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={clearAllFilters}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 rounded-xl border text-sm ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-100"}`}
                >
                  <FilterX className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            <div className={`rounded-2xl border p-4 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 max-w-2xl">
                  <div className="relative">
                    <Search className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-gray-400"}`} />
                    <input
                      type="text"
                      value={filters.keyword}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, keyword: event.target.value }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") applyFilterChanges();
                      }}
                      placeholder="Search"
                      className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm ${isDark ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {dislikedJobIds.length > 0 && (
                    <button
                      onClick={handleResetHiddenJobs}
                      className={`text-xs sm:text-sm px-3 py-2 rounded-lg border ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-100"}`}
                    >
                      Reset hidden jobs ({dislikedJobIds.length})
                    </button>
                  )}
                  <div className="relative">
                    <select
                      value={filters.sortBy}
                      onChange={(event) => {
                        setFilters((prev) => ({ ...prev, sortBy: event.target.value }));
                        setAppliedFilters((prev) => ({ ...prev, sortBy: event.target.value }));
                      }}
                      className={`appearance-none rounded-xl border py-2.5 pl-3 pr-8 text-sm ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-800"}`}
                    >
                      <option value="best">Sort by: Best Matches</option>
                      <option value="newest">Sort by: Newest</option>
                      <option value="salary_high">Sort by: Salary High</option>
                      <option value="salary_low">Sort by: Salary Low</option>
                    </select>
                    <ChevronDown className={`h-4 w-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-slate-400" : "text-gray-500"}`} />
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className={`rounded-2xl border p-10 flex justify-center ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-red-600" />
              </div>
            ) : error ? (
              <div className={`rounded-2xl border p-8 text-center ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
                <p className="text-red-500 mb-3">{error}</p>
                <button onClick={fetchJobs} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Retry</button>
              </div>
            ) : jobs.length === 0 ? (
              <div className={`rounded-2xl border p-8 text-center ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
                <p className={isDark ? "text-slate-300" : "text-gray-600"}>
                No jobs found for selected filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobListItem
                    key={job._id}
                    job={job}
                    onSave={handleSave}
                    onUnsave={handleUnsave}
                    onApply={handleApply}
                    onDislike={handleDislike}
                    nowTs={nowTs}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default JobDashboard;
