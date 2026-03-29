import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  Briefcase,
  Building2,
  BadgeDollarSign,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
  accepted: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
};

const MyProposals = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isDark = (user?.themePreference || "light") === "dark";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [proposals, setProposals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const statusParam = String(searchParams.get("status") || "all").toLowerCase();
    const allowedStatuses = ["all", "pending", "accepted", "rejected"];
    setStatusFilter(allowedStatuses.includes(statusParam) ? statusParam : "all");
  }, [searchParams]);

  const handleStatusFilterChange = (nextStatus) => {
    const normalizedStatus = String(nextStatus || "all").toLowerCase();
    setStatusFilter(normalizedStatus);

    const nextParams = new URLSearchParams(searchParams);
    if (normalizedStatus === "all") {
      nextParams.delete("status");
    } else {
      nextParams.set("status", normalizedStatus);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const fetchProposals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axiosInstance.get(API_PATHS.PROPOSALS.GET_MINE);
      if (!response.data?.success) {
        setError(response.data?.message || "Failed to load proposals");
        return;
      }

      setProposals(response.data.proposals || []);
    } catch {
      setError("Failed to load proposals");
      toast.error("Could not fetch proposals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const filteredProposals = useMemo(() => {
    return proposals
      .filter((proposal) => {
        const query = searchQuery.trim().toLowerCase();
        const title = String(proposal?.job?.title || "").toLowerCase();
        const companyName = String(
          proposal?.job?.company?.companyName || proposal?.job?.company?.name || "",
        ).toLowerCase();
        const status = String(proposal?.status || "pending").toLowerCase();

        const queryMatch = !query || title.includes(query) || companyName.includes(query);
        const statusMatch = statusFilter === "all" || status === statusFilter;

        return queryMatch && statusMatch;
      })
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
  }, [proposals, searchQuery, statusFilter]);

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className={`${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"} min-h-screen`}>
      <FreelancerNavbar active="proposals" />

      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/freelancer-dashboard")}
            className={`inline-flex items-center justify-center h-10 w-10 rounded-lg border transition ${
              isDark
                ? "border-slate-700 hover:bg-slate-800 text-slate-200"
                : "border-gray-200 hover:bg-gray-100 text-gray-700"
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
              My Proposals
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              Track all proposals you submitted.
            </p>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 mb-4 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-gray-400"}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by job title or company"
                className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400"
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => handleStatusFilterChange(event.target.value)}
              className={`rounded-xl border py-2.5 px-3 text-sm ${
                isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-gray-200 text-gray-800"
              }`}
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className={`rounded-2xl border p-10 flex justify-center ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : error ? (
          <div className={`rounded-2xl border p-8 text-center ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
            <p className="text-red-500 mb-3">{error}</p>
            <button
              onClick={fetchProposals}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className={`rounded-2xl border p-8 text-center ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
            <p className={isDark ? "text-slate-300" : "text-gray-600"}>No proposals found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => {
              const companyName =
                proposal?.job?.company?.companyName ||
                proposal?.job?.company?.name ||
                "Company";
              const normalizedStatus = String(proposal?.status || "pending").toLowerCase();

              return (
                <div
                  key={proposal._id}
                  className={`rounded-2xl border p-5 sm:p-6 ${
                    isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                        {proposal?.job?.title || "Untitled Job"}
                      </h3>
                      <p className={`mt-1 text-sm inline-flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                        <Building2 className="h-3.5 w-3.5" />
                        {companyName}
                      </p>
                    </div>

                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[normalizedStatus] || statusStyles.pending}`}>
                      {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
                    </span>
                  </div>

                  <div className={`mt-4 text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    <p className="whitespace-pre-line">{proposal.coverLetter}</p>
                  </div>

                  <div className={`mt-4 pt-4 border-t flex flex-wrap items-center gap-4 text-xs ${isDark ? "border-slate-700 text-slate-400" : "border-gray-200 text-gray-500"}`}>
                    <span className="inline-flex items-center gap-1">
                      <BadgeDollarSign className="h-3.5 w-3.5" />
                      NPR {Number(proposal.proposedAmount || 0).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Submitted {formatDate(proposal.createdAt)}
                    </span>
                  </div>

                  {proposal?.job?._id ? (
                    <div className="mt-4">
                      <button
                        onClick={() => navigate(`/job/${proposal.job._id}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        <Briefcase className="h-4 w-4" />
                        View Job
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProposals;
