// KYC Types and Constants

// KYC Status constants
export const KYC_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "inprogress",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type KYCStatus = typeof KYC_STATUS[keyof typeof KYC_STATUS];

// KYC Initialize Request
export interface KYCInitializeRequest {
  // Add any request parameters if needed
}

// KYC Initialize Data
export interface KYCInitializeData {
  accessToken: string;
  sdkConfig: {
    accessToken: string;
    appToken: string;
    baseUrl: string;
    flowName: string;
  };
  applicantId: string;
}

// KYC Initialize Response
export interface KYCInitializeResponse {
  success: boolean;
  message: string;
  data: KYCInitializeData;
}

// KYC Initialize API Response
export interface KYCInitializeApiResponse {
  success: boolean;
  message: string;
  data: KYCInitializeData;
}

// KYC Configuration
export interface KYCConfig {
  accessToken: string;
  userId?: string;
  flowName?: string;
  locale?: string;
  theme?: 'light' | 'dark' | 'system';
}

// KYC Result
export interface KYCResult {
  success: boolean;
  token?: string;
  userId?: string;
  errorMsg?: string;
  errorType?: string;
  isCompleted?: boolean;
  status?: string;
}

// KYC Applicant Data (from profile API)
export interface KYCApplicantData {
  status: KYCStatus;
  applicantId: string;
  submittedAt: string;
}

// KYC Verification Status
export interface KYCVerificationStatus {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKYCComplete: boolean;
  kycStatus: KYCStatus;
}

// KYC Flow Types
export const KYC_FLOW_TYPES = {
  BASIC: "basic",
  ENHANCED: "enhanced",
  FULL: "full",
} as const;

export type KYCFlowType = typeof KYC_FLOW_TYPES[keyof typeof KYC_FLOW_TYPES];

// KYC Document Types
export const KYC_DOCUMENT_TYPES = {
  PASSPORT: "passport",
  NATIONAL_ID: "national_id",
  DRIVERS_LICENSE: "drivers_license",
  UTILITY_BILL: "utility_bill",
  BANK_STATEMENT: "bank_statement",
  SELFIE: "selfie",
} as const;

export type KYCDocumentType = typeof KYC_DOCUMENT_TYPES[keyof typeof KYC_DOCUMENT_TYPES];

// KYC Document Status
export const KYC_DOCUMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  UNDER_REVIEW: "under_review",
} as const;

export type KYCDocumentStatus = typeof KYC_DOCUMENT_STATUS[keyof typeof KYC_DOCUMENT_STATUS];

// KYC Document
export interface KYCDocument {
  id: string;
  type: KYCDocumentType;
  status: KYCDocumentStatus;
  uploadedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documentUrl?: string;
}

// KYC Application
export interface KYCApplication {
  id: string;
  applicantId: string;
  status: KYCStatus;
  flowType: KYCFlowType;
  documents: KYCDocument[];
  submittedAt: string;
  updatedAt: string;
  completedAt?: string;
  rejectionReason?: string;
}

// KYC Application Response
export interface KYCApplicationResponse {
  success: boolean;
  message: string;
  data: KYCApplication;
}

// KYC Status Update Request
export interface KYCStatusUpdateRequest {
  status: KYCStatus;
  reason?: string;
}

// KYC Webhook Payload
export interface KYCWebhookPayload {
  applicantId: string;
  status: KYCStatus;
  type: string;
  timestamp: string;
  data?: any;
}

// KYC Error Types
export const KYC_ERROR_TYPES = {
  NETWORK_ERROR: "network_error",
  AUTHENTICATION_ERROR: "authentication_error",
  VALIDATION_ERROR: "validation_error",
  DOCUMENT_ERROR: "document_error",
  SERVER_ERROR: "server_error",
} as const;

export type KYCErrorType = typeof KYC_ERROR_TYPES[keyof typeof KYC_ERROR_TYPES];

// KYC Error
export interface KYCError {
  type: KYCErrorType;
  message: string;
  code?: string;
  details?: any;
} 