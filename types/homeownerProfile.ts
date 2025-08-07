// Homeowner Profile Types

export interface HomeownerProfileData {
  name: {
    firstName: string;
    lastName: string;
    fullName: string;
  };
  phone: {
    countryCode: string;
    mobile: string;
  };
  _id: string;
  email: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

export interface HomeownerProfileResponse {
  success: boolean;
  message: string;
  data: HomeownerProfileData;
}

export interface UpdateProfileRequest {
  name: {
    firstName: string;
    lastName: string;
  };
  phone: {
    countryCode: string;
    mobile: string;
  };
}

export interface UpdateEmailRequest {
  email: string;
}

export interface UpdatePhoneRequest {
  phone: {
    countryCode: string;
    mobile: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileWithPasswordRequest extends UpdateProfileRequest {
  currentPassword?: string;
  newPassword?: string;
}

// Profile verification status
export interface ProfileVerificationStatus {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isProfileComplete: boolean;
}

// Profile statistics (for future use)
export interface ProfileStats {
  totalProperties: number;
  totalBookings: number;
  averageRating: number;
  responseRate: number;
  totalEarnings: number;
  memberSince: string;
} 