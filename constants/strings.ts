// Error Messages
export const ERROR_MESSAGES = {

  AUTH: {
    LOGIN_REQUIRED: 'Please login to search for parcels',
    TOKEN_MISSING: 'Please login to continue',
    PERMISSION_DENIED: 'Permission denied. Please try again.',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_MOBILE_EMAIL: 'Please enter a valid email address or mobile number',
    INVALID_PASSWORD: 'Password must be at least 6 characters',
    LOGIN_FAILED: 'Login failed. Please try again.',
    INVALID_CREDENTIALS: 'Invalid credentials. Please check your email and password.',
    EMAIL_NOT_FOUND: 'Email not found. Please check your email or sign up.',
    EMAIL_VERIFICATION_REQUIRED: 'Email verification required. Please check your inbox.',
    ACCOUNT_BLOCKED: 'Your account has been blocked. Please contact support.',
    EMPTY_FIELDS: 'Please enter your email and password',
    PASSWORDS_DONT_MATCH: 'Passwords do not match',
    EMAIL_EXISTS: 'Email already registered. Please use a different email or login.',
    FILL_ALL_FIELDS: 'Please fill in all fields',
    EMAIL_REQUIRED: 'Please enter your email',
    VERIFICATION_CODE_REQUIRED: 'Please enter the verification code',
    PASSWORDS_REQUIRED: 'Please enter both passwords',
    INVALID_VERIFICATION: 'Invalid verification session. Please try again.',
    RESET_FAILED: 'Failed to reset password. Please try again.',
    CODE_SEND_FAILED: 'Failed to send verification code. Please try again.',
    NEW_CODE_SEND_FAILED: 'Failed to resend verification code. Please try again.',
    VERIFICATION_ID_NOT_FOUND: 'Verification ID not found',
  },
  NETWORK: {
    FETCH_FAILED: 'Failed to fetch parcel details',
    REQUEST_FAILED: 'API request failed',
    CONNECTION_ERROR: 'Network connection error. Please check your internet connection.',
    UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
  },
  SEARCH: {
    NO_RESULTS: 'No parcel found at this location',
    INVALID_COORDINATES: 'Invalid coordinates provided',
    FAILED: 'Failed to search location',
  },
  LOCATION: {
    PERMISSION_REQUIRED: 'Location permission is required for this feature',
    FAILED_TO_GET: 'Failed to get location permission. Please try again.',
  },
  PARCEL: {
    NOT_FOUND: 'No parcel found at this location',
    INSUFFICIENT_DATA: 'Insufficient data for valuation comparison',
  },
  DRAWING: {
    MIN_POINTS: 'Please draw at least 3 points to create an area',
    CALCULATION_FAILED: 'Failed to calculate area. Please try again.',
  }
};

// Button Text
export const BUTTON_TEXT = {
  CLOSE: 'Close',
  CANCEL: 'Cancel',
  CONFIRM: 'Confirm',
  RETRY: 'Retry',
  SHOW_ON_MAP: 'Show on Map',
  GENERATE_COMPS: 'Generate Comps',
  MEASURE: 'Measure',
  DRAW_AREA: 'Draw Area',
  START_DRAWING: 'Start Drawing',
  FINISH_DRAWING: 'Finish Drawing',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PARCEL: {
    DETAILS_FOUND: 'Parcel details found',
    COMPS_FOUND: 'Comparable properties found!',
    AREA_CALCULATED: (acres: number) => `Area calculated: ${acres.toFixed(2)} acres`,
  },
  SEARCH: {
    COMPLETED: 'Search completed successfully',
    NO_RESULTS: 'Intelligent search completed with 0 results',
  },
};

// Modal Titles
export const MODAL_TITLES = {
  PARCEL_DETAILS: 'Parcel Details',
  AREA_MEASUREMENT: 'Area Measurement',
  FILTER_AREA: 'Filter Area',
  COMPS: 'Comparable Properties',
  DRAW_CONFIRMATION: 'Confirm Drawing',
};

