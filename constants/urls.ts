export const BASE_URLS = {
  DEVELOPMENT: {
    AUTH_API_RENTER: "http://35.223.240.93:5000/api",
    AUTH_API_HOMEOWNER: "http://35.223.240.93:5001/api",
  },
  STAGING: {
    AUTH_API_RENTER: "http://35.223.240.93:5000/api",
    AUTH_API_HOMEOWNER: "http://35.223.240.93:5001/api",
  },
  PRODUCTION: {
    AUTH_API_RENTER: "http://35.223.240.93:5000/api",
    AUTH_API_HOMEOWNER: "http://35.223.240.93:5001/api",
  },
} as const;

// Centralized base URL functions
export const getAuthBaseURL = (userType: 'renter' | 'homeowner' = 'homeowner') => {
  // For now, default to DEVELOPMENT. Change this to 'PRODUCTION' when deploying
  const environment: keyof typeof BASE_URLS = 'DEVELOPMENT';
  
  return userType === 'renter' 
    ? BASE_URLS[environment].AUTH_API_RENTER 
    : BASE_URLS[environment].AUTH_API_HOMEOWNER;
};

export const getRenterAuthBaseURL = () => getAuthBaseURL('renter');
export const getHomeownerAuthBaseURL = () => getAuthBaseURL('homeowner');

export const APP_URLS = {
  TERMS_AND_CONDITIONS: "https://www.google.com/",
  PRIVACY_POLICY: "https://www.google.com/",
}

// Current environment
const CURRENT_ENV: keyof typeof BASE_URLS = "DEVELOPMENT";

// Export the current base URLs (keeping for backward compatibility)
export const API_URLS = {
  AUTH_API_RENTER: BASE_URLS[CURRENT_ENV].AUTH_API_RENTER,
  AUTH_API_HOMEOWNER: BASE_URLS[CURRENT_ENV].AUTH_API_HOMEOWNER,
} as const;

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    // Authentication
    SIGNIN: "/auth/signin",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",

    // OTP Verification
    VERIFY_OTP: "/auth/verify-otp",
    VERIFY_LOGIN_OTP: "/auth/verify-login-otp",
    RESEND_OTP: "/auth/resend-otp", 
    VERIFY_FORGOT_PASSWORD_OTP: "/auth/verify-forgot-password-otp",

    // Password Management
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  HOMEOWNER_PROPERTY: {
    // Create and manage properties
    CREATE_PROPERTY: "/property",
    SAVE_DRAFT: (id: string) => `/property/${id}/save`,
    SUBMIT_FOR_REVIEW: "/property/submit",

    UPDATE_PROPERTY: (id: string) => `/property/${id}`,
    DELETE_PROPERTY: (id: string) => `/property/${id}`,

    // Property media management
    UPLOAD_IMAGES: (id: string) => `/property/${id}/images`,
    DELETE_IMAGE: (id: string, imageName: string) =>
      `/property/${id}/images/${imageName}`,
    UPLOAD_FILES: (id: string) => `/property/${id}/files`,
    DELETE_FILE: (id: string, fileName: string) =>
      `/property/${id}/files/${fileName}`,
  },

  HOMEOWNER_DASHBOARD: {
    STATS: "/dashboard/stats",
    GET_ALL_PROPERTIES: "/property",
    GET_PROPERTY_BY_ID: (id: string) => `/property/${id}`,
  },

  HOMEOWNER_PROFILE: {
    GET: "/profile",
    UPDATE: "/profile",
    CHANGE_PASSWORD: "/profile/change-password",
  },

  RENTER_INVESTOR: {
    PROFILE: {
      GET: "/profile",
      UPDATE: "/profile",
      CHANGE_PASSWORD: "/profile/change-password",
      KYC_INITIALIZE: "/profile/kyc/initialize",
    },
  },

  MARKETPLACE: {
    // Property listing and management
    GET_ALL_PROPERTIES: "/marketplace/properties",
    GET_PROPERTY_BY_ID: (id: string) => `/marketplace/properties/${id}`,
    CREATE_PROPERTY: "/marketplace/properties",
    UPDATE_PROPERTY: (id: string) => `/marketplace/properties/${id}`,
    DELETE_PROPERTY: (id: string) => `/marketplace/properties/${id}`,

    // Property search and filters
    SEARCH_PROPERTIES: "/marketplace/properties/search",
    GET_FEATURED_PROPERTIES: "/marketplace/properties/featured",
    GET_RECOMMENDED_PROPERTIES: "/marketplace/properties/recommended",

    // Property reviews and ratings
    GET_PROPERTY_REVIEWS: (id: string) =>
      `/marketplace/properties/${id}/reviews`,
    ADD_PROPERTY_REVIEW: (id: string) =>
      `/marketplace/properties/${id}/reviews`,
    UPDATE_PROPERTY_REVIEW: (id: string, reviewId: string) =>
      `/marketplace/properties/${id}/reviews/${reviewId}`,
    DELETE_PROPERTY_REVIEW: (id: string, reviewId: string) =>
      `/marketplace/properties/${id}/reviews/${reviewId}`,
  },
} as const;
