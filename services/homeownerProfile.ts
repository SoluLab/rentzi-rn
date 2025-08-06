import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { BASE_URLS, ENDPOINTS } from "@/constants/urls";
import type { ApiError } from "./apiClient";
import { useApiQuery, useApiMutation, queryKeys } from "./apiClient";
import type {
  HomeownerProfileData,
  HomeownerProfileResponse,
  UpdateProfileRequest,
  UpdateEmailRequest,
  UpdatePhoneRequest,
  ChangePasswordRequest,
} from "@/types/homeownerProfile";

// 1. Get Homeowner Profile
export const useHomeownerGetProfile = (
  options?: Omit<UseQueryOptions<HomeownerProfileResponse, ApiError>, "queryKey" | "queryFn">
) => {
  return useApiQuery(
    queryKeys.homeownerProfile(),
    {
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.AUTH.PROFILE.GET,
      auth: true,
    },
    options
  );
};

// 2. Update Homeowner Profile
export const useHomeownerUpdateProfile = (
  options?: Omit<UseMutationOptions<HomeownerProfileResponse, ApiError, UpdateProfileRequest>, "mutationFn">
) => {
  return useApiMutation(
    {
      method: "put",
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.AUTH.PROFILE.UPDATE,
      auth: true,
    },
    options
  );
};

// 3. Update Homeowner Email
export const useHomeownerUpdateEmail = (
  options?: Omit<UseMutationOptions<HomeownerProfileResponse, ApiError, UpdateEmailRequest>, "mutationFn">
) => {
  return useApiMutation(
    {
      method: "put",
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.AUTH.PROFILE.UPDATE_EMAIL,
      auth: true,
    },
    options
  );
};

// 4. Update Homeowner Phone
export const useHomeownerUpdatePhone = (
  options?: Omit<UseMutationOptions<HomeownerProfileResponse, ApiError, UpdatePhoneRequest>, "mutationFn">
) => {
  return useApiMutation(
    {
      method: "put",
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.AUTH.PROFILE.UPDATE_PHONE,
      auth: true,
    },
    options
  );
};

// 5. Change Homeowner Password
export const useHomeownerChangePassword = (
  options?: Omit<UseMutationOptions<HomeownerProfileResponse, ApiError, ChangePasswordRequest>, "mutationFn">
) => {
  return useApiMutation(
    {
      method: "post",
      baseURL: BASE_URLS.DEVELOPMENT.AUTH_API_HOMEOWNER,
      endpoint: ENDPOINTS.AUTH.PROFILE.CHANGE_PASSWORD,
      auth: true,
    },
    options
  );
}; 