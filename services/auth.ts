import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { BASE_URLS, ENDPOINTS, getHomeownerAuthBaseURL } from "@/constants/urls";
import { AuthResponse, LoginRequest, ApiError, ForgotPasswordResponse } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPost, apiPut, apiGet, queryKeys } from "./apiClient";

// Login
export const useLogin = (
  options?: Omit<
    UseMutationOptions<AuthResponse, ApiError, LoginRequest>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, ApiError, LoginRequest>({
    mutationFn: async ({ identifier, password }) => {
      const payload: LoginRequest = {
        identifier,
        password,
      };

      const baseURL = getHomeownerAuthBaseURL();

      console.log("[API Client] Login payload:", payload);
      console.log("[API Client] User type: homeowner");
      console.log(
        "[API Client] Login URL:",
        `${baseURL}${ENDPOINTS.AUTH.SIGNIN}`
      );
      console.log("[API Client] Full request details:", {
        method: 'POST',
        url: `${baseURL}${ENDPOINTS.AUTH.SIGNIN}`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: payload
      });
      const response = await apiPost<AuthResponse>({
        baseURL,
        endpoint: ENDPOINTS.AUTH.SIGNIN,
        data: payload,
        auth: false,
      });
      console.log("[API Client] Login response:", response);
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "Login failed");
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    },
    ...options,
  });
};

// Signup
export const useSignup = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        countryCode: string;
        mobile: string;
        roleType?: string;
      }
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    any,
    ApiError,
    {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      countryCode: string;
      mobile: string;
      roleType?: string;
    }
  >({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      password,
      countryCode,
      mobile,
      roleType,
    }) => {
      // Only allow homeowner registration here
      if (roleType !== "homeowner") {
        throw new Error("Renter/Investor registration is handled separately.");
      }
      const baseURL = getHomeownerAuthBaseURL();
      const payload = {
        name: {
          firstName,
          lastName,
        },
        email,
        password,
        phone: {
          countryCode,
          mobile,
        },
      };
      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.SIGNUP,
        data: payload,
        auth: false,
      });
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "Registration failed");
      }
      
      return response;
    },
    ...options,
  });
};

// Verify OTP
export const useVerifyOtp = (
  options?: Omit<
    UseMutationOptions<any, ApiError, { identifier: string; otp: string }>,
    "mutationFn"
  >
) => {
  return useMutation<any, ApiError, { identifier: string; otp: string }>({
    mutationFn: async ({ identifier, otp }) => {
      console.log("useVerifyOtp called with:", { identifier, otp, userType: "homeowner" });

      const baseURL = getHomeownerAuthBaseURL();

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.VERIFY_OTP,
        data: { email: identifier, otp },
        auth: false, // Enable authentication to include Bearer token
      });
      console.log("useVerifyOtp response:", response);
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "OTP verification failed");
      }
      
      return response;
    },
    ...options,
  });
};

// Verify Login OTP for Email (like renter/investor)
export const useVerifyLoginOtp = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      { identifier: string; otp: string }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    ApiError,
    { identifier: string; otp: string }
  >({
    mutationFn: async ({ identifier, otp }) => {
      console.log("useVerifyLoginOtp called with:", {
        identifier,
        otp,
        userType: "homeowner",
      });

      const baseURL = getHomeownerAuthBaseURL();

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.VERIFY_LOGIN_OTP,
        data: { identifier, otp },
        auth: false,
      });

      console.log("useVerifyLoginOtp response:", response);
      
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
        console.log("[Homeowner Auth] Stored JWT token from API response");
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    },
    ...options,
  });
};

// Logout
export const useLogout = (
  options?: Omit<UseMutationOptions<any, ApiError, void>, "mutationFn">
) => {
  const queryClient = useQueryClient();

  return useMutation<any, ApiError, void>({
    mutationFn: async () => {
      try {
        const baseURL = getHomeownerAuthBaseURL();

        // Call logout API
        const response = await apiPost({
          baseURL,
          endpoint: ENDPOINTS.AUTH.LOGOUT,
          data: {},
          auth: true,
        });
      } catch (error) {
        // Logout API call failed, but continuing with local cleanup
      }
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("refreshToken");

      return { success: true };
    },
    onSuccess: () => {
      queryClient.clear();
    },
    ...options,
  });
};

// Reset password
export const useResetPassword = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      {
        email: string;
        otp: string;
        password: string;
      }
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    any,
    ApiError,
    { email: string; otp: string; password: string; }
  >({
    mutationFn: async ({ email, otp, password }) => {
      const baseURL = getHomeownerAuthBaseURL();

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.RESET_PASSWORD,
        data: { email, otp, password },
        auth: false,
      });
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "Password reset failed");
      }
      
      return response;
    },
    ...options,
  });
};

// Forgot password
export const useForgotPassword = (
  options?: Omit<
    UseMutationOptions<ForgotPasswordResponse, ApiError, { email: string }>,
    "mutationFn"
  >
) => {
  return useMutation<ForgotPasswordResponse, ApiError, { email: string }>({
    mutationFn: async ({ email }) => {
      const baseURL = getHomeownerAuthBaseURL();

      console.log("[API Client] ForgotPassword request:", { email });
      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data: { email },
        auth: false,
      });
      console.log("[API Client] ForgotPassword response:", response);
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "Forgot password request failed");
      }
      
      return response;
    },
    ...options,
  });
};

// Note: Profile endpoints are handled by HOMEOWNER_PROFILE, not AUTH.PROFILE
// These functions are removed as they use incorrect endpoints

// Resend OTP
export const useResendOtp = (
  options?: Omit<
    UseMutationOptions<{ success: boolean; message: string }, ApiError, { email: string }>,
    "mutationFn"
  >
) => {
  return useMutation<{ success: boolean; message: string }, ApiError, { email: string }>({
    mutationFn: async ({ email }) => {
      const baseURL = getHomeownerAuthBaseURL();

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.RESEND_OTP,
        data: { email },
        auth: false,
      });
      
      // Check if the response indicates failure
      if (response && response.success === false) {
        throw new Error(response.message || "Resend OTP failed");
      }
      
      return response;
    },
    ...options,
  });
};
