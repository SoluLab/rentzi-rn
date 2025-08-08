// Renter Investor Profile Types
import { KYCApplicantData, KYCStatus } from "./kyc";

export interface RenterInvestorProfileData {
  id: string;
  name: {
    firstName: string;
    lastName: string;
    fullName: string;
  };
  email: string;
  phone: {
    countryCode: string;
    mobile: string;
  };
  userType: string[];
  kyc: KYCApplicantData;
  twoFactorAuth: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface RenterInvestorProfileResponse {
  success: boolean;
  message: string;
  data: RenterInvestorProfileData;
}

export interface UpdateRenterInvestorProfileRequest {
  name: {
    firstName: string;
    lastName: string;
  };
  phone: {
    countryCode: string;
    mobile: string;
  };
}

export interface ChangeRenterInvestorPasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile verification status
export interface RenterInvestorProfileVerificationStatus {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKYCComplete: boolean;
  kycStatus: KYCStatus;
}

// Profile statistics (for future use)
export interface RenterInvestorProfileStats {
  totalBookings: number;
  totalInvestments: number;
  portfolioValue: number;
  memberSince: string;
} 