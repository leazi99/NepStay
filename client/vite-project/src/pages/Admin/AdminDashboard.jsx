import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Wallet,
  Briefcase,
  Trash2,
  BarChart3,
  Loader2,
  RefreshCw,
  ShieldCheck,
  CircleDollarSign,
  Search,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";

const MetricCard = ({ title, value, icon: Icon, isDark }) => (
  <div
    className={`rounded-2xl border p-4 sm:p-5 transition-all hover:-translate-y-0.5 ${
      isDark
        ? "border-slate-700 bg-slate-900/80 hover:bg-slate-900"
        : "border-gray-200 bg-white shadow-sm hover:shadow-md"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className={`text-xs uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-500"}`}>
          {title}
        </p>
        <p className={`mt-2 text-2xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
          {Number(value || 0).toLocaleString()}
        </p>
      </div>
      <span
        className={`h-10 w-10 rounded-xl inline-flex items-center justify-center ${
          isDark ? "bg-slate-800" : "bg-blue-50"
        }`}
      >
        <Icon className={`h-5 w-5 ${isDark ? "text-blue-300" : "text-blue-600"}`} />
      </span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const isDark = (user?.themePreference || "light") === "dark";

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [reports, setReports] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("reports");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [deletingJobId, setDeletingJobId] = useState("");
  const [updatingPaymentId, setUpdatingPaymentId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [activityLogs, setActivityLogs] = useState([]);
  const [suspensionDaysInput, setSuspensionDaysInput] = useState({});
  const [suspensionReasonInput, setSuspensionReasonInput] = useState({});

  const pushActivity = (message) => {
    setActivityLogs((prev) =>
      [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          message,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20),
    );
  };

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const usersParams = new URLSearchParams();
      if (userSearch.trim()) usersParams.set("search", userSearch.trim());
      if (userRoleFilter !== "all") usersParams.set("role", userRoleFilter);

      const paymentsParams = new URLSearchParams();
      if (paymentSearch.trim()) paymentsParams.set("search", paymentSearch.trim());
      if (paymentStatusFilter !== "all") {
        paymentsParams.set("status", paymentStatusFilter);
      }

      const jobsParams = new URLSearchParams();
      if (jobSearch.trim()) jobsParams.set("search", jobSearch.trim());
      if (jobStatusFilter !== "all") {
        jobsParams.set("status", jobStatusFilter);
      }

      const [overviewRes, reportsRes, usersRes, jobsRes, paymentsRes] = await Promise.all([
        axiosInstance.get(API_PATHS.ADMIN.OVERVIEW),
        axiosInstance.get(API_PATHS.ADMIN.REPORTS),
        axiosInstance.get(
          `${API_PATHS.ADMIN.GET_USERS}${usersParams.toString() ? `?${usersParams.toString()}` : ""}`,
        ),
        axiosInstance.get(
          `${API_PATHS.ADMIN.GET_JOBS}${jobsParams.toString() ? `?${jobsParams.toString()}` : ""}`,
        ),
        axiosInstance.get(
          `${API_PATHS.ADMIN.GET_PAYMENTS}${paymentsParams.toString() ? `?${paymentsParams.toString()}` : ""}`,
        ),
      ]);

      if (
        !overviewRes.data.success ||
        !reportsRes.data.success ||
        !usersRes.data.success ||
        !jobsRes.data.success ||
        !paymentsRes.data.success
      ) {
        toast.error("Failed to load admin data");
        return;
      }

      setOverview(overviewRes.data.counts || null);
      setReports(reportsRes.data.reports || null);
      setUsers(usersRes.data.users || []);
      setJobs(jobsRes.data.jobs || []);
      setPayments(paymentsRes.data.payments || []);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [
    userSearch,
    userRoleFilter,
    jobSearch,
    jobStatusFilter,
    paymentSearch,
    paymentStatusFilter,
  ]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const updateUserField = async (userId, payload) => {
    setUpdatingUserId(userId);
    try {
      const response = await axiosInstance.put(API_PATHS.ADMIN.UPDATE_USER(userId), payload);
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to update user");
        return;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item._id === userId
            ? {
                ...item,
                ...(response.data?.user || {}),
                ...(response.data?.user
                  ? {}
                  : {
                      ...(payload.role ? { role: payload.role } : {}),
                      ...(payload.identityVerificationStatus
                        ? { identityVerificationStatus: payload.identityVerificationStatus }
                        : {}),
                    }),
              }
            : item,
        ),
      );

      if (payload.role) {
        pushActivity(`Updated role for ${userId} to ${payload.role}`);
      }
      if (payload.identityVerificationStatus) {
        pushActivity(`Updated verification for ${userId} to ${payload.identityVerificationStatus}`);
      }
      if (payload.suspensionDays) {
        pushActivity(`Suspended user ${userId} for ${payload.suspensionDays} day(s)`);
      }
      if (payload.clearSuspension) {
        pushActivity(`Removed suspension for user ${userId}`);
      }

      setSuspensionDaysInput((prev) => ({
        ...prev,
        [userId]: "",
      }));

      if (payload.suspensionDays || payload.clearSuspension) {
        setSuspensionReasonInput((prev) => ({
          ...prev,
          [userId]: "",
        }));
      }

      toast.success("User updated");
    } catch {
      toast.error("Failed to update user");
    } finally {
      setUpdatingUserId("");
    }
  };

  const updatePaymentStatus = async (paymentId, status) => {
    setUpdatingPaymentId(paymentId);
    try {
      const response = await axiosInstance.put(API_PATHS.ADMIN.UPDATE_PAYMENT_STATUS(paymentId), {
        status,
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to update payment");
        return;
      }

      setPayments((prev) => prev.map((item) => (item._id === paymentId ? { ...item, status } : item)));
      pushActivity(`Updated payment ${paymentId} status to ${status}`);
      toast.success("Payment updated");
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setUpdatingPaymentId("");
    }
  };

  const deleteUser = async (userId, name) => {
    const confirmed = window.confirm(
      `Delete user ${name}? This action removes related jobs, applications, proposals, payments, reviews, chats and notifications.`,
    );

    if (!confirmed) return;

    setDeletingUserId(userId);
    try {
      const response = await axiosInstance.delete(API_PATHS.ADMIN.DELETE_USER(userId));

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to delete user");
        return;
      }

      setUsers((prev) => prev.filter((item) => item._id !== userId));
      pushActivity(`Deleted user ${name}`);
      toast.success("User deleted");
      await fetchAdminData();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeletingUserId("");
    }
  };

  const deleteJob = async (jobId, title) => {
    const confirmed = globalThis.confirm(
      `Delete job ${title}? This action removes related proposals, applications, payments, reviews and saved jobs.`,
    );

    if (!confirmed) return;

    setDeletingJobId(jobId);
    try {
      const response = await axiosInstance.delete(API_PATHS.ADMIN.DELETE_JOB(jobId));

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to delete job");
        return;
      }

      setJobs((prev) => prev.filter((item) => item._id !== jobId));
      pushActivity(`Deleted job ${title}`);
      toast.success("Job deleted");
      await fetchAdminData();
    } catch {
      toast.error("Failed to delete job");
    } finally {
      setDeletingJobId("");
    }
  };

  const derivedStats = useMemo(() => {
    const pendingVerifications = users.filter(
      (item) => (item.identityVerificationStatus || "not_submitted") === "pending",
    ).length;
    const verifiedUsers = users.filter(
      (item) => (item.identityVerificationStatus || "not_submitted") === "verified",
    ).length;
    const pendingPayments = payments.filter((item) => item.status === "pending").length;
    const completedPayments = payments.filter((item) => item.status === "completed").length;
    const openJobs = jobs.filter((item) => !item.isClosed).length;
    const closedJobs = jobs.filter((item) => item.isClosed).length;

    return {
      pendingVerifications,
      verifiedUsers,
      pendingPayments,
      completedPayments,
      openJobs,
      closedJobs,
    };
  }, [users, payments, jobs]);

  const getSuspensionStatus = (suspensionEndsAt) => {
    if (!suspensionEndsAt) {
      return {
        active: false,
        label: "Active",
        textClass: isDark ? "text-emerald-300" : "text-emerald-700",
      };
    }

    const endTs = new Date(suspensionEndsAt).getTime();
    if (!Number.isFinite(endTs) || endTs <= Date.now()) {
      return {
        active: false,
        label: "Active",
        textClass: isDark ? "text-emerald-300" : "text-emerald-700",
      };
    }

    return {
      active: true,
      label: `Suspended until ${new Date(endTs).toLocaleString()}`,
      textClass: isDark ? "text-amber-300" : "text-amber-700",
    };
  };

  const getVerificationBadgeClass = (status) => {
    if (status === "verified") {
      return isDark
        ? "bg-emerald-900/40 text-emerald-300 border-emerald-700"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (status === "pending") {
      return isDark
        ? "bg-amber-900/40 text-amber-300 border-amber-700"
        : "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (status === "rejected") {
      return isDark
        ? "bg-rose-900/40 text-rose-300 border-rose-700"
        : "bg-rose-50 text-rose-700 border-rose-200";
    }

    return isDark
      ? "bg-slate-800 text-slate-300 border-slate-700"
      : "bg-gray-50 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
        <div
          className={`rounded-2xl px-6 py-5 border flex items-center gap-3 ${
            isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200 bg-white text-gray-700"
          }`}
        >
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-10 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className={`sticky top-0 z-10 border-b backdrop-blur ${isDark ? "border-slate-700 bg-slate-900/85" : "border-gray-200 bg-white/90"}`}>
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Admin Dashboard</h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              Manage users, jobs, payments, and system reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Total Users" value={overview?.totalUsers} icon={Users} isDark={isDark} />
          <MetricCard
            title="Total Jobs"
            value={reports?.jobs?.total ?? jobs.length}
            icon={Briefcase}
            isDark={isDark}
          />
          <MetricCard
            title="Pending Verifications"
            value={derivedStats.pendingVerifications}
            icon={ShieldCheck}
            isDark={isDark}
          />
          <MetricCard
            title="Total Payments"
            value={overview?.totalPayments}
            icon={Wallet}
            isDark={isDark}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
            <p className={`text-xs uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-500"}`}>Users split</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className={`rounded-xl p-3 ${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Jobseekers</p>
                <p className={`text-lg font-semibold mt-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                  {Number(overview?.totalJobseekers || 0).toLocaleString()}
                </p>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Employers</p>
                <p className={`text-lg font-semibold mt-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                  {Number(overview?.totalEmployers || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
            <p className={`text-xs uppercase tracking-wide flex items-center gap-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              <BarChart3 className="h-3.5 w-3.5" />
              System reports
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className={`rounded-xl p-3 ${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Open Jobs</p>
                <p className={`text-lg font-semibold mt-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                  {Number(reports?.jobs?.open ?? derivedStats.openJobs).toLocaleString()}
                </p>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Closed Jobs</p>
                <p className={`text-lg font-semibold mt-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                  {Number(reports?.jobs?.closed ?? derivedStats.closedJobs).toLocaleString()}
                </p>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Completed Revenue</p>
                <p className={`text-lg font-semibold mt-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                  NPR {Number(reports?.payments?.completedRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Avg Review</p>
                <p className={`text-lg font-semibold mt-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                  <span className="inline-flex items-center gap-1">
                    <CircleDollarSign className="h-4 w-4" />
                    {Number(reports?.reviews?.averageRating || 0).toFixed(2)} / 5
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-4 ${
              isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"
            } lg:col-span-2`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                Recent Admin Activity
              </h2>
              <button
                onClick={() => setActivityLogs([])}
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Clear
              </button>
            </div>

            {activityLogs.length === 0 ? (
              <div className={`mt-3 rounded-xl border p-6 text-center text-sm ${isDark ? "border-slate-700 text-slate-400" : "border-gray-200 text-gray-500"}`}>
                No admin actions yet in this session.
              </div>
            ) : (
              <ul className={`mt-3 space-y-2 max-h-44 overflow-auto pr-1 ${isDark ? "text-slate-200" : "text-gray-700"}`}>
                {activityLogs.map((log) => (
                  <li key={log.id} className={`rounded-xl p-3 border ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
                    <p className="text-sm leading-5">{log.message}</p>
                    <span className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
          <div className={`px-4 py-3 border-b flex items-center gap-2 ${isDark ? "border-slate-700" : "border-gray-200"}`}>
            <button
              onClick={() => setActiveTab("users")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-blue-600 text-white"
                  : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users className="h-4 w-4" />
              Users
              <span
                className={`px-1.5 py-0.5 rounded text-xs ${
                  activeTab === "users"
                    ? "bg-white/20"
                    : isDark
                      ? "bg-slate-700 text-slate-200"
                      : "bg-white text-gray-700"
                }`}
              >
                {users.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "payments"
                  ? "bg-blue-600 text-white"
                  : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Wallet className="h-4 w-4" />
              Payments
              <span
                className={`px-1.5 py-0.5 rounded text-xs ${
                  activeTab === "payments"
                    ? "bg-white/20"
                    : isDark
                      ? "bg-slate-700 text-slate-200"
                      : "bg-white text-gray-700"
                }`}
              >
                {payments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "jobs"
                  ? "bg-blue-600 text-white"
                  : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Jobs
              <span
                className={`px-1.5 py-0.5 rounded text-xs ${
                  activeTab === "jobs"
                    ? "bg-white/20"
                    : isDark
                      ? "bg-slate-700 text-slate-200"
                      : "bg-white text-gray-700"
                }`}
              >
                {jobs.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "reports"
                  ? "bg-blue-600 text-white"
                  : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Reports
            </button>
          </div>

          {activeTab === "users" ? (
            <div className="overflow-x-auto">
              <div className={`px-4 py-3 border-b flex flex-wrap items-center gap-2 ${isDark ? "border-slate-700 bg-slate-800/60" : "border-gray-200 bg-gray-50"}`}>
                <div className="relative w-full sm:w-72">
                  <Search className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-gray-400"}`} />
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Search users by name or email"
                    className={`pl-9 pr-3 py-2 rounded-lg border text-sm w-full ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(event) => setUserRoleFilter(event.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}
                >
                  <option value="all">All roles</option>
                  <option value="jobseeker">Jobseeker</option>
                  <option value="employer">Employer</option>
                  <option value="admin">Admin</option>
                </select>
                <span className={`ml-auto text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  Verified: {derivedStats.verifiedUsers} • Pending: {derivedStats.pendingVerifications}
                </span>
              </div>

              {users.length === 0 ? (
                <div className={`px-4 py-12 text-center ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  <Activity className="h-5 w-5 mx-auto mb-2" />
                  No users match the current filters.
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {users.map((item) => {
                    const suspensionStatus = getSuspensionStatus(item.suspensionEndsAt);
                    const isSelf = String(item._id) === String(user?._id || "");
                    const customDaysValue = suspensionDaysInput[item._id] || "";
                    const reasonValue = suspensionReasonInput[item._id] || "";
                    const disableSuspendActions = updatingUserId === item._id || isSelf;

                    return (
                      <div
                        key={item._id}
                        className={`rounded-xl border p-4 ${
                          isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>{item.name}</h3>
                            <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>{item.email}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold border ${suspensionStatus.active ? (isDark ? "bg-amber-900/40 text-amber-300 border-amber-700" : "bg-amber-50 text-amber-700 border-amber-200") : (isDark ? "bg-emerald-900/40 text-emerald-300 border-emerald-700" : "bg-emerald-50 text-emerald-700 border-emerald-200")}`}>
                            {suspensionStatus.active ? "Suspended" : "Active"}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div className={`rounded-lg px-2.5 py-2 ${isDark ? "bg-slate-800 text-slate-300" : "bg-gray-50 text-gray-700"}`}>
                            {item.studentIdCard ? (
                              <a href={item.studentIdCard} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Student ID</a>
                            ) : "Student ID: Not uploaded"}
                          </div>
                          <div className={`rounded-lg px-2.5 py-2 ${isDark ? "bg-slate-800 text-slate-300" : "bg-gray-50 text-gray-700"}`}>
                            {item.nationalIdCard ? (
                              <a href={item.nationalIdCard} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View National ID</a>
                            ) : "National ID: Not uploaded"}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            value={item.role}
                            disabled={updatingUserId === item._id}
                            onChange={(event) => updateUserField(item._id, { role: event.target.value })}
                            className={`px-2.5 py-2 rounded-lg border text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}
                          >
                            <option value="jobseeker">Jobseeker</option>
                            <option value="employer">Employer</option>
                            <option value="admin">Admin</option>
                          </select>

                          <select
                            value={item.identityVerificationStatus || "not_submitted"}
                            disabled={updatingUserId === item._id}
                            onChange={(event) =>
                              updateUserField(item._id, {
                                identityVerificationStatus: event.target.value,
                              })
                            }
                            className={`px-2.5 py-2 rounded-lg border text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}
                          >
                            <option value="not_submitted">Not submitted</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>

                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full border text-[11px] font-semibold ${getVerificationBadgeClass(item.identityVerificationStatus || "not_submitted")}`}
                          >
                            {(item.identityVerificationStatus || "not_submitted").replace("_", " ")}
                          </span>
                          <p className={`text-xs font-medium mt-1 ${suspensionStatus.textClass}`}>{suspensionStatus.label}</p>
                          {item.suspensionReason ? (
                            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Reason: {item.suspensionReason}</p>
                          ) : null}
                        </div>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() =>
                              updateUserField(item._id, {
                                identityVerificationStatus: "verified",
                              })
                            }
                            disabled={updatingUserId === item._id || !item.studentIdCard || !item.nationalIdCard}
                            className="px-2.5 py-1.5 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() =>
                              updateUserField(item._id, {
                                identityVerificationStatus: "rejected",
                              })
                            }
                            disabled={updatingUserId === item._id}
                            className="px-2.5 py-1.5 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              updateUserField(item._id, {
                                clearSuspension: true,
                              })
                            }
                            disabled={updatingUserId === item._id || !suspensionStatus.active}
                            className="px-2.5 py-1.5 rounded bg-slate-600 text-white text-xs font-medium hover:bg-slate-700 disabled:opacity-50"
                          >
                            Unsuspend
                          </button>
                          <button
                            onClick={() => deleteUser(item._id, item.name)}
                            disabled={deletingUserId === item._id || isSelf || item.role === "admin"}
                            className="px-2.5 py-1.5 rounded bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-1"
                            title={isSelf ? "You cannot delete your own account" : item.role === "admin" ? "Admin account cannot be deleted" : "Delete user"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingUserId === item._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>

                        <div className={`mt-2 rounded-lg p-2 grid grid-cols-[1fr_70px_auto] gap-2 items-center ${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
                          <input
                            type="text"
                            value={reasonValue}
                            maxLength={200}
                            onChange={(event) =>
                              setSuspensionReasonInput((prev) => ({
                                ...prev,
                                [item._id]: event.target.value,
                              }))
                            }
                            placeholder="Reason (optional)"
                            className={`w-full px-2.5 py-2 rounded border text-xs ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}
                            disabled={disableSuspendActions}
                          />
                          <input
                            type="number"
                            min={1}
                            max={365}
                            value={customDaysValue}
                            onChange={(event) =>
                              setSuspensionDaysInput((prev) => ({
                                ...prev,
                                [item._id]: event.target.value,
                              }))
                            }
                            placeholder="14"
                            className={`w-full px-2 py-2 rounded border text-xs ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}
                            disabled={disableSuspendActions}
                          />
                          <button
                            onClick={() => {
                              const parsedDays = customDaysValue === "" ? 14 : Number(customDaysValue);
                              if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 365) {
                                toast.error("Enter suspension days between 1 and 365");
                                return;
                              }
                              const trimmedReason = String(reasonValue || "").trim();
                              updateUserField(item._id, {
                                suspensionDays: parsedDays,
                                ...(trimmedReason ? { suspensionReason: trimmedReason } : {}),
                              });
                            }}
                            disabled={disableSuspendActions}
                            className="px-3 py-2 rounded bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 disabled:opacity-50 whitespace-nowrap"
                            title={isSelf ? "You cannot suspend your own account" : "Suspend user"}
                          >
                            Suspend
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === "jobs" ? (
            <div className="overflow-x-auto">
              <div className={`px-4 py-3 border-b flex flex-wrap items-center gap-2 ${isDark ? "border-slate-700 bg-slate-800/60" : "border-gray-200 bg-gray-50"}`}>
                <div className="relative w-full sm:w-80">
                  <Search className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-gray-400"}`} />
                  <input
                    value={jobSearch}
                    onChange={(event) => setJobSearch(event.target.value)}
                    placeholder="Search jobs by title, category or description"
                    className={`pl-9 pr-3 py-2 rounded-lg border text-sm w-full ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}
                  />
                </div>
                <select
                  value={jobStatusFilter}
                  onChange={(event) => setJobStatusFilter(event.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}
                >
                  <option value="all">All jobs</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
                <span className={`ml-auto text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  Open: {derivedStats.openJobs} • Closed: {derivedStats.closedJobs}
                </span>
              </div>

              {jobs.length === 0 ? (
                <div className={`px-4 py-12 text-center ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  <Activity className="h-5 w-5 mx-auto mb-2" />
                  No jobs match the current filters.
                </div>
              ) : (
                <div className="max-h-[68vh] overflow-auto">
                  <table className="w-full min-w-[980px] text-sm">
                    <thead className={`${isDark ? "bg-slate-800" : "bg-gray-50"} sticky top-0 z-[1]`}>
                      <tr>
                        <th className="w-[280px] text-left px-4 py-3 text-gray-500 font-semibold">Job</th>
                        <th className="w-[220px] text-left px-4 py-3 text-gray-500 font-semibold">Company</th>
                        <th className="w-[160px] text-left px-4 py-3 text-gray-500 font-semibold">Category</th>
                        <th className="w-[160px] text-left px-4 py-3 text-gray-500 font-semibold">Salary Range</th>
                        <th className="w-[140px] text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                        <th className="w-[140px] text-left px-4 py-3 text-gray-500 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((item, index) => (
                        <tr
                          key={item._id}
                          className={`border-t align-top ${
                            isDark
                              ? `${index % 2 === 0 ? "bg-slate-900" : "bg-slate-900/70"} border-slate-800`
                              : `${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"} border-gray-100`
                          }`}
                        >
                          <td className={`px-4 py-3.5 ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                            <p className="font-medium">{item.title || "—"}</p>
                            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                              {item.location || "—"} • {item.duration || "—"}
                            </p>
                          </td>
                          <td className={`px-4 py-3.5 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                            <p className="font-medium">{item.company?.name || "—"}</p>
                            <p className="text-xs mt-1">{item.company?.email || "—"}</p>
                          </td>
                          <td className={`px-4 py-3.5 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                            {item.category || "—"}
                          </td>
                          <td className={`px-4 py-3.5 ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                            NPR {Number(item.salaryMin || 0).toLocaleString()} - {Number(item.salaryMax || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold border ${
                                item.isClosed
                                  ? isDark
                                    ? "bg-rose-900/40 text-rose-300 border-rose-700"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                  : isDark
                                    ? "bg-emerald-900/40 text-emerald-300 border-emerald-700"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {item.isClosed ? "Closed" : "Open"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => deleteJob(item._id, item.title || "this job")}
                              disabled={deletingJobId === item._id}
                              className="px-2.5 py-1.5 rounded bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {deletingJobId === item._id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === "reports" ? (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                <div className={`rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Applications</p>
                  <p className={`mt-1 text-xl font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                    {Number(reports?.applications?.total || 0).toLocaleString()}
                  </p>
                  <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    Pending {Number(reports?.applications?.pending || 0).toLocaleString()} • Accepted {Number(reports?.applications?.accepted || 0).toLocaleString()} • Rejected {Number(reports?.applications?.rejected || 0).toLocaleString()}
                  </p>
                </div>
                <div className={`rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Proposals</p>
                  <p className={`mt-1 text-xl font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                    {Number(reports?.proposals?.total || 0).toLocaleString()}
                  </p>
                  <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    Pending {Number(reports?.proposals?.pending || 0).toLocaleString()} • Accepted {Number(reports?.proposals?.accepted || 0).toLocaleString()} • Rejected {Number(reports?.proposals?.rejected || 0).toLocaleString()}
                  </p>
                </div>
                <div className={`rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Reviews</p>
                  <p className={`mt-1 text-xl font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                    {Number(reports?.reviews?.total || 0).toLocaleString()}
                  </p>
                  <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    Avg Rating {Number(reports?.reviews?.averageRating || 0).toFixed(2)} / 5
                  </p>
                </div>
                <div className={`rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Completed Payments</p>
                  <p className={`mt-1 text-xl font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                    {Number(reports?.payments?.completedCount || 0).toLocaleString()}
                  </p>
                  <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    Revenue NPR {Number(reports?.payments?.completedRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <div className={`rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Jobs</p>
                  <p className={`mt-1 text-xl font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                    {Number(reports?.jobs?.total || 0).toLocaleString()}
                  </p>
                  <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    Open {Number(reports?.jobs?.open || 0).toLocaleString()} • Closed {Number(reports?.jobs?.closed || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className={`rounded-xl border p-4 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"}`}>
                  <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>User Growth</p>
                  <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    This month: <span className="font-semibold">{Number(reports?.growth?.users?.thisMonth || 0).toLocaleString()}</span>
                  </p>
                  <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    Previous month: <span className="font-semibold">{Number(reports?.growth?.users?.previousMonth || 0).toLocaleString()}</span>
                  </p>
                </div>
                <div className={`rounded-xl border p-4 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"}`}>
                  <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Job Growth</p>
                  <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    This month: <span className="font-semibold">{Number(reports?.growth?.jobs?.thisMonth || 0).toLocaleString()}</span>
                  </p>
                  <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    Previous month: <span className="font-semibold">{Number(reports?.growth?.jobs?.previousMonth || 0).toLocaleString()}</span>
                  </p>
                </div>
                <div className={`rounded-xl border p-4 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-white"}`}>
                  <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Completed Payment Growth</p>
                  <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    This month: <span className="font-semibold">{Number(reports?.growth?.completedPayments?.thisMonth || 0).toLocaleString()}</span>
                  </p>
                  <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-700"}`}>
                    Previous month: <span className="font-semibold">{Number(reports?.growth?.completedPayments?.previousMonth || 0).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              <div className={`rounded-xl border overflow-hidden ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
                <div className={`px-4 py-3 border-b ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
                  <h3 className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Monthly Trend (Last 6 Months)</h3>
                </div>
                {Array.isArray(reports?.monthlyTrend) && reports.monthlyTrend.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-sm">
                      <thead className={`${isDark ? "bg-slate-800" : "bg-gray-50"}`}>
                        <tr>
                          <th className="text-left px-4 py-3 text-gray-500 font-semibold">Month</th>
                          <th className="text-left px-4 py-3 text-gray-500 font-semibold">New Users</th>
                          <th className="text-left px-4 py-3 text-gray-500 font-semibold">New Jobs</th>
                          <th className="text-left px-4 py-3 text-gray-500 font-semibold">Completed Payments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.monthlyTrend.map((item, index) => (
                          <tr
                            key={`${item.key}-${index}`}
                            className={`border-t ${
                              isDark ? "border-slate-800 text-slate-200" : "border-gray-100 text-gray-700"
                            }`}
                          >
                            <td className="px-4 py-3">{item.label || "-"}</td>
                            <td className="px-4 py-3">{Number(item.users || 0).toLocaleString()}</td>
                            <td className="px-4 py-3">{Number(item.jobs || 0).toLocaleString()}</td>
                            <td className="px-4 py-3">{Number(item.completedPayments || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={`px-4 py-10 text-center text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    No monthly trend data available.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className={`px-4 py-3 border-b flex flex-wrap items-center gap-2 ${isDark ? "border-slate-700 bg-slate-800/60" : "border-gray-200 bg-gray-50"}`}>
                <div className="relative w-full sm:w-80">
                  <Search className={`h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-gray-400"}`} />
                  <input
                    value={paymentSearch}
                    onChange={(event) => setPaymentSearch(event.target.value)}
                    placeholder="Search payments by job, employer, freelancer"
                    className={`pl-9 pr-3 py-2 rounded-lg border text-sm w-full ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}
                  />
                </div>
                <select
                  value={paymentStatusFilter}
                  onChange={(event) => setPaymentStatusFilter(event.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200 bg-white text-gray-900"}`}
                >
                  <option value="all">All status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                <span className={`ml-auto text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  Pending: {derivedStats.pendingPayments} • Completed: {derivedStats.completedPayments}
                </span>
              </div>

              {payments.length === 0 ? (
                <div className={`px-4 py-12 text-center ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  <Activity className="h-5 w-5 mx-auto mb-2" />
                  No payments match the current filters.
                </div>
              ) : (
                <div className="max-h-[68vh] overflow-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className={`${isDark ? "bg-slate-800" : "bg-gray-50"} sticky top-0 z-[1]`}>
                    <tr>
                      <th className="w-[280px] text-left px-4 py-3 text-gray-500 font-semibold">Job</th>
                      <th className="w-[200px] text-left px-4 py-3 text-gray-500 font-semibold">Employer</th>
                      <th className="w-[200px] text-left px-4 py-3 text-gray-500 font-semibold">Freelancer</th>
                      <th className="w-[140px] text-left px-4 py-3 text-gray-500 font-semibold">Amount</th>
                      <th className="w-[160px] text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((item, index) => (
                      <tr
                        key={item._id}
                        className={`border-t align-top ${
                          isDark
                            ? `${index % 2 === 0 ? "bg-slate-900" : "bg-slate-900/70"} border-slate-800`
                            : `${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"} border-gray-100`
                        }`}
                      >
                        <td className={`px-4 py-3.5 font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                          {item.job?.title || "—"}
                        </td>
                        <td className={`px-4 py-3.5 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                          {item.employer?.name || "—"}
                        </td>
                        <td className={`px-4 py-3.5 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                          {item.freelancer?.name || "—"}
                        </td>
                        <td className={`px-4 py-3.5 font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                          NPR {item.amount}
                        </td>
                        <td className="px-4 py-3.5">
                          <select
                            value={item.status}
                            disabled={updatingPaymentId === item._id}
                            onChange={(event) => updatePaymentStatus(item._id, event.target.value)}
                            className={`px-2 py-1 rounded border text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200 bg-white"}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
