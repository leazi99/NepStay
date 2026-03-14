import React, { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";
import FreelancerNavbar from "../../components/layout/FreelancerNavbar";
import DashboardLayout from "../../components/layout/DashboardLayout";

const NotificationsContent = ({ isDark, userRole }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.NOTIFICATIONS.GET_ALL);
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to load notifications");
        return;
      }
      setNotifications(response.data.notifications || []);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markOne = async (id) => {
    try {
      const response = await axiosInstance.put(API_PATHS.NOTIFICATIONS.READ_ONE(id));
      if (!response.data.success) return;
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
    } catch {
      toast.error("Failed to mark notification");
    }
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      const response = await axiosInstance.put(API_PATHS.NOTIFICATIONS.READ_ALL);
      if (!response.data.success) {
        toast.error(response.data.message || "Failed to update notifications");
        return;
      }
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to update notifications");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-70px)] ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      {userRole === "jobseeker" ? <FreelancerNavbar active="notifications" /> : null}

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className={`rounded-2xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? "border-slate-700" : "border-gray-200"}`}>
            <h2 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Notifications</h2>
            <button
              onClick={markAll}
              disabled={markingAll}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
              Mark all read
            </button>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {loading ? (
              <div className="p-5 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className={`p-8 text-center text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                <Bell className="h-5 w-5 mx-auto mb-2" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item._id}
                  onClick={() => {
                    if (!item.isRead) markOne(item._id);
                    if (item.link) navigate(item.link);
                  }}
                  className={`w-full text-left px-5 py-4 transition-colors ${
                    item.isRead
                      ? isDark
                        ? "bg-slate-800"
                        : "bg-white"
                      : isDark
                        ? "bg-blue-900/20"
                        : "bg-blue-50"
                  } ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.isRead ? "bg-gray-300" : "bg-blue-500"}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>{item.title}</p>
                      <p className={`text-sm ${isDark ? "text-slate-300" : "text-gray-600"}`}>{item.body}</p>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { user } = useAuth();
  const isDark = (user?.themePreference || "light") === "dark";

  if (user?.role === "employer") {
    return (
      <DashboardLayout activeMenu="notifications">
        <NotificationsContent isDark={isDark} userRole={user?.role} />
      </DashboardLayout>
    );
  }

  return <NotificationsContent isDark={isDark} userRole={user?.role} />;
};

export default Notifications;
