import React from 'react'
import {useState,useEffect} from "react";

import {
  Briefcase,
  Building2,
  LogOut,
  Menu,
  X,
}from "lucide-react";
import {Link,useNavigate} from "react-router-dom";
import{useAuth} from "../../context/AuthContext";
import{NAVIGATION_MENU} from"../../utils/data";

const DashboardLayout = ({activeMenu}) => {

  const {user,logout}=useAuth();
  const navigate=useNavigate();

  const [sidebarOpen,setSidebarOpen]=useState(false);
  const[activeNavItem,setActiveNavItem]=useState(activeMenu || "dashboard");
  const[profileDropdownOpen,setProfileDropdownOpen]=useState(false);
  const[isMobile,setMobile]=useState(false);
  
  useEffect(()=>{
    const handleResize=()=>{
      const mobile=window.innerWidth<768;
      setMobile(mobile);
      if(!mobile){
        setSidebarOpen(false);
      }
    }
    handleResize();
    window.addEventListener("resize",handleResize);

    return()=>{
      window.removeEventListener("resize",handleResize);
    }
  },[]);

  return (
    <div >
      DashboardLayout
    </div>
  )
}

export default DashboardLayout
