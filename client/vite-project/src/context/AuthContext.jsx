import React,{createContext,useContext,useState,useEffect} from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const AuthContext=createContext();

export const useAuth=()=>{
  const  context=useContext(AuthContext);
  if(!context){
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context;
};

export const AuthProvider=({children})=>{
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  const [isAuthenticated,setIsAuthenticated]=useState(false);

  useEffect(() => {
    const initialTheme = localStorage.getItem("themePreference") || "light";
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    const selectedTheme = user?.themePreference || localStorage.getItem("themePreference") || "light";
    document.documentElement.classList.toggle("dark", selectedTheme === "dark");
    localStorage.setItem("themePreference", selectedTheme);
  }, [user?.themePreference]);

  useEffect(()=>{
    checkAuthStatus();

  },[]);

  const checkAuthStatus=async()=>{
    try{
      const { data } = await axiosInstance.post(API_PATHS.AUTH.IS_AUTHENTICATED);
      if (data?.success && data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    }catch(error){
      console.error('Auth check failed:',error);
      setUser(null);
      setIsAuthenticated(false);
    }finally{
      setLoading(false);
    }
  };

  const login=(userData)=>{
      setUser(userData);
      setIsAuthenticated(true);
      if (userData?.themePreference) {
        localStorage.setItem("themePreference", userData.themePreference);
      }

  };

  const logout=async()=>{
   try {
    await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
   } catch (error) {
    console.error('Logout failed:', error);
   }
   setUser(null);
   setIsAuthenticated(false);
   localStorage.removeItem("themePreference");
   document.documentElement.classList.remove("dark");
   window.location.href='/'
  };

  const updateUser=(updatedUserData)=>{
    const newUserData={...(user || {}), ...updatedUserData};
    setUser(newUserData);
    if (updatedUserData?.themePreference) {
      localStorage.setItem("themePreference", updatedUserData.themePreference);
      document.documentElement.classList.toggle("dark", updatedUserData.themePreference === "dark");
    }
  };

  const value={
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

