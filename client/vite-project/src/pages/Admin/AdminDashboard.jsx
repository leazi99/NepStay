import React, { useEffect, useState } from "react";
import { Users, Wallet, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [updatingPaymentId, setUpdatingPaymentId] = useState("");

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, usersRes, paymentsRes] = await Promise.all([
        axiosInstance.get(API_PATHS.ADMIN.OVERVIEW),
        axiosInstance.get(API_PATHS.ADMIN.GET_USERS),
        axiosInstance.get(API_PATHS.ADMIN.GET_PAYMENTS),
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
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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
      toast.success("Payment updated");
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setUpdatingPaymentId("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">Manage users and payments</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm"
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
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{overview?.totalUsers || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Jobseekers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{overview?.totalJobseekers || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Employers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{overview?.totalEmployers || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{overview?.totalPayments || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
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
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Name</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Role</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-semibold">Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={updatingUserId === user._id}
                          onChange={(event) =>
                            updateUserField(user._id, { role: event.target.value })
                          }
                          className="px-2 py-1 rounded border border-gray-200 text-sm"
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
                          className="px-2 py-1 rounded border border-gray-200 text-sm"
                        >
                          <option value="not_submitted">Not submitted</option>
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
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
                    <tr key={payment._id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-900">{payment.job?.title || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{payment.employer?.name || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{payment.freelancer?.name || "—"}</td>
                      <td className="px-4 py-3 text-gray-900">${payment.amount}</td>
                      <td className="px-4 py-3">
                        <select
                          value={payment.status}
                          disabled={updatingPaymentId === payment._id}
                          onChange={(event) =>
                            updatePaymentStatus(payment._id, event.target.value)
                          }
                          className="px-2 py-1 rounded border border-gray-200 text-sm"
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
