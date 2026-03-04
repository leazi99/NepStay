import React, { useState, useEffect } from 'react'
import {
  Plus,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import moment from "moment";

import { useNavigate } from "react-router-dom";
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';



const EmployerDashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = React.useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardOverview = async () => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.get(API_PATHS.DASHBOARD.OVERVIEW);
      if (response.status === 200) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDashboardOverview();
    return () => { };

  }, [])
  

  return (
    <DashboardLayout >
      Employer Dashboard
    </DashboardLayout>
  )
}

export default EmployerDashboard
