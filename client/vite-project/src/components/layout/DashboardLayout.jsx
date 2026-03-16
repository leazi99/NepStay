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
  item, isActive, onClick, isCollapsed, badgeCount
}) => {
  const Icon = item.icon

  return <button
    onClick={() => onClick(item.id)}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
      ? "bg-blue-50 text-blue-700"
      : "text-gray-600 hover:bg-gray-100"
      }`}
  >
    <Icon
      className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-gray-500"
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
      <div className='min-h-screen bg-gray-50 text-gray-900'>
        <div className={`fixed md:static inset-y-0 left-0 z-40 bg-white border-r border-gray-200 h-screen transition-transform duration-300 ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
          } ${sidebarCollapsed ? "w-16" : "w-64"}`}>

          <div className='h-16 px-4 border-b border-gray-200 flex items-center'>
            <Link className="inline-flex items-center gap-3" to='/'>
              <div className='h-9 w-9 rounded-xl overflow-hidden shadow-sm border border-blue-500/30 bg-blue-600 flex items-center justify-center'>
                <img src={kaamSathiLogoMini} alt='KaamSathi' className='h-full w-full object-cover sm:hidden' />
                <img src={kaamSathiLogo} alt='KaamSathi' className='h-full w-full object-cover hidden sm:block' />
              </div>
              <span className='text-lg font-bold tracking-tight text-gray-900'>KaamSathi</span>
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


          <div className='absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white'>
            <button className='w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors' onClick={logout}>
              <LogOut className='h-5 w-5 flex-shrink-0 text-gray-500' />
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
          <header className='sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur'>
            <div className='h-16 px-4 md:px-6 flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3 min-w-0'>
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className='md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  {sidebarOpen ? (
                    <X className='h-5 w-5 text-gray-600' />
                  ) : (
                    <Menu className='h-5 w-5 text-gray-600' />

                  )}
                </button>
              )}
              <div >
                <h1 className='text-base md:text-lg font-semibold text-gray-900'>Welcome Back</h1>
                <p className='text-xs md:text-sm text-gray-500'>
                  Here's what's happening with your jobs today.
                </p>
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
