import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoutes = ({ requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  
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

  if (requiredRole && user?.role !== requiredRole) {
    
    return <Navigate to={user?.role === 'employer' ? '/employer-dashboard' : '/freelancer-dashboard'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
