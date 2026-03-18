import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoutes = ({ requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  const normalizeRole = (role) => {
    const value = String(role || "").toLowerCase();
    if (value === "client") return "employer";
    if (value === "freelancer") return "jobseeker";
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
    
    return <Navigate to={userRole === 'employer' ? '/employer-dashboard' : '/freelancer-dashboard'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
