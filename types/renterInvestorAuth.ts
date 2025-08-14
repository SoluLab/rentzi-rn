export interface RenterInvestorLoginRequest {
  identifier: string | {
    countryCode: string;
    mobile: string;
  };
  password: string;
}

export interface RenterInvestorLoginResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    userId: string;
    requiresOTP: boolean;
    otp?: string;
  };
}

export interface RenterInvestorApiError {
  status: number | null;
  message: string;
  originalError: Error;
  data?: any;
}

export interface RenterInvestorVerifyLoginOtpRequest {
  identifier: string;
  otp: string;
}

export interface RenterInvestorVerifyLoginOtpResponse {
  success: boolean;
  message: string;
  data: {
    user: {
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
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
      kyc: {
        status: string;
      };
      twoFactorAuth: boolean;
      lastLogin: string;
    };
    token: string;
  };
}

export interface RenterInvestorResendOtpRequest {
  identifier: string;
  type: "login" | "password_reset" | "signup";
}

export interface RenterInvestorResendOtpResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    otp: string;
  };
}

export interface RenterInvestorRegisterRequest {
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  password: string;
  phone: {
    countryCode: string;
    mobile: string;
  };
  userType?: string[]; // Make optional
}

export interface RenterInvestorRegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
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
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
      kyc: {
        status: string;
      };
      createdAt: string;
    };
    token: string;
  };
}

export interface RenterInvestorForgotPasswordRequest {
  email: string;
}

export interface RenterInvestorForgotPasswordResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface RenterInvestorResetPasswordRequest {
  email: string;
  password: string;
  otp: string;
}

export interface RenterInvestorResetPasswordResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface RenterInvestorVerifyForgotPasswordOtpRequest {
  email: string;
  otp: string;
}

export interface RenterInvestorVerifyForgotPasswordOtpResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    userId: string;
  };
}