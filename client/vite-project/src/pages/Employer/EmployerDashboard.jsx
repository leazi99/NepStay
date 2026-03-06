import React, { useState, useEffect } from 'react'
import {
  Plus,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';




const EmployerDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardOverview = async () => {
    try {
      setIsLoading(true);

      await axiosInstance.get(API_PATHS.DASHBOARD.OVERVIEW);
    } catch (error) {
      console.log("error fetching dashboard overview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDashboardOverview();
    return () => { };

  }, []);


  return (
    <DashboardLayout activeMenu='/employer-dashboard'>
      {
        isLoading ? <LoadingSpinner /> :
          <div className='max-w-7xl mx-auto space-y-8'>
            Employer Dashboard
          </div>
      }

    </DashboardLayout>
  )
}

export default EmployerDashboard