// Label Text
export const LABELS = {
  OWNER_NAME: 'Owner Name',
  MAILING_ADDRESS: 'Mailing Address',
  PHYSICAL_ADDRESS: 'Physical Address',
  PARCEL_ID: 'Parcel ID',
  LEGAL_DESCRIPTION: 'Legal Description',
  COUNTY: 'County',
  PROPERTY_TYPE: 'Property Type',
  ASSESSED_VALUE: 'Assessed Value',
  FLOOD_ZONE: 'Flood Zone Status',
  AREA: 'Area',
  PERIMETER: 'Perimeter',
};

// Accessibility Labels
export const ACCESSIBILITY = {
  MAP: {
    VIEW: 'Map view for drawing area or measuring distance',
    CLOSE_BUTTON: 'Close map',
    DRAW_BUTTON: 'Start drawing area on map',
    GENERATE_COMPS: 'Generate comparable properties',
    GENERATE_COMPS_HINT: 'Opens the comparable properties modal'
  },
  BUTTONS: {
    GENERATE_COMPS: {
      ENABLED: 'Generate property valuation comparables',
      DISABLED: 'Property valuation not available - insufficient data',
    },
    SHOW_MAP: 'Show on map',
  },
  HINTS: {
    GENERATE_COMPS: {
      ENABLED: 'Tap to view comparable properties and valuation data',
      DISABLED: 'This property does not have enough data for valuation',
    },
  },
};

// Status Messages
export const STATUS_MESSAGES = {
  LOADING: 'Loading...',
  PROCESSING: 'Processing...',
  GENERATING_COMPS: 'Generating property comparables...',
  RETRYING: (attempt: number, max: number) => `Retrying... Attempt ${attempt} of ${max}`,
  INSUFFICIENT_DATA: 'Insufficient data for valuation',
};

// Unit Labels
export const UNIT_LABELS = {
  SQUARE_FEET: 'ft²',
  SQUARE_METERS: 'm²',
  ACRES: 'acres',
};

// Search Related Text
export const SEARCH = {
  PLACEHOLDER: 'Search for a location...',
  NO_RESULTS: 'No results found',
  SEARCHING: 'Searching...',
};

// Default Values
export const DEFAULT_VALUES = {
  NOT_AVAILABLE: 'Not Available',
  UNKNOWN: 'Unknown',
};

