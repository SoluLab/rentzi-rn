import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
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

      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;

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
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;
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

      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.VERIFY_OTP,
        data: { identifier, otp },
        auth: true, // Enable authentication to include Bearer token
      });
      console.log("useVerifyOtp response:", response);
      return response;
    },
    ...options,
  });
};

// Verify Login OTP for Mobile
export const useVerifyLoginOtp = (
  options?: Omit<
    UseMutationOptions<
      any,
      ApiError,
      { identifier: { countryCode: string; mobile: string }; otp: string }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    ApiError,
    { identifier: { countryCode: string; mobile: string }; otp: string }
  >({
    mutationFn: async ({ identifier, otp }) => {
      console.log("useVerifyLoginOtp called with:", {
        identifier,
        otp,
        userType: "homeowner",
      });

      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.VERIFY_LOGIN_OTP,
        data: { identifier, otp },
        auth: false,
      });

      // Store tokens on successful response
      if (response?.data?.token) {
        await AsyncStorage.setItem("token", response.data.token);
      }

      console.log("useVerifyLoginOtp response:", response);
      return response;
    },
    onSuccess: () => {
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
        const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;

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
        code: string;
        newPassword: string;
        verificationId: number;
      }
    >,
    "mutationFn"
  >
) => {
  return useMutation<
    any,
    ApiError,
    { email: string; code: string; newPassword: string; verificationId: number }
  >({
    mutationFn: async ({ email, code, newPassword, verificationId }) => {
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.RESET_PASSWORD,
        data: { email, code, newPassword, verificationId },
        auth: false,
      });
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
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;

      console.log("[API Client] ForgotPassword request:", { email });
      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data: { email },
        auth: false,
      });
      console.log("[API Client] ForgotPassword response:", response);
      return response;
    },
    ...options,
  });
};

// Get profile
export const useGetProfile = (
  options?: Omit<UseQueryOptions<any, ApiError>, "queryKey" | "queryFn">
) => {
  const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;

  return useQuery<any, ApiError>({
    queryKey: [...queryKeys.all, "profile"],
    queryFn: () =>
      apiGet({
        baseURL,
        endpoint: ENDPOINTS.AUTH.PROFILE.GET,
        auth: true,
      }),
    ...options,
  });
};

// Update profile
export const useUpdateProfile = (
  options?: Omit<UseMutationOptions<any, ApiError, any>, "mutationFn">
) => {
  return useMutation<any, ApiError, any>({
    mutationFn: async (data) => {
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;

      return apiPut({
        baseURL,
        endpoint: ENDPOINTS.AUTH.PROFILE.UPDATE,
        data,
        auth: true,
      });
    },
    ...options,
  });
};

// Resend OTP
export const useResendOtp = (
  options?: Omit<
    UseMutationOptions<{ success: boolean; message: string }, ApiError, { email: string }>,
    "mutationFn"
  >
) => {
  return useMutation<{ success: boolean; message: string }, ApiError, { email: string }>({
    mutationFn: async ({ email }) => {
      const baseURL = BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER;

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.AUTH.RESEND_OTP,
        data: { email },
        auth: false,
      });
      return response;
    },
    ...options,
  });
};
