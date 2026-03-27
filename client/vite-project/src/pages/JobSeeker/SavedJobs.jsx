import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Heart,
  Building2,
  Wallet,
  Clock,
  MapPin,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";
import { useAuth } from "../../context/AuthContext";

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [unsavingId, setUnsavingId] = useState(null);
  const isDark = (user?.themePreference || "light") === "dark";

  const fetchSaved = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axiosInstance.get(API_PATHS.JOBS.GET_SAVED_JOBS);
      if (res.data.success) {
        setSavedJobs(res.data.savedJobs || []);
      } else {
        setError(res.data.message || "Failed to load saved jobs");
      }
    } catch {
      setError("Failed to load saved jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSaved(); }, []);

  const handleUnsave = async (jobId, savedId) => {
    setUnsavingId(savedId);
    try {
      const res = await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
      if (res.data.success) {
        toast.success("Removed from saved jobs");
        setSavedJobs((prev) => prev.filter((s) => s._id !== savedId));
      } else {
        toast.error(res.data.message || "Failed to remove");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUnsavingId(null);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      <FreelancerNavbar active="saved" />
      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 py-12 px-4 text-center">
        <h1 className="text-3xl font-bold text-white">Saved Jobs</h1>
        <p className="text-blue-100 text-sm mt-2">Jobs you've bookmarked for later</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-5">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-24 text-red-500">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">{error}</p>
            <button onClick={fetchSaved} className="text-sm text-blue-600 hover:underline">Retry</button>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className={`flex flex-col items-center gap-5 py-24 ${isDark ? "text-slate-400" : "text-gray-400"}`}>
            <Heart className="h-14 w-14 opacity-30" />
            <p className="text-sm">No saved jobs yet</p>
            <button
              onClick={() => navigate("/freelancer-dashboard")}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse Jobs <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-500"}`}>{savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}</p>
            {savedJobs.map((saved) => {
              const job = saved.job;
              if (!job) return null;
              const companyName = job.company?.companyName || job.company?.name || "Company";
              return (
                <div
                  key={saved._id}
                  className={`rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Company logo */}
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border ${isDark ? "bg-slate-700 border-slate-600" : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-100"}`}>
                      {job.company?.companyLogo ? (
                        <img src={job.company.companyLogo} alt={companyName} className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <Building2 className="h-5 w-5 text-blue-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>{job.title}</p>
                          <p className={`text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{companyName}</p>
                        </div>
                        <button
                          onClick={() => handleUnsave(job._id, saved._id)}
                          disabled={unsavingId === saved._id}
                          className={`p-2 rounded-xl text-red-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40 ${isDark ? "hover:bg-red-900/30" : "hover:bg-red-50"}`}
                          title="Remove from saved"
                        >
                          {unsavingId === saved._id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Heart className="h-5 w-5 fill-current" />
                          )}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                          <Wallet className="h-3 w-3" /> NPR {job.salaryMin?.toLocaleString()} – NPR {job.salaryMax?.toLocaleString()}/mo
                        </span>
                        <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600"}`}>
                          <Clock className="h-3 w-3" /> {job.duration}
                        </span>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => navigate(`/job/${job._id}`)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                          Apply Now <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/job/${job._id}`)}
                          className={`px-4 py-2 border text-xs font-medium rounded-xl transition-colors ${isDark ? "border-slate-600 text-slate-200 hover:bg-slate-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
