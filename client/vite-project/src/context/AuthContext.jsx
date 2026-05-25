/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import axiosInstance, { clearStoredAuthToken, storeAuthToken } from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const AuthContext = createContext();
const LEGACY_THEME_KEY = "themePreference";
const ACTIVE_THEME_KEY = "themePreference:active";

const normalizeRole = (role) => {
  const value = String(role || "")
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (["client", "employer", "staff", "vendor"].includes(value)) return "hotelstaff";
  if (["freelancer", "jobseeker", "job seeker", "guest"].includes(value)) {
    return "customer";
  }
  if (value === "admin") return "admin";
  return value;
};

const normalizeUser = (sessionUser) => {
  if (!sessionUser) return null;
  return {
    ...sessionUser,
    role: normalizeRole(sessionUser.role),
  };
};

const isValidTheme = (value) => value === "light" || value === "dark";

const getThemeStorageKey = (sessionUser) => {
  const normalized = normalizeUser(sessionUser);
  const role = normalized?.role || "guest";
  const email = String(normalized?.email || "").toLowerCase().trim() || "anonymous";
  return `themePreference:${role}:${email}`;
};

const getStoredThemePreference = (sessionUser) => {
  const scopedTheme = localStorage.getItem(getThemeStorageKey(sessionUser));
  if (isValidTheme(scopedTheme)) {
    return scopedTheme;
  }

  const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
  if (isValidTheme(legacyTheme)) {
    return legacyTheme;
  }

  return null;
};

const persistThemePreference = (sessionUser, themePreference) => {
  if (!isValidTheme(themePreference)) {
    return;
  }

  localStorage.setItem(getThemeStorageKey(sessionUser), themePreference);
  localStorage.setItem(ACTIVE_THEME_KEY, themePreference);
  localStorage.removeItem(LEGACY_THEME_KEY);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimerRef = useRef(null);

  const clearSessionRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const scheduleSessionRefresh = (expiresInSeconds) => {
    clearSessionRefreshTimer();

    if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
      return;
    }

    const refreshLeadTimeSeconds = 120;
    const delayMs = Math.max((expiresInSeconds - refreshLeadTimeSeconds) * 1000, 10000);

    refreshTimerRef.current = setTimeout(async () => {
      await refreshSession();
    }, delayMs);
  };

  const applySessionState = (sessionUser, expiresInSeconds) => {
    const normalizedUser = normalizeUser(sessionUser);
    setUser(normalizedUser || null);
    setIsAuthenticated(Boolean(normalizedUser));
    if (normalizedUser?.themePreference) {
      persistThemePreference(normalizedUser, normalizedUser.themePreference);
    }
    scheduleSessionRefresh(expiresInSeconds);
  };

  const clearAuthState = ({ redirect = false } = {}) => {
    clearSessionRefreshTimer();
    setUser(null);
    setIsAuthenticated(false);
    clearStoredAuthToken();
    localStorage.removeItem(ACTIVE_THEME_KEY);
    localStorage.removeItem(LEGACY_THEME_KEY);
    document.documentElement.classList.remove("dark");

    if (redirect) {
        globalThis.location.href = "/";
    }
  };

  const fetchSession = async () => {
    const { data } = await axiosInstance.post(API_PATHS.AUTH.SESSION);
    if (data?.success && data?.user) {
      applySessionState(data.user, data?.session?.expiresInSeconds);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const initialTheme = localStorage.getItem(ACTIVE_THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY) || "light";
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    const selectedTheme =
      user?.themePreference ||
      getStoredThemePreference(user) ||
      localStorage.getItem(ACTIVE_THEME_KEY) ||
      "light";
    document.documentElement.classList.toggle("dark", selectedTheme === "dark");
    if (user) {
      persistThemePreference(user, selectedTheme);
    } else if (isValidTheme(selectedTheme)) {
      localStorage.setItem(ACTIVE_THEME_KEY, selectedTheme);
    }
  }, [user, user?.themePreference, user?.email, user?.role]);

  const performAuthCheck = async () => {
    try {
      const sessionOk = await fetchSession();
      if (sessionOk) {
        return true;
      }

      const { data } = await axiosInstance.post(API_PATHS.AUTH.IS_AUTHENTICATED);
      if (data?.success && data?.user) {
        applySessionState(data.user, null);
        return true;
      }

      clearAuthState();
      return false;
    } catch (error) {
      console.error("Auth check failed:", error);
      clearAuthState();
      return false;
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const runInitialAuthCheck = async () => {
      try {
        await performAuthCheck();
      } finally {
        setLoading(false);
      }
    };

    runInitialAuthCheck();
    return () => clearSessionRefreshTimer();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const checkAuthStatus = async () => {
    const isAuthenticatedNow = await performAuthCheck();
    setLoading(false);
    return isAuthenticatedNow;
  };

  const refreshSession = async () => {
    try {
      const { data } = await axiosInstance.post(API_PATHS.AUTH.REFRESH_SESSION);
      if (!data?.success || !data?.user) {
        clearAuthState({ redirect: true });
        return false;
      }

      applySessionState(data.user, data?.session?.expiresInSeconds);
      return true;
    } catch (error) {
      console.error("Session refresh failed:", error);
      clearAuthState({ redirect: true });
      return false;
    }
  };

  const login = (userData, token) => {
    const normalizedUser = normalizeUser(userData);
    if (token) {
      storeAuthToken(token);
    }
    setUser(normalizedUser);
    setIsAuthenticated(true);
    if (normalizedUser?.themePreference) {
      persistThemePreference(normalizedUser, normalizedUser.themePreference);
    }

    fetchSession().catch(() => {});
  };

  const logout = async () => {
    try {
      await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    clearAuthState({ redirect: true });
  };

  const updateUser = (updatedUserData) => {
    const newUserData = normalizeUser(user ? { ...user, ...updatedUserData } : { ...updatedUserData });
    setUser(newUserData);
    if (updatedUserData?.themePreference) {
      persistThemePreference(newUserData, updatedUserData.themePreference);
      document.documentElement.classList.toggle("dark", updatedUserData.themePreference === "dark");
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      updateUser,
      checkAuthStatus,
      refreshSession,
    }),
    [user, loading, isAuthenticated],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

