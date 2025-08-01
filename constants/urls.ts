// Base URLs for different environments
export const BASE_URLS = {
    DEVELOPMENT: {
      PARCEL_API: 'https://parcel-data.landhacker.ai/api/v1',
      AUTH_API_RENTER: 'http://35.223.240.93:5000/api',
      AUTH_API_HOMEOWNER: 'http://35.223.240.93:5001/api',
      CAMPAIGN_API: 'https://campaign-api.landhacker.ai/api/v1',
      STRIPE_CHECKOUT: 'https://test-stripe-checkout.com',
      PARCEL_DATA_API: 'https://parcel-data.landhacker.ai/api/v1',
      PAYPAL_URL:'https://dev-payment-api.landhacker.ai/api/v1',
      VALUATION_API:'https://dev-price-generation-api.landhacker.ai/api/v1',
      SUBDIVISION_API:'https://dev-subdivision-api.landhacker.ai/api/v1',
      PDF_URL:'https://dev-landguider-app-offer-generation.s3.eu-north-1.amazonaws.com',
      BALANCE_API:'https://dev-user.landhacker.ai/api/v1',
      SELLER_BUYER_API:'https://dev-user.landhacker.ai/api/v1',
      CHAT_AI:'https://dev-ai-api.landhacker.ai/api/'
  
    },
    STAGING: {
      PARCEL_API: 'https://parcel-data.landhacker.ai/api/v1',
      AUTH_API_RENTER: 'http://35.223.240.93:5000/api',
      AUTH_API_HOMEOWNER: 'http://35.223.240.93:5001/api',
      CAMPAIGN_API: 'https://campaign-api.landhacker.ai/api/v1',
      STRIPE_CHECKOUT: 'https://test-stripe-checkout.com',
      PARCEL_DATA_API: 'https://parcel-data.landhacker.ai/api/v1',
      PAYPAL_URL:'https://dev-payment-api.landhacker.ai/api/v1',
      VALUATION_API:'https://dev-price-generation-api.landhacker.ai/api/v1',
      SUBDIVISION_API:'https://dev-subdivision-api.landhacker.ai/api/v1',
      PDF_URL:'https://dev-landguider-app-offer-generation.s3.eu-north-1.amazonaws.com',
      BALANCE_API:'https://dev-user.landhacker.ai/api/v1',
      SELLER_BUYER_API:'https://dev-user.landhacker.ai/api/v1',
    CHAT_AI:'https://dev-ai-api.landhacker.ai/api/'
    },
    PRODUCTION: {
      PARCEL_API: 'https://parcel-data.landhacker.ai/api/v1',
      AUTH_API_RENTER: 'http://35.223.240.93:5000/api',
      AUTH_API_HOMEOWNER: 'http://35.223.240.93:5001/api',
      CAMPAIGN_API: 'https://campaign-api.landhacker.ai/api/v1',
      STRIPE_CHECKOUT: 'https://checkout.stripe.com', // Use real Stripe URL in production
      PARCEL_DATA_API: 'https://parcel-data.landhacker.ai/api/v1',
      PAYPAL_URL:'https://dev-payment-api.landhacker.ai/api/v1',
      VALUATION_API:'https://dev-price-generation-api.landhacker.ai/api/v1',
      SUBDIVISION_API:'https://dev-subdivision-api.landhacker.ai/api/v1',
      PDF_URL:'https://dev-landguider-app-offer-generation.s3.eu-north-1.amazonaws.com',
      BALANCE_API:'https://dev-user.landhacker.ai/api/v1',
      SELLER_BUYER_API:'https://dev-user.landhacker.ai/api/v1',
      CHAT_AI:'https://dev-ai-api.landhacker.ai/api/'
  
    },
  } as const;
  
  // Current environment
  const CURRENT_ENV: keyof typeof BASE_URLS = 'DEVELOPMENT';
  
  // Export the current base URLs
  export const API_URLS = {
    PARCEL_API: BASE_URLS[CURRENT_ENV].PARCEL_API,
    AUTH_API_RENTER: BASE_URLS[CURRENT_ENV].AUTH_API_RENTER,
    AUTH_API_HOMEOWNER: BASE_URLS[CURRENT_ENV].AUTH_API_HOMEOWNER,
    CAMPAIGN_API: BASE_URLS[CURRENT_ENV].CAMPAIGN_API,
    STRIPE_CHECKOUT: BASE_URLS[CURRENT_ENV].STRIPE_CHECKOUT,
    SELLER_BUYER_API: BASE_URLS[CURRENT_ENV].SELLER_BUYER_API,
    BALANCE_API: BASE_URLS[CURRENT_ENV].BALANCE_API,
  } as const;
  
  // API endpoints
  export const ENDPOINTS = {
    AUTH: {
      SIGNIN: '/auth/signin',
      SIGNUP: '/auth/signup',
      FORGOT_PASSWORD: '/auth/forgot-password',
      VERIFY_OTP: '/auth/verify-otp',
      RESET_PASSWORD: '/auth/reset-password',
      
      REFRESH_TOKEN: '/auth/refresh-token',
      VERIFY_EMAIL: '/auth/verify-email',
      RESEND_OTP: '/auth/resend-otp',
      CHECK_EMAIL: '/auth/check-email',
      LOGOUT: '/auth/logout',

      VERIFY_EMAIL_OTP: '/auth/verify-email-otp',
      VERIFY_MOBILE_OTP: '/auth/verify-mobile-otp',
      SEND_FORGOT_PASSWORD_OTP: '/auth/send-forgot-password-otp',
      VERIFY_FORGOT_PASSWORD_OTP: '/auth/verify-forgot-password-otp',
    },
    PARCEL: {
      ADVANCED_SEARCH: '/parcel/advanceSearch',
      GET_PARCEL_DATA: '/parcel/search/region',
      SEARCH_AREA: '/parcel/search/area',
    },
    CAMPAIGN: {
      SCHEDULE: '/campaign/schedule',
      TOKEN_BALANCE: '/campaign/token-balance',
      PURCHASE_TOKENS: '/campaign/purchase-tokens'
    },
    PAYMENT:{
      PAYMENT_METHODS: '/paymentMethod',
      CREATE_PAYMENT: '/payment/create',
      CAPTURE_PAYMENT: '/payment/capture',
      GET_BALANCE: '/fiatCredits/balance',
      CONVERT_FIAT_CREDITS: '/fiatCredits/convert',
      CALCULATE_FIAT_CREDITS: '/fiatCredits/calculate'
    },
    VALUATION:{
      PROPERTY_VALUATION:'/propertyValuation',
      OFFER_GENERATION:'/offerGeneration'
    },
    SUBDIVISION:{
      VALIDATE:'/sub-division/validate',
      GENERATE:'/sub-division',
      GET_BY_ID:'/sub-division'
    },
    PROPERTY: {
      CREATE: '/property/sell/create',
      FILE_UPLOAD_SINGLE: '/property/fileUpload/single',
      FILE_UPLOAD_MULTIPLE: '/property/fileUpload/multiple',
      GET_PROPERTY_TYPES: '/property-type',
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
    MAILING:{
      IS_EXIST:'/mailScheduling/is-exist'
    },
    HELP:{
      SUPPORT_REQUEST:'/support/request',
      MY_REQUESTS:'/support/my-requests',
      CONTACT_FORM:'/contact'
    },
    LEADS:{
      CREATE: '/leads/',
      GET_ALL: '/leads',
      GET_BY_ID: (id: string) => `/leads/${id}`,
      UPDATE: (id: string) => `/leads/${id}`,
      DELETE: (id: string) => `/leads/${id}`,
      MATCH_CHECK: '/leads/match-check',
      MATCH_DETAILS: (matchId: string) => `/matches/${matchId}`
    },
    CHAT: {
      CREATE_ROOM: '/chatRoom/',
      GET_ROOMS: '/chatRoom/',
      GET_MESSAGES: (chatId: string) => `/chatRoom/${chatId}/messages`,
      SEND_MESSAGE: (chatId: string) => `/chatRoom/${chatId}/messages`,
      ADD_PARTICIPANTS: (chatId: string) => `/chatRoom/${chatId}/participants`,
      REMOVE_PARTICIPANT: (chatId: string, participantId: string) => `/chatRoom/${chatId}/participants/${participantId}`,
      LEAVE_GROUP: (chatId: string) => `/chatRoom/${chatId}/leave`,
      DELETE_GROUP: (chatId: string) => `/chatRoom/${chatId}`,
    }
  } as const;
  
  // Helper function to construct full API URLs
  export function getFullUrl(baseUrl: string, endpoint: string): string {
    return `${baseUrl}${endpoint}`;
  }
  
  // TypeScript interfaces for property-related requests
  export interface PropertyCreateRequest {
    title: string;
    description: string;
    price: number;
    address: string;
    location: string;
    coordinates: string;
    area: number;
    features: string;
    propertyType: string;
    thumbnail: string;
    images: string[];
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    createdVia: 'user';
    status: string;
  }
  
  export interface FileUploadSingleRequest {
    file: File;
    category: string;
  }
  
  export interface FileUploadMultipleRequest {
    images: File[];
    documents: File[];
    category: string;
  }
  
  export const AMAZON_S3_SUBDIVISION_BASE_URL = 'https://dev-landguider-app-sub-division.s3.eu-north-1.amazonaws.com/'; 