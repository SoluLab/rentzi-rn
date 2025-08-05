import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { RenterInvestorLoginRequest, RenterInvestorLoginResponse, RenterInvestorApiError } from "@/types/renterInvestorAuth";
import { apiPost } from "./apiClient";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import {
  RenterInvestorVerifyLoginOtpRequest,
  RenterInvestorVerifyLoginOtpResponse,
} from "@/types/renterInvestorAuth";
import {
  RenterInvestorResendOtpRequest,
  RenterInvestorResendOtpResponse,
} from "@/types/renterInvestorAuth";
import {
  RenterInvestorRegisterRequest,
  RenterInvestorRegisterResponse,
} from "@/types/renterInvestorAuth";
import {
  RenterInvestorForgotPasswordRequest,
  RenterInvestorForgotPasswordResponse,
} from "@/types/renterInvestorAuth";
import {
  RenterInvestorResetPasswordRequest,
  RenterInvestorResetPasswordResponse,
} from "@/types/renterInvestorAuth";
import {
  RenterInvestorVerifyForgotPasswordOtpRequest,
  RenterInvestorVerifyForgotPasswordOtpResponse,
} from "@/types/renterInvestorAuth";

export const useRenterInvestorLogin = (
  options?: Omit<UseMutationOptions<RenterInvestorLoginResponse, RenterInvestorApiError, RenterInvestorLoginRequest>, "mutationFn">
) => {
  const queryClient = useQueryClient();

  return useMutation<RenterInvestorLoginResponse, RenterInvestorApiError, RenterInvestorLoginRequest>({
    mutationFn: async ({ identifier, password }) => {
      const payload: RenterInvestorLoginRequest = { identifier, password };
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;
      const response = await apiPost<RenterInvestorLoginResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.SIGNIN,
        data: payload,
        auth: false,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
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
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;
      const response = await apiPost<RenterInvestorVerifyLoginOtpResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.VERIFY_LOGIN_OTP,
        data: payload,
        auth: false,
      });
      return response;
    },
    onSuccess: () => {
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
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;
      const response = await apiPost<RenterInvestorResendOtpResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.RESEND_OTP,
        data: payload,
        auth: false,
      });
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
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;
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
      return response;
    },
    onSuccess: () => {
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
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;
      const response = await apiPost<RenterInvestorForgotPasswordResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data: payload,
        auth: false,
      });
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
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;
      const response = await apiPost<RenterInvestorResetPasswordResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.RESET_PASSWORD,
        data: payload,
        auth: false,
      });
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
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_RENTER;
      const response = await apiPost<RenterInvestorVerifyForgotPasswordOtpResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.VERIFY_FORGOT_PASSWORD_OTP,
        data: payload,
        auth: false,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    ...options,
  });
};