// Authentication Related Text
export const AUTH = {
  LOGIN: {
    TITLE: 'Login',
    SUBTITLE: 'Welcome back! Please sign in to continue.',
    EMAIL_LABEL: 'Email',
    EMAIL_PLACEHOLDER: 'Enter your email',
    EMAIL_HINT: 'Enter your email address',
    PASSWORD_LABEL: 'Password',
    PASSWORD_PLACEHOLDER: 'Enter your password',
    PASSWORD_HINT: 'Enter your password',
    FORGOT_PASSWORD: 'Forgot Password?',
    LOGIN_BUTTON: 'Login',
    SIGNUP_TEXT: "Don't have an account?",
    SIGNUP_LINK: 'Sign up',
    SUCCESS: 'Successfully logged in!',
  },
  SIGNUP: {
    TITLE: 'Sign Up',
    SUBTITLE: 'Create your account to get started.',
    NAME_LABEL: 'Full Name',
    NAME_PLACEHOLDER: 'Enter your full name',
    EMAIL_LABEL: 'Email',
    EMAIL_PLACEHOLDER: 'Enter your email',
    PASSWORD_LABEL: 'Password',
    PASSWORD_PLACEHOLDER: 'Enter your password (min 6 characters)',
    CONFIRM_PASSWORD_LABEL: 'Confirm Password',
    CONFIRM_PASSWORD_PLACEHOLDER: 'Confirm your password',
    CREATE_ACCOUNT_BUTTON: 'Create Account',
    LOGIN_TEXT: 'Already have an account?',
    LOGIN_LINK: 'Login',
    SUCCESS: 'Account created successfully! Please verify your email.',
  },
  FORGOT_PASSWORD: {
    TITLE: 'Reset Password',
    SUBTITLE_INITIAL: 'Enter your email address to receive a verification code',
    SUBTITLE_CODE_SENT: 'Enter the verification code sent to your email',
    SUBTITLE_CODE_SENT_OTP: 'OTP sent to your email successfully!',
    EMAIL_LABEL: 'Email',
    EMAIL_PLACEHOLDER: 'Enter your registered email',
    VERIFICATION_CODE_LABEL: 'Verification Code',
    VERIFICATION_CODE_PLACEHOLDER: 'Enter verification code',
    NEW_PASSWORD_LABEL: 'New Password',
    NEW_PASSWORD_PLACEHOLDER: 'Enter new password',
    CONFIRM_PASSWORD_LABEL: 'Confirm Password',
    CONFIRM_PASSWORD_PLACEHOLDER: 'Confirm new password',
    RESET_PASSWORD_BUTTON: 'Reset Password',
    SEND_CODE_BUTTON: 'Send Code',
    RESEND_CODE_BUTTON: 'Resend Code',
    STEPS: {
      EMAIL: {
        TITLE: 'Enter your email',
        DESCRIPTION: "We'll send a verification code to your registered email address.",
        EMAIL_LABEL: 'Email',
        EMAIL_PLACEHOLDER: 'Enter your registered email',
        SEND_CODE_BUTTON: 'Send Code',
      },
      OTP: {
        TITLE: 'Enter verification code',
        DESCRIPTION: 'Please enter the verification code sent to {email}',
        CODE_LABEL: 'Verification Code',
        CODE_PLACEHOLDER: 'Enter verification code',
        VERIFY_BUTTON: 'Verify Code',
        RESEND_BUTTON: 'Resend Code',
      },
      PASSWORD: {
        TITLE: 'Set new password',
        DESCRIPTION: 'Enter and confirm your new password',
        NEW_PASSWORD_LABEL: 'New Password',
        NEW_PASSWORD_PLACEHOLDER: 'Enter new password',
        CONFIRM_PASSWORD_LABEL: 'Confirm Password',
        CONFIRM_PASSWORD_PLACEHOLDER: 'Confirm new password',
        RESET_BUTTON: 'Reset Password',
      },
    },
    SUCCESS: {
      CODE_SENT: 'Verification code sent to your email',
      NEW_CODE_SENT: 'New verification code sent to your email',
      RESET_SUCCESS: 'Password reset successful! Please login with your new password.',
    },
  },
  ACCESSIBILITY: {
    SHOW_PASSWORD: 'Show password',
    HIDE_PASSWORD: 'Hide password',
    LOGIN_BUTTON: 'Login',
    FORGOT_PASSWORD: 'Forgot password',
    SIGNUP: 'Sign up',
    BACK_BUTTON: 'Go back',
    SHOW_CONFIRM_PASSWORD: 'Show confirm password',
    HIDE_CONFIRM_PASSWORD: 'Hide confirm password',
    SEND_CODE: 'Send verification code',
    RESET_PASSWORD: 'Reset password',
    RESEND_CODE: 'Resend verification code',
    VERIFY_CODE: 'Verify code',
  },
};

// About Screen Text
export const ABOUT = {
  TITLE: 'About',
  APP_NAME: 'Parcel Search App',
  APP_DESCRIPTION: 'This application provides comprehensive parcel search functionality, allowing users to search for property information by parcel number or owner name. Access detailed property information, ownership history, and transaction records all in one convenient location.',
  VERSION_INFO: {
    TITLE: 'Version Information',
    VERSION: 'Version:',
    VERSION_VALUE: 'v1.0.0',
    BUILD: 'Build:',
    BUILD_VALUE: '2024.01.001',
  },
  CONTACT: {
    TITLE: 'Developer Contact',
    EMAIL: 'Email:',
    EMAIL_VALUE: 'developer@parcelapp.com',
    SUPPORT: 'Support:',
    SUPPORT_VALUE: 'support@parcelapp.com',
  },
};

// Home Screen Text
export const HOME = {
  TITLE: 'Parcel Search',
  SUBTITLE: 'Enter a parcel number or owner name to search parcel details',
  SEARCH: {
    LABEL: 'Search',
    PLACEHOLDER: 'Enter parcel number or address',
    BUTTON: 'Search',
    ERROR: {
      MIN_CHARS: 'Please enter at least 3 characters to search',
      INVALID_QUERY: 'Invalid parcel number or owner name',
    },
  },
  LAND_OPPORTUNITIES: {
    TITLE: 'Land Opportunities',
    SELL_BUTTON: 'Sell My Land',
    BUY_BUTTON: 'Buy Land',
    AUTH_REQUIRED: 'Please sign up or login to submit land information',
  },
  HELP: {
    BUTTON: 'Get Help',
    ACCESSIBILITY: 'Get help and support',
  },
  RECENT_SEARCHES: {
    TITLE: 'Recent Searches',
  },
  TEAM_CHAT: {
    BUTTON: 'Chat',
  },
  JOIN_DEAL: {
    BUTTON: 'Join Deal',
    ACCESSIBILITY: 'Join deal with collaboration code',
  },
};

