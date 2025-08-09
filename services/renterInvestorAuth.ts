import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiPost } from "./apiClient";
import { ENDPOINTS, getRenterAuthBaseURL } from "@/constants/urls";
import { 
  RenterInvestorLoginRequest, 
  RenterInvestorLoginResponse,
  RenterInvestorRegisterRequest,
  RenterInvestorRegisterResponse,
  RenterInvestorVerifyLoginOtpRequest,
  RenterInvestorVerifyLoginOtpResponse,
  RenterInvestorVerifyForgotPasswordOtpRequest,
  RenterInvestorVerifyForgotPasswordOtpResponse,
  RenterInvestorResendOtpRequest,
  RenterInvestorResendOtpResponse,
  RenterInvestorForgotPasswordRequest,
  RenterInvestorForgotPasswordResponse,
  RenterInvestorResetPasswordRequest,
  RenterInvestorResetPasswordResponse,
  RenterInvestorApiError,
} from "@/types/renterInvestorAuth";
import { ApiError } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { queryKeys } from "./apiClient";

// Login
export const useRenterInvestorLogin = (
  options?: Omit<
    UseMutationOptions<RenterInvestorLoginResponse, ApiError, RenterInvestorLoginRequest>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<RenterInvestorLoginResponse, ApiError, RenterInvestorLoginRequest>({
    mutationFn: async ({ identifier, password }) => {
      console.log("useRenterInvestorLogin called with:", { identifier, password });

      const baseURL = getRenterAuthBaseURL();

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.SIGNIN,
        data: { identifier, password },
        auth: false,
      });
      console.log("useRenterInvestorLogin response:", response);
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "Login failed");
      }
      
      return response;
    },
    onSuccess: (response) => {
      // Note: Token is not available in login response, only in OTP verification
      // Token will be stored after successful OTP verification
      queryClient.invalidateQueries({ queryKey: queryKeys.auth() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    },
    ...options,
  });
};

export const useRenterInvestorVerifyLoginOtp = (
  options?: Omit<
    UseMutationOptions<
      RenterInvestorVerifyLoginOtpResponse,
      RenterInvestorApiError,
      RenterInvestorVerifyLoginOtpRequest
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    RenterInvestorVerifyLoginOtpResponse,
    RenterInvestorApiError,
    RenterInvestorVerifyLoginOtpRequest
  >({
    mutationFn: async ({ identifier, otp }) => {
      const payload: RenterInvestorVerifyLoginOtpRequest = { identifier, otp };
      const baseURL = getRenterAuthBaseURL();
      const response = await apiPost<RenterInvestorVerifyLoginOtpResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.VERIFY_LOGIN_OTP,
        data: payload,
        auth: false,
      });
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "OTP verification failed");
      }
      
      return response;
    },
    onSuccess: (response) => {
      // Store token after successful OTP verification
      if (response?.data?.token) {
        AsyncStorage.setItem("token", response.data.token);
        console.log("[Renter/Investor Auth] Stored JWT token from API response");
      }
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

export const useRenterInvestorResendOtp = (
  options?: Omit<
    UseMutationOptions<
      RenterInvestorResendOtpResponse,
      RenterInvestorApiError,
      RenterInvestorResendOtpRequest
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    RenterInvestorResendOtpResponse,
    RenterInvestorApiError,
    RenterInvestorResendOtpRequest
  >({
    mutationFn: async ({ identifier, type }) => {
      const payload: RenterInvestorResendOtpRequest = { identifier, type };
      const baseURL = getRenterAuthBaseURL();
      const response = await apiPost<RenterInvestorResendOtpResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.RESEND_OTP,
        data: payload,
        auth: false,
      });
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "Resend OTP failed");
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

export const useRenterInvestorRegister = (
  options?: Omit<
    UseMutationOptions<
      RenterInvestorRegisterResponse,
      RenterInvestorApiError,
      RenterInvestorRegisterRequest
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    RenterInvestorRegisterResponse,
    RenterInvestorApiError,
    RenterInvestorRegisterRequest
  >({
    mutationFn: async (payload) => {
      const baseURL = getRenterAuthBaseURL();
      // Always set userType to ['renter']
      const finalPayload = {
        ...payload,
        userType: ["renter"],
      };
      const response = await apiPost<RenterInvestorRegisterResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.SIGNUP,
        data: finalPayload,
        auth: false,
      });
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "Registration failed");
      }
      
      return response;
    },
    onSuccess: (response) => {
      // Store token after successful registration
      if (response?.data?.token) {
        AsyncStorage.setItem("token", response.data.token);
        console.log("[Renter/Investor Auth] Stored JWT token from registration API response");
      }
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

export const useRenterInvestorForgotPassword = (
  options?: Omit<
    UseMutationOptions<
      RenterInvestorForgotPasswordResponse,
      RenterInvestorApiError,
      RenterInvestorForgotPasswordRequest
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    RenterInvestorForgotPasswordResponse,
    RenterInvestorApiError,
    RenterInvestorForgotPasswordRequest
  >({
    mutationFn: async (payload) => {
      const baseURL = getRenterAuthBaseURL();
      const response = await apiPost<RenterInvestorForgotPasswordResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data: payload,
        auth: false,
      });
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "Forgot password request failed");
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

export const useRenterInvestorResetPassword = (
  options?: Omit<
    UseMutationOptions<
      RenterInvestorResetPasswordResponse,
      RenterInvestorApiError,
      RenterInvestorResetPasswordRequest
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    RenterInvestorResetPasswordResponse,
    RenterInvestorApiError,
    RenterInvestorResetPasswordRequest
  >({
    mutationFn: async (payload) => {
      const baseURL = getRenterAuthBaseURL();
      const response = await apiPost<RenterInvestorResetPasswordResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.RESET_PASSWORD,
        data: payload,
        auth: false,
      });
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "Password reset failed");
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

export const useRenterInvestorVerifyForgotPasswordOtp = (
  options?: Omit<
    UseMutationOptions<
      RenterInvestorVerifyForgotPasswordOtpResponse,
      RenterInvestorApiError,
      RenterInvestorVerifyForgotPasswordOtpRequest
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    RenterInvestorVerifyForgotPasswordOtpResponse,
    RenterInvestorApiError,
    RenterInvestorVerifyForgotPasswordOtpRequest
  >({
    mutationFn: async (payload) => {
      const baseURL = getRenterAuthBaseURL();
      const response = await apiPost<RenterInvestorVerifyForgotPasswordOtpResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.VERIFY_FORGOT_PASSWORD_OTP,
        data: payload,
        auth: false,
      });
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "OTP verification failed");
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
};