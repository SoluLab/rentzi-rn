// Base URLs for different environments
export const BASE_URLS = {
    DEVELOPMENT: {
    
      AUTH_API_RENTER: 'http://35.223.240.93:5000/api',
      AUTH_API_HOMEOWNER: 'http://35.223.240.93:5001/api',
     
  
    },
    STAGING: {
      AUTH_API_RENTER: 'http://35.223.240.93:5000/api',
      AUTH_API_HOMEOWNER: 'http://35.223.240.93:5001/api',
      
    },
    PRODUCTION: {
       
      AUTH_API_RENTER: 'http://35.223.240.93:5000/api',
      AUTH_API_HOMEOWNER: 'http://35.223.240.93:5001/api',
     
  
    },
  } as const;
  
  // Current environment
  const CURRENT_ENV: keyof typeof BASE_URLS = 'DEVELOPMENT';
  
  // Export the current base URLs
  export const API_URLS = {
    AUTH_API_RENTER: BASE_URLS[CURRENT_ENV].AUTH_API_RENTER,
    AUTH_API_HOMEOWNER: BASE_URLS[CURRENT_ENV].AUTH_API_HOMEOWNER,
    
  } as const;
  
  // API endpoints
  export const ENDPOINTS = {
    AUTH: {
      SIGNIN: '/auth/signin',
      SIGNUP: '/auth/signup',
      VERIFY_OTP: '/auth/verify-otp',
      VERIFY_LOGIN_OTP: '/auth/verify-login-otp',

      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      RESEND_OTP: '/auth/resend-otp',
      
      LOGOUT: '/auth/logout',
      
      PROFILE: '/profile',
    },
  
    HOMEOWNER_PROPERTY: {
      // Create and manage properties
      CREATE_PROPERTY: '/property', // Removed /api prefix since base URL already includes /api
      SAVE_DRAFT: '/property/save',
      SUBMIT_FOR_REVIEW: '/property/submit',
      GET_ALL_PROPERTIES: '/property',
      GET_PROPERTY_BY_ID: (id: string) => `/property/${id}`,
      UPDATE_PROPERTY: (id: string) => `/property/${id}`,
      DELETE_PROPERTY: (id: string) => `/property/${id}`,
      
      // Property media management
      UPLOAD_IMAGES: (id: string) => `/property/${id}/images`,
      DELETE_IMAGE: (id: string, imageName: string) => `/property/${id}/images/${imageName}`,
      UPLOAD_FILES: (id: string) => `/property/${id}/files`,
      DELETE_FILE: (id: string, fileName: string) => `/property/${id}/files/${fileName}`,
    },
  
  } as const;
  
  // Helper function to construct full API URLs
  export function getFullUrl(baseUrl: string, endpoint: string): string {
    return `${baseUrl}${endpoint}`;
  }
  
 