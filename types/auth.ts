export interface Name {
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface Phone {
  countryCode: string;
  mobile: string;
}

export interface User {
  id: string;
  name: Name;
  email: string;
  phone: Phone;
  isActive: boolean;
  isPhoneVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  } | null;
}
 
export interface ApiError {
  status: number | null;
  message: string;
  originalError: Error;
  data?: any;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}
export interface OTPResponse extends Omit<AuthResponse, "data"> {
  data: {
    user: User;
  } | null;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}
