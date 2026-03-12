export const BASE_URL = "http://localhost:4000";

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
  },

  JOBS: {
    GET_ALL_JOBS: "/api/jobs",
    GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
    POST_JOB: "/api/jobs",
    GET_JOBS_EMPLOYER: "/api/jobs/get-jobs-employer",
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,
    SAVE_JOB: (id) => `/api/save-jobs/save/${id}`,
    UNSAVE_JOB: (id) => `/api/save-jobs/unsave/${id}`,
    GET_SAVED_JOBS: "/api/save-jobs",
  },

  APPLICATIONS: {
    APPLY_TO_JOB: "/api/applications",
    GET_MY_APPLICATIONS: "/api/applications",
    GET_APPLICATIONS_FOR_JOB: (jobId) => `/api/applications/job/${jobId}`,
    GET_APPLICATION_BY_ID: (id) => `/api/applications/${id}`,
    UPDATE_STATUS: (id) => `/api/applications/${id}`,
  },

  ANALYTICS: {
    EMPLOYER_ANALYTICS: "/api/analytics/overview",
  },

  USERS: {
    UPDATE_PROFILE: "/api/users/update-profile",
    DELETE_RESUME: "/api/users/delete-resume",
    GET_PUBLIC_PROFILE: (id) => `/api/users/${id}`,
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
};
