import React from 'react'
import { useState, useEffect } from "react";

import {
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NAVIGATION_MENU } from "../../utils/data";
import ProfileDropdown from "./ProfileDropdown";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import kaamSathiLogo from "../../assets/kaamsathi-logo.svg";
import kaamSathiLogoMini from "../../assets/kaamsathi-logo-mini.svg";

const NavigationItem = ({
  item, isActive, onClick, isCollapsed, badgeCount, isDark
}) => {
  const Icon = item.icon

  return <button
    onClick={() => onClick(item.id)}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
      ? isDark
        ? "bg-blue-900/40 text-blue-200"
        : "bg-blue-50 text-blue-700"
      : isDark
        ? "text-slate-300 hover:bg-slate-800"
        : "text-gray-600 hover:bg-gray-100"
      }`}
  >
    <Icon
      className={`h-4 w-4 ${isActive
        ? isDark
          ? "text-blue-300"
          : "text-blue-600"
        : isDark
          ? "text-slate-400"
          : "text-gray-500"
        }`}
    />
    {!isCollapsed && <span className=''>{item.name}</span>}
    {badgeCount > 0 && (
      <span className='ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[11px] font-bold bg-rose-500 text-white'>
        {badgeCount > 99 ? "99+" : badgeCount}
      </span>
    )}
  </button>
}
const DashboardLayout = ({ activeMenu, children }) => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setMobile] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const isDark = (user?.themePreference || "light") === "dark";
  const normalizedRole = String(user?.role || "").toLowerCase();
  const workspaceLabel =
    normalizedRole === "admin"
      ? "Admin Workspace"
      : normalizedRole === "employer" || normalizedRole === "client"
        ? "Employer Workspace"
        : "Freelancer Workspace";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileDropdownOpen]);

  useEffect(() => {
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

    if (!user?._id) return;

    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 20000);

    return () => clearInterval(interval);
  }, [user?._id]);

  const handleNavigation = (itemId) => {
    setActiveNavItem(itemId);
    navigate(`/${itemId}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sidebarCollapsed = !isMobile && false;

  return (
    <>
      <div className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
        <div className={`fixed inset-y-0 left-0 z-40 border-r h-screen transition-transform duration-300 ${isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200"} ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
          } ${sidebarCollapsed ? "w-16" : "w-64"}`}>

          <div className={`h-16 px-4 border-b flex items-center ${isDark ? "border-slate-700" : "border-gray-200"}`}>
            <Link className="inline-flex items-center gap-3" to='/'>
              <div className='h-9 w-9 rounded-xl overflow-hidden shadow-sm border border-blue-500/30 bg-blue-600 flex items-center justify-center'>
                <img src={kaamSathiLogoMini} alt='KaamSathi' className='h-full w-full object-cover sm:hidden' />
                <img src={kaamSathiLogo} alt='KaamSathi' className='h-full w-full object-cover hidden sm:block' />
              </div>
              <span className={`text-lg font-bold tracking-tight ${isDark ? "text-slate-100" : "text-gray-900"} href="/"`}>KaamSathi</span>
            </Link>
          </div>

          <nav className='p-3 space-y-1'>
            {NAVIGATION_MENU.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                isActive={activeNavItem === item.id}
                onClick={handleNavigation}
                isCollapsed={sidebarCollapsed}
                isDark={isDark}
                badgeCount={
                  item.id === "notifications"
                    ? unreadNotificationCount
                    : item.id === "messages"
                      ? unreadMessageCount
                      : 0
                }
              />
            ))}
          </nav>


          <div className={`absolute bottom-0 left-0 right-0 p-3 border-t ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
            <button className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDark ? "text-rose-300 hover:bg-rose-900/30" : "text-rose-600 hover:bg-rose-50"}`} onClick={logout}>
              <LogOut className={`h-5 w-5 flex-shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`} />
              {!sidebarCollapsed && <span className=''>Logout</span>}
            </button>
          </div>
        </div>

        {
          isMobile && sidebarOpen && (
            <div
              className='fixed inset-0 bg-black/40 z-30 md:hidden'
              onClick={() => setSidebarOpen(false)}
            />
          )
        }

        <div
          className={`min-h-screen transition-all duration-300 ${isMobile ? "ml-0" : sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}
        >
          <header className={`sticky top-0 z-20 border-b backdrop-blur ${isDark ? "border-slate-700 bg-slate-900/90" : "border-gray-200 bg-white/90"}`}>
            <div className='h-16 px-4 md:px-6 flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3 min-w-0'>
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
                >
                  {sidebarOpen ? (
                    <X className={`h-5 w-5 ${isDark ? "text-slate-300" : "text-gray-600"}`} />
                  ) : (
                    <Menu className={`h-5 w-5 ${isDark ? "text-slate-300" : "text-gray-600"}`} />

                  )}
                </button>
              )}
              <div >
                <h1 className={`text-base md:text-lg font-semibold ${isDark ? "text-slate-100" : "text-gray-900"}`}>Welcome Back</h1>
                <div className='flex items-center gap-2 mt-0.5'>
                  <p className={`text-xs md:text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    Here's what's happening with your jobs today.
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${isDark
                        ? "bg-slate-800 text-slate-200 border-slate-600"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                  >
                    {workspaceLabel}
                  </span>
                </div>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <ProfileDropdown
                isOpen={profileDropdownOpen}
                onToggle={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                avatar={user?.avatar || ""}
                companyName={user?.fullName || user?.name || ""}
                email={user?.email || ""}
                role={user?.role}
                isDark={isDark}
                onLogout={logout}
              />

            </div>
            </div>
          </header>
          <main className='p-4 md:p-6'>
            {children}
          </main>
        </div>
      </div>
    </>
  );
};
export default DashboardLayout
