import React, { Children } from 'react'
import { useState, useEffect } from "react";

import {
  Briefcase,
  Building2,
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

const NavigationItem = ({
  item, isActive, onClick, isCollapsed, badgeCount
}) => {
  const Icon = item.icon

  return <button
    onClick={() => onClick(item.id)}
    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group${isActive
      ? "bg-blue-50 text-blue-700 shadow-blue-50 "
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
  >
    <Icon
      className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-500"
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
      <div className='flex h-screen bg-gray-50'>
        <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
          } ${sidebarCollapsed ? "w-16" : "w-64"} bg-white border-r border-gray-200`}>

          <div className='flex items-center h-16 border-b border-gray-200 px-5'>
            <Link className="inline-flex items-center gap-2.5" to='/'>
              <div className='h-9 w-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm'>
                <Briefcase className='h-5 w-5 text-white' />
              </div>
              <span className='text-gray-900 font-bold text-lg tracking-tight'>KaamSathi</span>
            </Link>
          </div>

          <nav className=''>
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


          <div className='absolute bottom-4 left-4 right-4'>
            <button className='w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-100' onClick={logout}>
              <LogOut className='h-5 w-5 flex-shrink-0 text-gray-500' />
              {!sidebarCollapsed && <span className=''>Logout</span>}
            </button>
          </div>
        </div>

        {
          isMobile && sidebarOpen && (
            <div
              className='fixed inset-0 bg-black bg-opacity-25 z-40 backdrop-blur-sm'
              onClick={() => setSidebarOpen(false)}
            />
          )
        }

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"}`}
        >
          <header className='bg-white/80 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0  z-30'>
            <div className='flex items-center space-x-4'>
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className='p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200'
                >
                  {sidebarOpen ? (
                    <X className='h-5 w-5 text-gray-600' />
                  ) : (
                    <Menu className='h-5 w-5 text-gray-600' />

                  )}
                </button>
              )}
              <div >
                <h1 className='text-base font-semibold text-gray-900'>Welcome Back</h1>
                <p className='text-sm text-gray-500 hidden sm:block'>
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
          </header>
          <main className='flex-1 overflow-auto p-6'>
            {children}
          </main>
        </div>
      </div>
    </>
  );
};
export default DashboardLayout