// Map Screen Text
export const MAP = {
  TITLE: 'Map',
  SEARCH: {
    PLACEHOLDER: 'Search location...',
    NO_RESULTS: 'No search results found',
  },
  LOCATION: {
    PERMISSION: {
      TITLE: 'Location Permission Required',
      MESSAGE: 'Please enable location services to see your position on the map.',
      BUTTON: 'Enable Location',
      REQUIRED: 'Location access is required to show your position on the map',
    },
  },
  DRAWING: {
    BUTTONS: {
      DRAW_AREA: 'Draw Area',
      CANCEL: 'Cancel',
      MEASURE: 'Measure',
      RETRY: 'Tap to retry',
    },
    ERROR: {
      MIN_POINTS: 'Please draw at least 3 points to create an area',
      CALCULATION_FAILED: 'Failed to calculate area. Please try again.',
    },
    CONFIRMATION: {
      TITLE: 'Confirm Drawing',
      PROCESSING: 'Processing...',
      CONFIRM: 'Confirm Area',
    },
  },
  PROPERTY: {
    DETAILS: {
      NO_ADDRESS: 'No Address Available',
      AREA_NOT_AVAILABLE: 'Area not available',
      VIEW_DETAILS: 'View Details',
    },
    NEARBY: {
      TITLE: 'Nearby Properties',
      NO_ADDRESS: 'No Address',
      NO_DESCRIPTION: 'No Description',
      DISTANCE: (miles: number) => `${miles.toFixed(2).toString()} miles away`,
    },
  },
  ACCESSIBILITY: {
    MAP_VIEW: 'Map view for drawing area or measuring distance',
    DRAW_AREA: 'Draw Area',
    CANCEL_DRAW: 'Cancel',
    ERROR_RETRY: 'Error in drawing area. Tap to retry',
    RETRY_LOADING: 'Retry loading map data',
  },
};

// Settings Screen Text
export const SETTINGS = {
  TITLE: 'Settings',
  PROFILE: {
    TITLE: 'Profile',
    NAME: 'John Doe',
    EMAIL: 'john@example.com',
  },
  PREFERENCES: {
    TITLE: 'Preferences',
    NOTIFICATIONS: {
      LABEL: 'Enable Notifications',
    },
    DARK_MODE: {
      LABEL: 'Use Dark Mode',
    },
  },
  TOKENS: {
    TITLE: 'Token Balance',
    BALANCE: (balance: number) => `${balance.toLocaleString().toString()} tokens`,
    SUBTEXT: 'Available for transactions',
    PURCHASE: {
      BUTTON: 'Purchase Tokens',
      SUCCESS: 'Token balance updated successfully!',
      ACCESSIBILITY: 'Purchase tokens',
    },
  },
  SUBSCRIPTION: {
    TITLE: 'Subscription Plans',
    BUTTON: 'Manage Subscription',
    ACCESSIBILITY: 'View and manage subscription plans',
    SUCCESS: 'Subscription updated successfully!',
    ERROR: 'Failed to update subscription. Please try again.',
  },
  ACTIONS: {
    SHARE_DEAL: {
      BUTTON: 'Share Deal',
      ACCESSIBILITY: 'Share deal with team members',
    },
    AFFILIATE: {
      BUTTON: 'Affiliate Program',
      ACCESSIBILITY: 'Join affiliate program and track referrals',
    },
    LOGOUT: {
      BUTTON: 'Log Out',
      ERROR: 'Failed to logout. Please try again.',
    },
    DELETE_ACCOUNT: {
      BUTTON: 'Delete Account',
      CONFIRMATION_TITLE: 'Delete Account',
      CONFIRMATION_MESSAGE: 'Are you sure you want to delete your account? This action cannot be undone.',
      SUCCESS: 'Account deleted successfully',
      ERROR: 'Failed to delete account. Please try again.',
      ACCESSIBILITY: 'Delete account permanently',
    },
  },
}; 