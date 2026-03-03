export const BASE_URL = "http://localhost:5000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    SEND_VERIFY_OTP: "/api/auth/send-otp",
    VERIFY_ACCOUNT: "/api/auth/verify-Account",
    IS_AUTHENTICATED: "/api/auth/isAuthenticated",
    SEND_RESET_OTP: "/api/auth/send-reset-otp",
    RESET_PASSWORD: "/api/auth/reset-password",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/uprofile",
    DELETE_RESUME: "/api/auth/resume",
  },

  DASHBOARD: {
    OVERVIEW: "/api/dashboard/overview",
  },

  JOBS: {
    GET_ALL_JOBS: "/api/jobs",
    GET_JOB_By_ID: (id) => `/api/jobs/${id}`,
    POST_JOB: "/api/jobs",
    GET_JOBS_EMPLOYER: "/api/jobs/get-jobs-employer",
    GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,

    SAVE_JOB: (id) => `/api/save-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/save-jobs/${id}`,
    GET_SAVED_JOBS: `api/save-jobs/user`,
  },

  APPLICATIONS:{
    APPLY_TO_JOB:(id)=>`/api/applications/${id}`,
    GET_ALL_APPLICATIONS:(id) =>`/api/applications/job/${id}`,
    UPDATE_STATUS:(id)=>`api/applications/${id}/status`
  },
  IMAGE:{
    UPLOAD_IMAGE:"/api/auth/upload-image",
  },
};
