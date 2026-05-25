import axios from "axios";

import { BASE_URL } from "./apiPaths";

export const AUTH_TOKEN_STORAGE_KEY = "nepstay_access_token";

export const getStoredAuthToken = () =>
  localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "";

export const storeAuthToken = (token) => {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, normalizedToken);
};

export const clearStoredAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    const responseToken = response?.data?.token;
    if (responseToken) {
      storeAuthToken(responseToken);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        clearStoredAuthToken();
      }
      if (error.response.status === 500) {
        console.error("Server error.Please try again later");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout.Please try again.");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
