import React, { useCallback, useEffect, useState } from "react";
import { Users, Wallet, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";

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
    setActivityLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 20));
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
        prev.map((user) =>
          user._id === userId
            ? {
                ...user,
                ...(payload.role ? { role: payload.role } : {}),
                ...(payload.identityVerificationStatus
                  ? { identityVerificationStatus: payload.identityVerificationStatus }
                  : {}),
              }
            : user,
        ),
      );
      if (payload.role) {
        pushActivity(`Updated role for ${userId} to ${payload.role}`);
      }
      if (payload.identityVerificationStatus) {
        pushActivity(
          `Updated verification for ${userId} to ${payload.identityVerificationStatus}`,
        );
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
      const response = await axiosInstance.put(
        API_PATHS.ADMIN.UPDATE_PAYMENT_STATUS(paymentId),
        { status },
      );

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to update payment");
        return;
      }

      setPayments((prev) =>
        prev.map((payment) =>
          payment._id === paymentId ? { ...payment, status } : payment,
        ),
      );
      pushActivity(`Updated payment ${paymentId} status to ${status}`);
      toast.success("Payment updated");
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setUpdatingPaymentId("");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-gray-50"}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50"}`}>
      <div className={`${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"} border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Admin Panel</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>Manage users and payments</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className={`rounded-xl border p-4 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Total Users</p>
            <p className={`text-2xl font-bold mt-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>{overview?.totalUsers || 0}</p>
          </div>
          <div className={`rounded-xl border p-4 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Jobseekers</p>
            <p className={`text-2xl font-bold mt-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>{overview?.totalJobseekers || 0}</p>
          </div>
          <div className={`rounded-xl border p-4 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Employers</p>
            <p className={`text-2xl font-bold mt-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>{overview?.totalEmployers || 0}</p>
          </div>
          <div className={`rounded-xl border p-4 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>Payments</p>
            <p className={`text-2xl font-bold mt-1 ${isDark ? "text-slate-100" : "text-gray-900"}`}>{overview?.totalPayments || 0}</p>
          </div>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? "border-slate-700" : "border-gray-100"}`}>
            <h2 className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Recent Admin Activity</h2>
            <button
              onClick={() => setActivityLogs([])}
              className={`text-xs ${isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-700"}`}
            >
              Clear
            </button>
          </div>
          {activityLogs.length === 0 ? (
            <div className={`px-4 py-8 text-sm text-center ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              No admin actions yet in this session.
            </div>
          ) : (
            <ul className={`${isDark ? "divide-slate-800" : "divide-gray-100"} divide-y`}>
              {activityLogs.map((log) => (
                <li key={log.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <p className={`text-sm ${isDark ? "text-slate-200" : "text-gray-700"}`}>{log.message}</p>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-100"}`}>
          <div className={`px-4 py-3 border-b flex items-center gap-2 ${isDark ? "border-slate-700" : "border-gray-100"}`}>
            <button
              onClick={() => setActiveTab("users")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === "users"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users className="h-4 w-4" />
              Users
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === "payments"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Wallet className="h-4 w-4" />
              Payments
            </button>
          </div>

          {activeTab === "users" ? (
            <div className="overflow-x-auto">
              <div className={`px-4 py-3 border-b flex flex-wrap items-center gap-2 ${isDark ? "border-slate-700 bg-slate-800/60" : "border-gray-100 bg-gray-50/60"}`}>
                <input
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search users by name or email"
                  className={`px-3 py-2 rounded-lg border text-sm w-full sm:w-72 ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200"}`}
                />
                <select
                  value={userRoleFilter}
                  onChange={(event) => setUserRoleFilter(event.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200"}`}
                >
                  <option value="all">All roles</option>
                  <option value="jobseeker">Jobseeker</option>
                  <option value="employer">Employer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <table className="w-full text-sm">
                <thead className={isDark ? "bg-slate-800" : "bg-gray-50"}>
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Name</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Student ID</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">National ID</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Role</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Verification</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className={`border-t ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                      <td className={`px-4 py-3 ${isDark ? "text-slate-100" : "text-gray-900"}`}>{user.name}</td>
                      <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{user.email}</td>
                      <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                        {user.studentIdCard ? (
                          <a
                            href={user.studentIdCard}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            View Student ID
                          </a>
                        ) : (
                          <span className="text-gray-400">Not uploaded</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-gray-600"}`}>
                        {user.nationalIdCard ? (
                          <a
                            href={user.nationalIdCard}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            View National ID
                          </a>
                        ) : (
                          <span className="text-gray-400">Not uploaded</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={updatingUserId === user._id}
                          onChange={(event) =>
                            updateUserField(user._id, { role: event.target.value })
                          }
                          className={`px-2 py-1 rounded border text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200"}`}
                        >
                          <option value="jobseeker">Jobseeker</option>
                          <option value="employer">Employer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.identityVerificationStatus || "not_submitted"}
                          disabled={updatingUserId === user._id}
                          onChange={(event) =>
                            updateUserField(user._id, {
                              identityVerificationStatus: event.target.value,
                            })
                          }
                          className={`px-2 py-1 rounded border text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200"}`}
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
                              updateUserField(user._id, {
                                identityVerificationStatus: "verified",
                              })
                            }
                            disabled={
                              updatingUserId === user._id ||
                              !user.studentIdCard ||
                              !user.nationalIdCard
                            }
                            className="px-2.5 py-1 rounded bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() =>
                              updateUserField(user._id, {
                                identityVerificationStatus: "rejected",
                              })
                            }
                            disabled={updatingUserId === user._id}
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
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className={`px-4 py-3 border-b flex flex-wrap items-center gap-2 ${isDark ? "border-slate-700 bg-slate-800/60" : "border-gray-100 bg-gray-50/60"}`}>
                <input
                  value={paymentSearch}
                  onChange={(event) => setPaymentSearch(event.target.value)}
                  placeholder="Search payments by job, employer, freelancer"
                  className={`px-3 py-2 rounded-lg border text-sm w-full sm:w-80 ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200"}`}
                />
                <select
                  value={paymentStatusFilter}
                  onChange={(event) => setPaymentStatusFilter(event.target.value)}
                  className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-gray-200"}`}
                >
                  <option value="all">All status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
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
                  {payments.map((payment) => (
                    <tr key={payment._id} className={`border-t ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                      <td className={`px-4 py-3 ${isDark ? "text-slate-100" : "text-gray-900"}`}>{payment.job?.title || "—"}</td>
                      <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{payment.employer?.name || "—"}</td>
                      <td className={`px-4 py-3 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{payment.freelancer?.name || "—"}</td>
                      <td className={`px-4 py-3 ${isDark ? "text-slate-100" : "text-gray-900"}`}>${payment.amount}</td>
                      <td className="px-4 py-3">
                        <select
                          value={payment.status}
                          disabled={updatingPaymentId === payment._id}
                          onChange={(event) =>
                            updatePaymentStatus(payment._id, event.target.value)
                          }
                          className={`px-2 py-1 rounded border text-sm ${isDark ? "border-slate-700 bg-slate-800 text-slate-100" : "border-gray-200"}`}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
