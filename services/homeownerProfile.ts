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
import { HomeownerProfileData, UpdateProfileRequest, ChangePasswordRequest, HomeownerProfileResponse } from "@/types/homeownerProfile";
import { toast } from "@/components/ui/Toast";

// Get Profile
export const useGetHomeownerProfile = (
  options?: Omit<UseQueryOptions<HomeownerProfileResponse, ApiError>, "queryKey" | "queryFn"> & {
    onSuccess?: (data: HomeownerProfileResponse) => void;
    onError?: (error: ApiError) => void;
  }
) => {
  const baseURL = getHomeownerAuthBaseURL();

  return useQuery<HomeownerProfileResponse, ApiError>({
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
    onSuccess: (data: HomeownerProfileResponse) => {
      // Check if the API response indicates success
      if (data?.success === true) {
        console.log('HomeownerProfile - Profile fetched successfully:', data);
        options?.onSuccess?.(data);
      } else {
        // API returned success: false, show error
        const errorMessage = data?.message || "Failed to fetch profile";
        console.error('HomeownerProfile - Profile fetch failed:', data);
        toast.error(errorMessage);
        options?.onError?.({ message: errorMessage } as ApiError);
      }
    },
    onError: (error: ApiError) => {
      const errorMessage = error?.data?.message || error?.message || "Failed to fetch profile";
      console.error('HomeownerProfile - Profile fetch failed:', error);
      toast.error(errorMessage);
      options?.onError?.(error);
    },
    ...options,
  });
};

// Update Profile
export const useUpdateHomeownerProfile = (
  options?: Omit<UseMutationOptions<HomeownerProfileResponse, ApiError, UpdateProfileRequest>, "mutationFn"> & {
    onSuccess?: (data: HomeownerProfileResponse) => void;
    onError?: (error: ApiError) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<HomeownerProfileResponse, ApiError, UpdateProfileRequest>({
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
    onSuccess: (data: HomeownerProfileResponse) => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.all, "homeowner", "profile"] });
      
      // Check if the API response indicates success
      if (data?.success === true) {
        toast.success(data.message || "Profile updated successfully");
        console.log('HomeownerProfile - Profile updated successfully:', data);
        options?.onSuccess?.(data);
      } else {
        // API returned success: false, show error
        const errorMessage = data?.message || "Failed to update profile";
        toast.error(errorMessage);
        options?.onError?.({ message: errorMessage } as ApiError);
      }
    },
    onError: (error: ApiError) => {
      const errorMessage = error?.data?.message || error?.message || "Failed to update profile";
      console.error('HomeownerProfile - Profile update failed:', error);
      toast.error(errorMessage);
      options?.onError?.(error);
    },
    ...options,
  });
};

// Change Password
export const useChangeHomeownerPassword = (
  options?: {
    onSuccess?: (response: any) => void;
    onError?: (error: any) => void;
  }
) => {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const baseURL = getHomeownerAuthBaseURL();

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.HOMEOWNER_PROFILE.CHANGE_PASSWORD,
        data,
        auth: true,
      });
      
      console.log('HomeownerProfile - Change password API response:', response);
      return response;
    },
    onSuccess: (response: any) => {
      // Check if the API response indicates success
      if (response?.success === true) {
        toast.success(response.message || "Password changed successfully");
        options?.onSuccess?.(response);
      } else {
        // API returned success: false, show error
        const errorMessage = response?.message || "Failed to change password";
        toast.error(errorMessage);
        options?.onError?.({ message: errorMessage });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.message || error?.message || "Failed to change password";
      console.error('HomeownerProfile - Change password failed:', error);
      toast.error(errorMessage);
      options?.onError?.(error);
    },
  });
}; 