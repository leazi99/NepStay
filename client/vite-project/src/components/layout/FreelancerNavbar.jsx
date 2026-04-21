import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
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
import kaamSathiLogo from "../../assets/kaamsathi-logo.svg";
import kaamSathiLogoMini from "../../assets/kaamsathi-logo-mini.svg";

const FreelancerNavbar = ({ active = "dashboard" }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const getActiveTheme = () => {
    const activeTheme = localStorage.getItem("themePreference:active");
    return activeTheme === "dark" ? "dark" : "light";
  };

  const [guestTheme, setGuestTheme] = useState(getActiveTheme);
  const [isSwitchingTheme, setIsSwitchingTheme] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const activeTheme = isAuthenticated ? (user?.themePreference || "light") : guestTheme;
  const isDark = activeTheme === "dark";
  const workspaceLabel = isAuthenticated ? "Freelancer Workspace" : "Browse Jobs";

  const navItems = isAuthenticated
    ? [
      { id: "dashboard", label: "Dashboard", icon: Briefcase, path: "/freelancer-dashboard" },
      { id: "saved", label: "Saved Jobs", icon: Heart, path: "/saved-jobs" },
      { id: "messages", label: "Messages", icon: MessageSquare, path: "/freelancer/messages" },
      { id: "notifications", label: "Alerts", icon: Bell, path: "/notifications" },
      { id: "profile", label: "Profile", icon: User, path: "/profile" },
    ]
    : [
      { id: "dashboard", label: "Jobs", icon: Briefcase, path: "/freelancer-dashboard" },
    ];

  const fetchBadgeCounts = async () => {
    try {
      const notificationResponse = await axiosInstance.get(API_PATHS.NOTIFICATIONS.GET_ALL);

      const notifications = notificationResponse.data?.success
        ? notificationResponse.data.notifications || []
        : [];
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

    fetchBadgeCounts();
    const interval = setInterval(fetchBadgeCounts, 20000);
    return () => clearInterval(interval);
  }, [user?._id]);

  useEffect(() => {
    if (isAuthenticated) return;

    const syncTheme = () => {
      const nextTheme = getActiveTheme();
      setGuestTheme(nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener("themePreferenceChanged", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("themePreferenceChanged", syncTheme);
    };
  }, [isAuthenticated]);

  const toggleTheme = async () => {
    const nextTheme = isDark ? "light" : "dark";

    if (!isAuthenticated) {
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      localStorage.setItem("themePreference:active", nextTheme);
      setGuestTheme(nextTheme);
      window.dispatchEvent(new Event("themePreferenceChanged"));
      return;
    }

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
      window.dispatchEvent(new Event("themePreferenceChanged"));
    } catch {
      updateUser({ themePreference: nextTheme });
      window.dispatchEvent(new Event("themePreferenceChanged"));
    } finally {
      setIsSwitchingTheme(false);
    }
  };

  let themeIcon = <Moon className="h-4 w-4" />;
  if (isSwitchingTheme) {
    themeIcon = <Loader2 className="h-4 w-4 animate-spin" />;
  } else if (isDark) {
    themeIcon = <Sun className="h-4 w-4" />;
  }

  return (
    <header className={`sticky top-0 z-30 border-b ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
        <div className="min-w-0 flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => navigate("/freelancer-dashboard")}
            className="inline-flex items-center gap-2.5 sm:gap-3 flex-shrink-0"
          >
            <span className="h-9 w-9 rounded-xl overflow-hidden shadow-sm border border-blue-500/30 bg-blue-600 flex items-center justify-center">
              <img src={kaamSathiLogoMini} alt="KaamSathi" className="h-full w-full object-cover sm:hidden" />
              <img src={kaamSathiLogo} alt="KaamSathi" className="h-full w-full object-cover hidden sm:block"  />
            </span>
            <span  href="/" className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? "text-slate-100" : "text-gray-900"}>`  }>
              KaamSathi
            </span>
          </button>
          <span
            className={`hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${
              isDark
                ? "bg-slate-800 text-slate-200 border-slate-600"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}
          >
            {workspaceLabel}
          </span>
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            let badgeCount = 0;
            if (item.id === "notifications") {
              badgeCount = unreadNotificationCount;
            }
            if (item.id === "messages") {
              badgeCount = unreadMessageCount;
            }
            let itemClasses = "text-gray-600 hover:bg-gray-100";
            if (!isActive && isDark) {
              itemClasses = "text-slate-300 hover:bg-slate-800";
            }
            if (isActive && !isDark) {
              itemClasses = "bg-blue-50 text-blue-700";
            }
            if (isActive && isDark) {
              itemClasses = "bg-blue-900/50 text-blue-200";
            }
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${itemClasses}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
                {badgeCount > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[11px] font-bold bg-rose-500 text-white"
                  >
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </button>
            );
          })}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            disabled={isSwitchingTheme}
            className={`inline-flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? "text-slate-200 hover:bg-slate-800"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {themeIcon}
            <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
          </button>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className={`inline-flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isDark
                  ? "text-rose-300 hover:bg-rose-900/30"
                  : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className={`inline-flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isDark ? "text-slate-200 hover:bg-slate-800" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

FreelancerNavbar.propTypes = {
  active: PropTypes.string,
};

export default FreelancerNavbar;
