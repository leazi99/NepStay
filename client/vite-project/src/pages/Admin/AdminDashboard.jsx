import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Wallet,
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
    className={`rounded-2xl border p-4 sm:p-5 transition ${
      isDark
        ? "border-slate-700 bg-slate-900/80"
        : "border-gray-200 bg-white shadow-sm"
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
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [updatingPaymentId, setUpdatingPaymentId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [activityLogs, setActivityLogs] = useState([]);

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

      const [overviewRes, usersRes, paymentsRes] = await Promise.all([
        axiosInstance.get(API_PATHS.ADMIN.OVERVIEW),
        axiosInstance.get(
          `${API_PATHS.ADMIN.GET_USERS}${usersParams.toString() ? `?${usersParams.toString()}` : ""}`,
        ),
        axiosInstance.get(
          `${API_PATHS.ADMIN.GET_PAYMENTS}${paymentsParams.toString() ? `?${paymentsParams.toString()}` : ""}`,
        ),
      ]);

      if (!overviewRes.data.success || !usersRes.data.success || !paymentsRes.data.success) {
        toast.error("Failed to load admin data");
        return;
      }

      setOverview(overviewRes.data.counts || null);
      setUsers(usersRes.data.users || []);
      setPayments(paymentsRes.data.payments || []);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [userSearch, userRoleFilter, paymentSearch, paymentStatusFilter]);

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
                ...(payload.role ? { role: payload.role } : {}),
                ...(payload.identityVerificationStatus
                  ? { identityVerificationStatus: payload.identityVerificationStatus }
                  : {}),
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

  const derivedStats = useMemo(() => {
    const pendingVerifications = users.filter(
      (item) => (item.identityVerificationStatus || "not_submitted") === "pending",
    ).length;
    const verifiedUsers = users.filter(
      (item) => (item.identityVerificationStatus || "not_submitted") === "verified",
    ).length;
    const pendingPayments = payments.filter((item) => item.status === "pending").length;
    const completedPayments = payments.filter((item) => item.status === "completed").length;

    return {
      pendingVerifications,
      verifiedUsers,
      pendingPayments,
      completedPayments,
    };
  }, [users, payments]);

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
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className={`border-b ${isDark ? "border-slate-700 bg-slate-900/80" : "border-gray-200 bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Admin Dashboard</h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              Manage users, verify identities, and control payment operations.
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
          <MetricCard title="Total Payments" value={overview?.totalPayments} icon={Wallet} isDark={isDark} />
          <MetricCard
            title="Pending Verifications"
            value={derivedStats.pendingVerifications}
            icon={ShieldCheck}
            isDark={isDark}
          />
          <MetricCard
            title="Completed Payments"
            value={derivedStats.completedPayments}
            icon={CircleDollarSign}
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
                <table className="w-full text-sm">
                  <thead className={isDark ? "bg-slate-800" : "bg-gray-50"}>
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500">Student ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500">National ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500">Role</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500">Verification</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item, index) => (
                      <tr
                        key={item._id}
                        className={`border-t ${
                          isDark
                            ? `${index % 2 === 0 ? "bg-slate-900" : "bg-slate-900/70"} border-slate-800`
                            : `${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"} border-gray-100`
                        }`}
                      >
                        <td className={`px-4 py-3 font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>{item.name}</td>
                        <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{item.email}</td>
                        <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                          {item.studentIdCard ? (
                            <a
                              href={item.studentIdCard}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              View Student ID
                            </a>
                          ) : (
                            <span className={isDark ? "text-slate-500" : "text-gray-400"}>Not uploaded</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                          {item.nationalIdCard ? (
                            <a
                              href={item.nationalIdCard}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              View National ID
                            </a>
                          ) : (
                            <span className={isDark ? "text-slate-500" : "text-gray-400"}>Not uploaded</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={item.role}
                            disabled={updatingUserId === item._id}
                            onChange={(event) => updateUserField(item._id, { role: event.target.value })}
                            className={`px-2 py-1 rounded border text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200 bg-white"}`}
                          >
                            <option value="jobseeker">Jobseeker</option>
                            <option value="employer">Employer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={item.identityVerificationStatus || "not_submitted"}
                            disabled={updatingUserId === item._id}
                            onChange={(event) =>
                              updateUserField(item._id, {
                                identityVerificationStatus: event.target.value,
                              })
                            }
                            className={`px-2 py-1 rounded border text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200 bg-white"}`}
                          >
                            <option value="not_submitted">Not submitted</option>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateUserField(item._id, {
                                  identityVerificationStatus: "verified",
                                })
                              }
                              disabled={updatingUserId === item._id || !item.studentIdCard || !item.nationalIdCard}
                              className="px-2.5 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
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
                              className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                <table className="w-full text-sm">
                  <thead className={isDark ? "bg-slate-800" : "bg-gray-50"}>
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Job</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Employer</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Freelancer</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Amount</th>
                      <th className="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((item, index) => (
                      <tr
                        key={item._id}
                        className={`border-t ${
                          isDark
                            ? `${index % 2 === 0 ? "bg-slate-900" : "bg-slate-900/70"} border-slate-800`
                            : `${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"} border-gray-100`
                        }`}
                      >
                        <td className={`px-4 py-3 font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                          {item.job?.title || "—"}
                        </td>
                        <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                          {item.employer?.name || "—"}
                        </td>
                        <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                          {item.freelancer?.name || "—"}
                        </td>
                        <td className={`px-4 py-3 font-medium ${isDark ? "text-slate-100" : "text-gray-900"}`}>
                          ${item.amount}
                        </td>
                        <td className="px-4 py-3">
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
