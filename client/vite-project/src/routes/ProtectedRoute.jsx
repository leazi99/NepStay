import React from 'react'
import {Navigate,Outlet,useLocation}from 'react-router-dom';


const ProtectedRoutes = ({requiredRole}) => {
  return<Outlet />
}

export default ProtectedRoutes
