import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Heart,
  Building2,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";

const statusConfig = {
  Pending: { label: "Application Pending", cls: "bg-amber-50 border-amber-200 text-amber-700" },
  Accepted: { label: "Application Accepted 🎉", cls: "bg-green-50 border-green-200 text-green-700" },
  Rejected: { label: "Application Rejected", cls: "bg-red-50 border-red-200 text-red-600" },
};

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [profileResumeUrl, setProfileResumeUrl] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);
        const params = user?._id ? `?userId=${user._id}` : "";
        const res = await axiosInstance.get(`${API_PATHS.JOBS.GET_JOB_BY_ID(jobId)}${params}`);
        if (res.data.success) {
          setJob(res.data.job);
          setApplicationStatus(res.data.job.applicationStatus);
        } else {
          setError("Job not found");
        }
      } catch {
        setError("Failed to load job");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId, user?._id]);

  useEffect(() => {
    setProfileResumeUrl(user?.resume || "");
  }, [user?.resume]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) { toast.error("Please login to save"); return; }
    setSaving(true);
    try {
      if (isSaved) {
        await axiosInstance.delete(API_PATHS.JOBS.UNSAVE_JOB(jobId));
        setIsSaved(false);
        toast.success("Removed from saved");
      } else {
        const res = await axiosInstance.post(API_PATHS.JOBS.SAVE_JOB(jobId));
        if (res.data.success) { setIsSaved(true); toast.success("Job saved!"); }
        else toast.error(res.data.message || "Already saved");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) { toast.error("Please login to apply"); navigate("/login"); return; }

    if (!resumeFile && !profileResumeUrl) {
      toast.error("Please select your resume file before applying");
      return;
    }

    setApplying(true);
    try {
      let finalResumeUrl = profileResumeUrl;

      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume", resumeFile);

        const uploadRes = await axiosInstance.post(API_PATHS.AUTH.UPLOAD_RESUME, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (!uploadRes.data.success || !uploadRes.data.resumeUrl) {
          toast.error(uploadRes.data.message || "Failed to upload resume");
          return;
        }

        finalResumeUrl = uploadRes.data.resumeUrl;
      }

      const res = await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_TO_JOB, {
        jobId,
        resume: finalResumeUrl,
      });
      if (res.data.success) {
        toast.success("Applied successfully!");
        setApplicationStatus("Pending");
        if (finalResumeUrl) {
          setProfileResumeUrl(finalResumeUrl);
          updateUser({ resume: finalResumeUrl });
        }
        setResumeFile(null);
        setShowApplyModal(false);
      } else {
        toast.error(res.data.message || "Failed to apply");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-red-500">
        <AlertCircle className="h-12 w-12" />
        <p className="text-base">{error || "Job not found"}</p>
        <button onClick={() => navigate("/freelancer-dashboard")} className="text-sm text-blue-600 hover:underline">
          Back to Jobs
        </button>
      </div>
    );
  }

  const company = job.company;
  const companyName = company?.companyName || company?.name || "Company";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/freelancer-dashboard")}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900 truncate">{job.title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-100 overflow-hidden">
                {company?.companyLogo ? (
                  <img src={company.companyLogo} alt={companyName} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-7 w-7 text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{companyName}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                    <DollarSign className="h-3 w-3" /> ${job.salaryMin?.toLocaleString()} – ${job.salaryMax?.toLocaleString()}/mo
                  </span>
                  <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    <Clock className="h-3 w-3" /> {job.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" /> Job Description
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
            <hr className="border-gray-100" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" /> Requirements
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.requirements}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Application status */}
          {applicationStatus && (
            <div className={`rounded-2xl border p-4 text-sm font-medium ${statusConfig[applicationStatus]?.cls}`}>
              {statusConfig[applicationStatus]?.label}
            </div>
          )}

          {/* Actions card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Apply for this role</h3>
            {!applicationStatus ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Send className="h-4 w-4" />
                Apply Now
              </button>
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">You have already applied.</p>
            )}
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-colors border ${isSaved
                  ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              )}
              {isSaved ? "Saved" : "Save Job"}
            </button>
          </div>

          {/* Company info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">About the Company</h3>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{companyName}</p>
            {company?.companyDescription && (
              <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-4">
                {company.companyDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Apply for {job.title}</h3>
            <p className="text-sm text-gray-500">
              {profileResumeUrl
                ? "Your saved resume will be used. You can upload a new one to replace it."
                : "Upload your resume from your device to submit this application."}
            </p>
            {profileResumeUrl ? (
              <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                <span>Saved resume found in your profile.</span>
                <a
                  href={profileResumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                >
                  View current resume
                </a>
              </div>
            ) : null}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                {profileResumeUrl ? "Replace Resume (Optional)" : "Resume (PDF, DOC, DOCX)"}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {resumeFile ? (
                <p className="text-xs text-gray-500 mt-1.5">Selected: {resumeFile.name}</p>
              ) : null}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
