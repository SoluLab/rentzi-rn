import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiGet, apiPut, apiPost } from "./apiClient";
import { getRenterAuthBaseURL } from "@/constants/urls";
import { ENDPOINTS } from "@/constants/urls";
import { ApiError } from "@/types";
import { queryKeys } from "./apiClient";
import {
  RenterInvestorProfileResponse,
  UpdateRenterInvestorProfileRequest,
  ChangeRenterInvestorPasswordRequest,
} from "@/types/renterInvestorProfile";
import { toast } from "@/components/ui/Toast";

// Get Renter Investor Profile
export const useGetRenterInvestorProfile = (
  options?: Omit<UseQueryOptions<RenterInvestorProfileResponse, ApiError>, "queryKey" | "queryFn"> & {
    onSuccess?: (data: RenterInvestorProfileResponse) => void;
    onError?: (error: ApiError) => void;
  }
) => {
  const baseURL = getRenterAuthBaseURL();

  return useQuery<RenterInvestorProfileResponse, ApiError>({
    queryKey: [...queryKeys.all, "renter-investor", "profile"],
    queryFn: async () => {
      console.log('RenterInvestorProfile - Making API call to:', `${baseURL}${ENDPOINTS.RENTER_INVESTOR.PROFILE.GET}`);
      
      try {
        const response = await apiGet({
          baseURL,
          endpoint: ENDPOINTS.RENTER_INVESTOR.PROFILE.GET,
          auth: true,
        });
        
        console.log('RenterInvestorProfile - Raw API response:', response);
        return response;
      } catch (error) {
        console.error('RenterInvestorProfile - API call failed:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache data for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts to ensure fresh data
    enabled: true, // Always enable the query
    onSuccess: (data: RenterInvestorProfileResponse) => {
      // Check if the API response indicates success
      if (data?.success === true) {
        console.log('RenterInvestorProfile - Profile fetched successfully:', data);
        options?.onSuccess?.(data);
      } else {
        // API returned success: false, show error
        const errorMessage = data?.message || "Failed to fetch profile";
        console.error('RenterInvestorProfile - Profile fetch failed:', data);
        toast.error(errorMessage);
        options?.onError?.({ message: errorMessage } as ApiError);
      }
    },
    onError: (error: ApiError) => {
      const errorMessage = error?.data?.message || error?.message || "Failed to fetch profile";
      console.error('RenterInvestorProfile - Profile fetch failed:', error);
      toast.error(errorMessage);
      options?.onError?.(error);
    },
    ...options,
  });
};

// Update Renter Investor Profile
export const useUpdateRenterInvestorProfile = (
  options?: Omit<UseMutationOptions<RenterInvestorProfileResponse, ApiError, UpdateRenterInvestorProfileRequest>, "mutationFn"> & {
    onSuccess?: (data: RenterInvestorProfileResponse) => void;
    onError?: (error: ApiError) => void;
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<RenterInvestorProfileResponse, ApiError, UpdateRenterInvestorProfileRequest>({
    mutationFn: async (data) => {
      const baseURL = getRenterAuthBaseURL();

      const response = await apiPut({
        baseURL,
        endpoint: ENDPOINTS.RENTER_INVESTOR.PROFILE.UPDATE,
        data,
        auth: true,
      });
      return response;
    },
    onSuccess: (data: RenterInvestorProfileResponse) => {
      console.log('RenterInvestorProfile - UPDATE onSuccess called with data:', data);
      console.log('RenterInvestorProfile - data.success:', data?.success);
      
      // Check if the API response indicates success
      if (data?.success === true) {
        // Update the cache with the new data and invalidate to trigger re-renders
        const cacheKey = [...queryKeys.all, "renter-investor", "profile"];
        console.log('RenterInvestorProfile - Updating cache with key:', cacheKey);
        console.log('RenterInvestorProfile - New data to cache:', data);
        
        // Set the new data in cache
        queryClient.setQueryData(cacheKey, data);
        
        // Also invalidate to ensure all components re-render with new data
        queryClient.invalidateQueries({ queryKey: cacheKey });
        
        // Verify the cache was updated
        const cachedData = queryClient.getQueryData(cacheKey);
        console.log('RenterInvestorProfile - Cache data after update:', cachedData);
        
        toast.success(data.message || "Profile updated successfully");
        console.log('RenterInvestorProfile - Profile updated successfully, cache updated with new data');
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
      console.error('RenterInvestorProfile - Profile update failed:', error);
      toast.error(errorMessage);
      options?.onError?.(error);
    },
    ...options,
  });
};

// Change Renter Investor Password
export const useChangeRenterInvestorPassword = (
  options?: {
    onSuccess?: (response: any) => void;
    onError?: (error: any) => void;
  }
) => {
  return useMutation({
    mutationFn: async (data: ChangeRenterInvestorPasswordRequest) => {
      const baseURL = getRenterAuthBaseURL();

      const response = await apiPost({
        baseURL,
        endpoint: ENDPOINTS.RENTER_INVESTOR.PROFILE.CHANGE_PASSWORD,
        data,
        auth: true,
      });
      
      console.log('RenterInvestorProfile - Change password API response:', response);
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
      console.error('RenterInvestorProfile - Change password failed:', error);
      toast.error(errorMessage);
      options?.onError?.(error);
    },
  });
}; 