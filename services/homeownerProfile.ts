import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiGet, apiPut, apiPost } from "./apiClient";
import { ENDPOINTS, getHomeownerAuthBaseURL } from "@/constants/urls";
import { ApiError } from "@/types";
import { queryKeys } from "./apiClient";

// Types for profile management
export interface HomeownerProfile {
  id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  phone: {
    countryCode: string;
    mobile: string;
  };
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: {
    firstName: string;
    lastName: string;
  };
  phone?: {
    countryCode: string;
    mobile: string;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Get Profile
export const useGetHomeownerProfile = (
  options?: Omit<UseQueryOptions<{ data: HomeownerProfile }, ApiError>, "queryKey" | "queryFn">
) => {
  const baseURL = getHomeownerAuthBaseURL();

  return useQuery<{ data: HomeownerProfile }, ApiError>({
    queryKey: [...queryKeys.all, "homeowner", "profile"],
    queryFn: () =>
      apiGet({
        baseURL,
        endpoint: ENDPOINTS.HOMEOWNER_PROFILE.GET,
        auth: true,
      }),
    ...options,
  });
};

// Update Profile
export const useUpdateHomeownerProfile = (
  options?: Omit<UseMutationOptions<{ data: HomeownerProfile }, ApiError, UpdateProfileRequest>, "mutationFn">
) => {
  const queryClient = useQueryClient();

  return useMutation<{ data: HomeownerProfile }, ApiError, UpdateProfileRequest>({
    mutationFn: async (data) => {
      const baseURL = getHomeownerAuthBaseURL();

      const response = await apiPut({
        baseURL,
        endpoint: ENDPOINTS.HOMEOWNER_PROFILE.UPDATE,
        data,
        auth: true,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "homeowner", "profile"] });
    },
    ...options,
  });
};

// Change Password
export const useChangeHomeownerPassword = (
  options?: Omit<UseMutationOptions<{ message: string }, ApiError, ChangePasswordRequest>, "mutationFn">
) => {
  return useMutation<{ message: string }, ApiError, ChangePasswordRequest>({
    mutationFn: async ({ currentPassword, newPassword, confirmPassword }) => {
      const baseURL = getHomeownerAuthBaseURL();

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.HOMEOWNER_PROFILE.CHANGE_PASSWORD,
        data: { currentPassword, newPassword, confirmPassword },
        auth: true,
      });
      return response;
    },
    ...options,
  });
}; 