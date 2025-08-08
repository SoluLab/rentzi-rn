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
import { HomeownerProfileData, UpdateProfileRequest, ChangePasswordRequest } from "@/types/homeownerProfile";

// Get Profile
export const useGetHomeownerProfile = (
  options?: Omit<UseQueryOptions<{ data: HomeownerProfileData }, ApiError>, "queryKey" | "queryFn">
) => {
  const baseURL = getHomeownerAuthBaseURL();

  return useQuery<{ data: HomeownerProfileData }, ApiError>({
    queryKey: [...queryKeys.all, "homeowner", "profile"],
    queryFn: async () => {
      console.log('HomeownerProfile - Making API call to:', `${baseURL}${ENDPOINTS.HOMEOWNER_PROFILE.GET}`);
      
      try {
        const response = await apiGet({
          baseURL,
          endpoint: ENDPOINTS.HOMEOWNER_PROFILE.GET,
          auth: true,
        });
        
        console.log('HomeownerProfile - Raw API response:', response);
        
        // Handle the double-nested response structure
        // API returns: { data: { data: { profileData }, message, success } }
        // We need to extract: { data: profileData }
        if (response?.data?.data) {
          console.log('HomeownerProfile - Extracted data:', response.data.data);
          return { data: response.data.data };
        }
        
        console.log('HomeownerProfile - Using original response:', response);
        return response;
      } catch (error) {
        console.error('HomeownerProfile - API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache data for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts to ensure fresh data
    enabled: true, // Always enable the query
    ...options,
  });
};

// Update Profile
export const useUpdateHomeownerProfile = (
  options?: Omit<UseMutationOptions<{ data: HomeownerProfileData }, ApiError, UpdateProfileRequest>, "mutationFn">
) => {
  const queryClient = useQueryClient();

  return useMutation<{ data: HomeownerProfileData }, ApiError, UpdateProfileRequest>({
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