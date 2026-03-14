import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Heart,
  User,
  Sun,
  Moon,
  LogOut,
  Loader2,
  MessageSquare,
  Bell,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/AuthContext";

const FreelancerNavbar = ({ active = "dashboard" }) => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [isSwitchingTheme, setIsSwitchingTheme] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const isDark = (user?.themePreference || "light") === "dark";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Briefcase, path: "/freelancer-dashboard" },
    { id: "saved", label: "Saved Jobs", icon: Heart, path: "/saved-jobs" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/messages" },
    { id: "notifications", label: "Alerts", icon: Bell, path: "/notifications" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  const fetchUnreadCounts = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.NOTIFICATIONS.GET_ALL);
      if (!response.data?.success) return;

      const notifications = response.data.notifications || [];
      const unreadAll = notifications.filter((item) => !item.isRead).length;
      const unreadMessages = notifications.filter(
        (item) => !item.isRead && item.type === "message"
      ).length;

      setUnreadNotificationCount(unreadAll);
      setUnreadMessageCount(unreadMessages);
    } catch {
      setUnreadNotificationCount(0);
      setUnreadMessageCount(0);
    }
  };

  useEffect(() => {
    if (!user?._id) return;

    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 20000);
    return () => clearInterval(interval);
  }, [user?._id]);

  const toggleTheme = async () => {
    const nextTheme = isDark ? "light" : "dark";
    setIsSwitchingTheme(true);
    try {
      const res = await axiosInstance.put(API_PATHS.USERS.UPDATE_PROFILE, {
        themePreference: nextTheme,
      });
      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
      } else {
        updateUser({ themePreference: nextTheme });
      }
    } catch {
      updateUser({ themePreference: nextTheme });
    } finally {
      setIsSwitchingTheme(false);
    }
  };

  return (
    <header className={`sticky top-0 z-30 border-b ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/freelancer-dashboard")}
          className="inline-flex items-center gap-2.5 sm:gap-3 flex-shrink-0"
        >
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-sm">
            <Briefcase className="h-5 w-5" />
          </span>
          <span className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? "text-slate-100" : "text-gray-900"}`}>
            KaamSathi
          </span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            const badgeCount =
              item.id === "notifications"
                ? unreadNotificationCount
                : item.id === "messages"
                  ? unreadMessageCount
                  : 0;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? isDark
                      ? "bg-blue-900/50 text-blue-200"
                      : "bg-blue-50 text-blue-700"
                    : isDark
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[11px] font-bold bg-rose-500 text-white">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            disabled={isSwitchingTheme}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? "text-slate-200 hover:bg-slate-800"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {isSwitchingTheme ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
          </button>

          <button
            onClick={logout}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? "text-rose-300 hover:bg-rose-900/30"
                : "text-rose-600 hover:bg-rose-50"
            }`}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default FreelancerNavbar;
