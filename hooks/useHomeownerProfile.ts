import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useHomeownerGetProfile, useHomeownerUpdateProfile } from "@/services/homeownerProfile";
import { toast } from "@/components/ui/Toast";
import { TOAST_MESSAGES } from "@/constants/toastMessages";
import type { HomeownerProfileData, UpdateProfileWithPasswordRequest } from "@/types/homeownerProfile";
import { queryKeys } from "@/services/apiClient";

interface UseHomeownerProfileReturn {
  profileData: HomeownerProfileData | null;
  isLoading: boolean;
  error: any;
  updateProfile: (data: UpdateProfileWithPasswordRequest) => Promise<void>;
  isUpdating: boolean;
  refetch: () => void;
}

export const useHomeownerProfile = (): UseHomeownerProfileReturn => {
  const queryClient = useQueryClient();
  
  const {
    data: profileResponse,
    isLoading,
    error,
    refetch,
  } = useHomeownerGetProfile();

  const updateProfileMutation = useHomeownerUpdateProfile({
    onSuccess: (response: any) => {
      if (response.success) {
        toast.success(TOAST_MESSAGES.PROFILE.UPDATE_SUCCESS);
        
        // Update the cache directly with the new data
        queryClient.setQueryData(queryKeys.homeownerProfile(), response);
        
        // Also invalidate and refetch for safety
        queryClient.invalidateQueries({ queryKey: queryKeys.homeownerProfile() });
        
        // Also refetch immediately to ensure UI updates
        refetch();
      } else {
        const errorMessage = response.message || TOAST_MESSAGES.PROFILE.UPDATE_FAILED;
        toast.error(errorMessage);
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.message || error?.message || TOAST_MESSAGES.PROFILE.UPDATE_FAILED;
      toast.error(errorMessage);
    },
  });

  const updateProfile = useCallback(async (data: UpdateProfileWithPasswordRequest) => {
    updateProfileMutation.mutate(data);
  }, [updateProfileMutation]);

  return {
    profileData: profileResponse?.data || null,
    isLoading,
    error,
    updateProfile,
    isUpdating: updateProfileMutation.isPending,
    refetch,
  };
}; 