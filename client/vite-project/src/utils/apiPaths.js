export const BASE_URL = "http://localhost:4000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    SEND_VERIFY_OTP: "/api/auth/send-otp",
    VERIFY_ACCOUNT: "/api/auth/verify-Account",
    IS_AUTHENTICATED: "/api/auth/isAuthenticated",
    SESSION: "/api/auth/session",
    REFRESH_SESSION: "/api/auth/refresh-session",
    SEND_RESET_OTP: "/api/auth/send-reset-otp",
    RESET_PASSWORD: "/api/auth/reset-password",
    UPLOAD_RESUME: "/api/auth/upload-resume",
    UPLOAD_VERIFICATION_DOC: "/api/auth/upload-verification-doc",
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
    CHANGE_PASSWORD: "/api/users/change-password",
    DELETE_RESUME: "/api/users/delete-resume",
    GET_PUBLIC_PROFILE: (id) => `/api/users/${id}`,
  },

  MESSAGES: {
    GET_ROOMS: "/api/messages/rooms",
    CREATE_OR_GET_ROOM: "/api/messages/rooms",
    GET_MESSAGES_BY_ROOM: (roomId) => `/api/messages/${roomId}`,
    SEND_MESSAGE: (roomId) => `/api/messages/${roomId}`,
  },

  NOTIFICATIONS: {
    GET_ALL: "/api/notifications",
    READ_ALL: "/api/notifications/read-all",
    READ_ONE: (notificationId) => `/api/notifications/${notificationId}/read`,
  },

  PAYMENTS: {
    GET_EMPLOYER_PAYMENTS: "/api/payments",
    CREATE_PAYMENT: "/api/payments",
    GET_ELIGIBLE_APPLICATIONS: "/api/payments/eligible-applications",
    CREATE_STRIPE_CHECKOUT_SESSION: "/api/payments/checkout-session",
    CREATE_STRIPE_INTENT: "/api/payments/create-intent",
    CONFIRM_STRIPE_INTENT: "/api/payments/confirm-intent",
    CREATE_KHALTI_SESSION: "/api/payments/khalti/initiate",
    CONFIRM_KHALTI_PAYMENT: "/api/payments/khalti/confirm",
  },

  REVIEWS: {
    CREATE: "/api/reviews",
    GET_ELIGIBLE: "/api/reviews/eligible",
    GET_RECEIVED: "/api/reviews/received",
    GET_GIVEN: "/api/reviews/given",
  },

  ADMIN: {
    OVERVIEW: "/api/admin/overview",
    GET_USERS: "/api/admin/users",
    UPDATE_USER: (userId) => `/api/admin/users/${userId}`,
    GET_PAYMENTS: "/api/admin/payments",
    UPDATE_PAYMENT_STATUS: (paymentId) =>
      `/api/admin/payments/${paymentId}/status`,
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
};
