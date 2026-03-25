import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoutes = ({ requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  const normalizeRole = (role) => {
    const value = String(role || "")
      .toLowerCase()
      .trim()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");

    if (["client", "employer"].includes(value)) return "employer";
    if (["freelancer", "jobseeker", "job seeker"].includes(value)) {
      return "jobseeker";
    }
    if (value === "admin") return "admin";
    return value;
  };

  const userRole = normalizeRole(user?.role);
  const neededRole = normalizeRole(requiredRole);

  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (neededRole && userRole !== neededRole) {
    const fallbackPath =
      userRole === "admin"
        ? "/admin-dashboard"
        : userRole === "employer"
          ? "/employer-dashboard"
          : userRole === "jobseeker"
            ? "/freelancer-dashboard"
            : "/login";

    if (fallbackPath === location.pathname) {
      return <Navigate to="/login" replace />;
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
