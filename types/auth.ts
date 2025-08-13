import { z } from "zod";

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
  isEmailVerified: boolean;
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
  identifier: string | {
    countryCode: string;
    mobile: string;
  };
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

export interface CountryCode {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  countryCode: string;
  mobile: string;
  roleType: string;
}

export interface OTPVerificationParams {
  email: string;
  phone: string;
  type: "register" | "login";
  roleType: string;
  sessionId?: string;
  userId?: string;
  otp?: string;
}

export interface MobileVerificationParams {
  email: string;
  phone: string;
  type: "register" | "login";
  roleType?: string;
}

export interface ForgotPasswordParams {
  email: string;
  roleType?: string;
}

export interface ForgotPasswordOTPParams {
  email: string;
  roleType?: string;
}

export interface NewPasswordParams {
  email: string;
  code: string;
  verificationId?: string;
  roleType?: string;
}

export interface OTPVerificationRequest {
  identifier: string | {
    countryCode: string;
    mobile: string;
  };
  otp: string;
}

export interface ResendOTPRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  verificationId?: number;
}

// Zod Schemas for validation
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or mobile number is required")
    .refine(
      (value) => {
        const isEmail = value.includes("@");
        const isMobile = /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ""));
        return isEmail || isMobile;
      },
      "Please enter a valid email address or mobile number (including country code)"
    ),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  mobileNumber: z.string().min(1, "Mobile number is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine((value) => !/\s/.test(value), "Password must not contain spaces"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  acceptedTerms: z.boolean().refine((val) => val, "Please accept the terms and conditions"),
  selectedCountryCode: z.object({
    code: z.string(),
    name: z.string(),
    flag: z.string(),
    phoneCode: z.string(),
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const otpSchema = z.object({
  otp: z
    .string()
    .min(1, "Please enter the verification code")
    .length(6, "Please enter a valid 6-digit code")
    .regex(/^\d{6}$/, "Please enter a valid 6-digit code"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address"),
});

export const newPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine((value) => !/\s/.test(value), "Password must not contain spaces"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const userTypeSchema = z.enum(["renter_investor", "homeowner"]);

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
export type UserType = z.infer<typeof userTypeSchema>;
