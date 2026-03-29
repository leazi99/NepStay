import React, { useState, useEffect, useCallback } from "react";
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
  Search,
  SlidersHorizontal,
  BadgeDollarSign,
  Send,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const STATUS_OPTIONS = ["Pending", "Accepted", "Rejected"];
const PROPOSAL_STATUS_OPTIONS = ["accepted", "rejected"];

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

const proposalBadgeClassMap = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  accepted: "bg-green-50 text-green-700 border border-green-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

const ApplicationView = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("applications");

  const fetchPageData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const [applicationsRes, proposalsRes, jobRes] = await Promise.all([
        axiosInstance.get(API_PATHS.APPLICATIONS.GET_APPLICATIONS_FOR_JOB(jobId)),
        axiosInstance.get(API_PATHS.PROPOSALS.GET_FOR_JOB(jobId)),
        axiosInstance.get(API_PATHS.JOBS.GET_JOB_BY_ID(jobId)),
      ]);

      if (applicationsRes.data.success) {
        setApplications(applicationsRes.data.applications || []);
      } else {
        setApplications([]);
      }

      if (proposalsRes.data.success) {
        setProposals(proposalsRes.data.proposals || []);
      } else {
        setProposals([]);
      }

      if (jobRes.data.success) {
        setJobTitle(jobRes.data.job?.title || "");
      }

      if (!applicationsRes.data.success && !proposalsRes.data.success) {
        setError(
          applicationsRes.data.message ||
            proposalsRes.data.message ||
            "Failed to load candidates",
        );
      }
    } catch {
      setError("Failed to load candidates");
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  useEffect(() => {
    setStatusFilter("all");
  }, [activeTab]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const res = await axiosInstance.put(API_PATHS.APPLICATIONS.UPDATE_STATUS(appId), {
        status: newStatus,
      });

      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setApplications((prev) =>
          prev.map((application) =>
            application._id === appId
              ? { ...application, status: newStatus }
              : application,
          ),
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

  const handleProposalStatusChange = async (proposalId, newStatus) => {
    setUpdatingId(proposalId);
    try {
      const res = await axiosInstance.patch(
        API_PATHS.PROPOSALS.UPDATE_STATUS(proposalId),
        { status: newStatus },
      );

      if (res.data.success) {
        toast.success(`Proposal marked as ${newStatus}`);
        setProposals((prev) =>
          prev.map((proposal) =>
            proposal._id === proposalId
              ? { ...proposal, status: newStatus }
              : proposal,
          ),
        );
      } else {
        toast.error(res.data.message || "Failed to update proposal status");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateValue) =>
    new Date(dateValue).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const filteredApplications = applications
    .filter((application) => {
      const query = searchQuery.trim().toLowerCase();
      const applicantName = String(application.applicant?.name || "").toLowerCase();
      const applicantEmail = String(application.applicant?.email || "").toLowerCase();
      const queryMatch = !query || applicantName.includes(query) || applicantEmail.includes(query);
      const statusMatch =
        statusFilter === "all" || application.status === statusFilter;

      return queryMatch && statusMatch;
    })
    .sort((first, second) => {
      if (sortBy === "oldest") {
        return new Date(first.createdAt) - new Date(second.createdAt);
      }
      if (sortBy === "name") {
        return String(first.applicant?.name || "").localeCompare(
          String(second.applicant?.name || ""),
        );
      }
      return new Date(second.createdAt) - new Date(first.createdAt);
    });

  const filteredProposals = proposals
    .filter((proposal) => {
      const query = searchQuery.trim().toLowerCase();
      const freelancerName = String(proposal.freelancer?.name || "").toLowerCase();
      const freelancerEmail = String(proposal.freelancer?.email || "").toLowerCase();
      const proposalStatus = String(proposal.status || "pending").toLowerCase();
      const queryMatch = !query || freelancerName.includes(query) || freelancerEmail.includes(query);
      const statusMatch = statusFilter === "all" || proposalStatus === statusFilter;

      return queryMatch && statusMatch;
    })
    .sort((first, second) => {
      if (sortBy === "oldest") {
        return new Date(first.createdAt) - new Date(second.createdAt);
      }
      if (sortBy === "name") {
        return String(first.freelancer?.name || "").localeCompare(
          String(second.freelancer?.name || ""),
        );
      }
      return new Date(second.createdAt) - new Date(first.createdAt);
    });

  const renderApplicationCard = (application) => {
    const cfg = statusConfig[application.status] || statusConfig.Pending;
    const initials = application.applicant?.name?.[0]?.toUpperCase() || "?";

    return (
      <div
        key={application._id}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
            {application.applicant?.avatar ? (
              <img
                src={application.applicant.avatar}
                alt={application.applicant.name}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <span className="text-base font-bold text-blue-600">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {application.applicant?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">{application.applicant?.email || "—"}</p>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>
                {cfg.icon}
                {cfg.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Applied {formatDate(application.createdAt)}
              </span>
              {application.applicant?._id ? (
                <button
                  onClick={() => navigate(`/freelancer/${application.applicant._id}`)}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View Profile
                </button>
              ) : null}
              {application.resume ? (
                <a
                  href={application.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View Resume
                </a>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(application._id, status)}
                  disabled={updatingId === application._id || application.status === status}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    application.status === status
                      ? status === "Accepted"
                        ? "bg-green-600 text-white"
                        : status === "Rejected"
                          ? "bg-red-600 text-white"
                          : "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5`}
                >
                  {updatingId === application._id && application.status !== status ? (
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
  };

  const renderProposalCard = (proposal) => {
    const freelancerName = proposal.freelancer?.name || "Unknown";
    const initials = freelancerName[0]?.toUpperCase() || "?";
    const normalizedStatus = String(proposal.status || "pending").toLowerCase();
    const badgeClass = proposalBadgeClassMap[normalizedStatus] || proposalBadgeClassMap.pending;

    return (
      <div
        key={proposal._id}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
            {proposal.freelancer?.avatar ? (
              <img
                src={proposal.freelancer.avatar}
                alt={freelancerName}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <span className="text-base font-bold text-emerald-700">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">{freelancerName}</p>
                <p className="text-sm text-gray-500">{proposal.freelancer?.email || "—"}</p>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                <BadgeDollarSign className="h-3.5 w-3.5" />
                {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Submitted {formatDate(proposal.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                NPR {Number(proposal.proposedAmount || 0).toLocaleString()}
              </span>
            </div>

            {proposal.coverLetter ? (
              <p className="mt-3 text-sm text-gray-700 leading-6 whitespace-pre-line">
                {proposal.coverLetter}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 mt-4">
              {PROPOSAL_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => handleProposalStatusChange(proposal._id, status)}
                  disabled={updatingId === proposal._id || normalizedStatus === status}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    normalizedStatus === status
                      ? status === "accepted"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5`}
                >
                  {updatingId === proposal._id && normalizedStatus !== status ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  {status === "accepted" ? "Accept" : "Reject"}
                </button>
              ))}

              {proposal.freelancer?._id ? (
                <button
                  onClick={() => navigate(`/freelancer/${proposal.freelancer._id}`)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  View Profile
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentList = activeTab === "applications" ? filteredApplications : filteredProposals;
  const totalCount = activeTab === "applications" ? applications.length : proposals.length;

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/manage-jobs")}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applicants & Proposals</h1>
            {jobTitle ? (
              <p className="text-sm text-gray-500 mt-0.5">
                For: <span className="font-medium text-gray-700">{jobTitle}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-2 inline-flex items-center gap-2">
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "applications"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab("proposals")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "proposals"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Proposals ({proposals.length})
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-500">
            <AlertCircle className="h-10 w-10" />
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchPageData}
              className="text-blue-600 text-sm hover:underline"
            >
              Retry
            </button>
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 py-20 gap-4 text-gray-400">
            {activeTab === "applications" ? (
              <Users className="h-14 w-14 opacity-40" />
            ) : (
              <Send className="h-14 w-14 opacity-40" />
            )}
            <p className="text-sm">
              {activeTab === "applications"
                ? "No applicants yet for this job"
                : "No proposals submitted for this job yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={
                    activeTab === "applications"
                      ? "Search by applicant name or email"
                      : "Search by freelancer name or email"
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                </span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="all">All status</option>
                  {activeTab === "applications" ? (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </>
                  )}
                </select>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Showing {currentList.length} of {totalCount} {activeTab === "applications" ? "applicant" : "proposal"}
              {totalCount !== 1 ? "s" : ""}
            </p>

            {currentList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center text-gray-500 text-sm">
                {activeTab === "applications"
                  ? "No applicants match your current filters."
                  : "No proposals match your current filters."}
              </div>
            ) : activeTab === "applications" ? (
              filteredApplications.map(renderApplicationCard)
            ) : (
              filteredProposals.map(renderProposalCard)
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationView;
