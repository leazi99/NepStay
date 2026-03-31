import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  Wallet,
  Clock,
  Briefcase,
  Heart,
  Building2,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  Star,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";

const statusConfig = {
  Pending: { label: "Application Pending", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  Accepted: { label: "Application Accepted ", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  Rejected: { label: "Application Rejected", cls: "bg-red-100 text-red-700 border border-red-200" },
};

const proposalStatusConfig = {
  pending: { label: "Proposal Pending", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  accepted: { label: "Proposal Accepted ", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  rejected: { label: "Proposal Rejected", cls: "bg-red-100 text-red-700 border border-red-200" },
};

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  const isDark = (user?.themePreference || "light") === "dark";

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [profileResumeUrl, setProfileResumeUrl] = useState("");
  const [proposalStatus, setProposalStatus] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);

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
    const fetchMyProposalStatus = async () => {
      if (!isAuthenticated || !user?._id) return;

      try {
        const response = await axiosInstance.get(API_PATHS.PROPOSALS.GET_MINE);
        if (!response.data?.success) return;

        const match = (response.data.proposals || []).find(
          (proposal) => String(proposal?.job?._id || proposal?.job) === String(jobId),
        );

        setProposalStatus(match?.status || "");
      } catch {
        setProposalStatus("");
      }
    };

    fetchMyProposalStatus();
  }, [isAuthenticated, jobId, user?._id]);

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

  const handleSubmitProposal = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to submit a proposal");
      navigate("/login");
      return;
    }

    const amount = Number(proposedAmount);
    if (!coverLetter.trim() || !Number.isFinite(amount) || amount <= 0) {
      toast.error("Please add a cover letter and valid proposal amount");
      return;
    }

    setSubmittingProposal(true);
    try {
      const response = await axiosInstance.post(API_PATHS.PROPOSALS.CREATE(jobId), {
        coverLetter: coverLetter.trim(),
        proposedAmount: amount,
      });

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to submit proposal");
        return;
      }

      setProposalStatus(response.data?.proposal?.status || "pending");
      setShowProposalModal(false);
      setCoverLetter("");
      setProposedAmount("");
      toast.success("Proposal submitted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit proposal");
    } finally {
      setSubmittingProposal(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-500 text-base">{error || "Job not found"}</p>
        <button onClick={() => navigate("/freelancer-dashboard")} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
          Back to Jobs
        </button>
      </div>
    );
  }

  const company = job.company;
  const companyName = company?.companyName || company?.name || "Company";
  const companyRatingAvg = Number(company?.ratingAvg || 0);
  const companyRatingCount = Number(company?.ratingCount || 0);

  return (
    <div className={`${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"} min-h-screen`}>
      <FreelancerNavbar active="dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/freelancer-dashboard")}
            className={`inline-flex items-center justify-center h-10 w-10 rounded-lg border transition ${isDark ? "border-slate-700 hover:bg-slate-800 text-slate-200" : "border-gray-200 hover:bg-gray-100 text-gray-700"}`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className={`text-xl sm:text-2xl font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>{job.title}</h1>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          {/* Job header card */}
          <div className={`rounded-2xl border p-5 sm:p-6 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
            <div className="flex items-start gap-4">
              <div className={`h-14 w-14 rounded-xl border flex items-center justify-center shrink-0 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
                {company?.companyLogo ? (
                  <img src={company.companyLogo} alt={companyName} className="h-full w-full object-cover rounded-xl" />
                ) : (
                  <Building2 className="h-7 w-7 text-blue-400" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className={`text-lg sm:text-xl font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>{job.title}</h2>
                <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{companyName}</p>
                <p className={`mt-1 text-xs inline-flex items-center gap-1.5 ${companyRatingCount > 0 ? "text-amber-500" : isDark ? "text-slate-400" : "text-gray-500"}`}>
                  <Star className={`h-3.5 w-3.5 ${companyRatingCount > 0 ? "fill-current" : ""}`} />
                  {companyRatingCount > 0
                    ? `${companyRatingAvg.toFixed(1)} client rating (${companyRatingCount} reviews)`
                    : "New client (no public reviews yet)"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${isDark ? "bg-slate-800 text-slate-200" : "bg-blue-50 text-blue-700"}`}>
                    <MapPin className="h-3 w-3" /> {job.jobLocation || "Location not specified"}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${isDark ? "bg-slate-800 text-slate-200" : "bg-indigo-50 text-indigo-700"}`}>
                    <Briefcase className="h-3 w-3" /> {job.location}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${isDark ? "bg-slate-800 text-slate-200" : "bg-emerald-50 text-emerald-700"}`}>
                    <Wallet className="h-3 w-3" /> NPR {job.salaryMin?.toLocaleString()} – NPR {job.salaryMax?.toLocaleString()}/mo
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${isDark ? "bg-slate-800 text-slate-200" : "bg-gray-100 text-gray-700"}`}>
                    <Clock className="h-3 w-3" /> {job.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
            <div>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 flex items-center gap-2 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                <FileText className="h-4 w-4 text-blue-500" /> Job Description
              </h3>
              <p className={`text-sm leading-6 whitespace-pre-line ${isDark ? "text-slate-300" : "text-gray-700"}`}>{job.description}</p>
            </div>
            <hr className={isDark ? "border-slate-700" : "border-gray-200"} />
            <div>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-2 flex items-center gap-2 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                <CheckCircle className="h-4 w-4 text-blue-500" /> Requirements
              </h3>
              <p className={`text-sm leading-6 whitespace-pre-line ${isDark ? "text-slate-300" : "text-gray-700"}`}>{job.requirements}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          {/* Application status */}
          {applicationStatus && (
            <div className={`px-3 py-2 rounded-xl text-sm font-medium ${statusConfig[applicationStatus]?.cls}`}>
              {statusConfig[applicationStatus]?.label}
            </div>
          )}

          {proposalStatus ? (
            <div className={`px-3 py-2 rounded-xl text-sm font-medium ${proposalStatusConfig[proposalStatus]?.cls}`}>
              {proposalStatusConfig[proposalStatus]?.label || "Proposal Submitted"}
            </div>
          ) : null}

          {/* Actions card */}
          <div className={`rounded-2xl border p-5 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
            <h3 className={`text-base font-semibold mb-3 ${isDark ? "text-slate-100" : "text-gray-900"}`}>Apply for this role</h3>
            {!applicationStatus ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                Apply Now
              </button>
            ) : (
              <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>You have already applied.</p>
            )}
            {!proposalStatus ? (
              <button
                onClick={() => setShowProposalModal(true)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white py-2.5 text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                Submit Proposal
              </button>
            ) : (
              <p className={`mt-3 text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>You already submitted a proposal for this job.</p>
            )}
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className={`mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors ${isSaved ? "bg-red-50 border-red-200 text-red-600" : isDark ? "border-slate-700 text-slate-200 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
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
          <div className={`rounded-2xl border p-5 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
            <h3 className={`text-base font-semibold mb-3 ${isDark ? "text-slate-100" : "text-gray-900"}`}>About the Company</h3>
            <p className={`font-medium ${isDark ? "text-slate-200" : "text-gray-900"}`}>{companyName}</p>
            <p className={`mt-1 text-xs inline-flex items-center gap-1.5 ${companyRatingCount > 0 ? "text-amber-500" : isDark ? "text-slate-400" : "text-gray-500"}`}>
              <Star className={`h-3.5 w-3.5 ${companyRatingCount > 0 ? "fill-current" : ""}`} />
              {companyRatingCount > 0
                ? `${companyRatingAvg.toFixed(1)} rating from ${companyRatingCount} reviews`
                : "No public rating yet"}
            </p>
            {company?._id ? (
              <button
                onClick={() =>
                  navigate(
                    `/client-reviews?userId=${company._id}&name=${encodeURIComponent(
                      companyName,
                    )}`,
                  )
                }
                className="mt-2 text-xs text-blue-500 hover:text-blue-600 hover:underline"
              >
                View all client reviews
              </button>
            ) : null}
            {company?.companyDescription && (
              <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                {company.companyDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 ${isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-900"}`}>
            <h3 className="text-lg font-semibold">Apply for {job.title}</h3>
            <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>
              {profileResumeUrl
                ? "Your saved resume will be used. You can upload a new one to replace it."
                : "Upload your resume from your device to submit this application."}
            </p>
            {profileResumeUrl ? (
              <div className={`mt-3 rounded-lg p-3 text-sm flex items-center justify-between gap-3 ${isDark ? "bg-slate-800 text-slate-200" : "bg-blue-50 text-blue-700"}`}>
                <span>Saved resume found in your profile.</span>
                <a href={profileResumeUrl} target="_blank" rel="noreferrer" className="underline font-medium">
                  View current resume
                </a>
              </div>
            ) : null}
            <div className="mt-4">
              <label className={`block mb-1.5 text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                {profileResumeUrl ? "Replace Resume (Optional)" : "Resume (PDF, DOC, DOCX)"}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className={`w-full rounded-xl border px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-white file:text-xs file:font-medium hover:file:bg-red-700 ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-900"}`}
              />
              {resumeFile ? (
                <p className={`mt-2 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Selected: {resumeFile.name}</p>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowApplyModal(false)}
                className={`px-4 py-2 rounded-lg text-sm border ${isDark ? "border-slate-700 text-slate-200 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-100"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-70"
              >
                {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className={`w-full max-w-xl rounded-2xl border p-5 sm:p-6 ${isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-900"}`}>
            <h3 className="text-lg font-semibold">Submit Proposal for {job.title}</h3>
            <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>
              Add a short cover letter and your proposed amount.
            </p>

            <div className="mt-4">
              <label className={`block mb-1.5 text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                rows={5}
                placeholder="Explain why you are a good fit for this job"
                className={`w-full rounded-xl border px-3 py-2 text-sm resize-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
              />
            </div>

            <div className="mt-4">
              <label className={`block mb-1.5 text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                Proposed Amount (NPR)
              </label>
              <input
                type="number"
                min="1"
                value={proposedAmount}
                onChange={(event) => setProposedAmount(event.target.value)}
                placeholder="Enter your amount"
                className={`w-full rounded-xl border px-3 py-2 text-sm ${isDark ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500" : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowProposalModal(false)}
                className={`px-4 py-2 rounded-lg text-sm border ${isDark ? "border-slate-700 text-slate-200 hover:bg-slate-800" : "border-gray-200 text-gray-700 hover:bg-gray-100"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitProposal}
                disabled={submittingProposal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-70"
              >
                {submittingProposal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submittingProposal ? "Submitting..." : "Submit Proposal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
