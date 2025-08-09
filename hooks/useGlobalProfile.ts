import { useCallback } from 'react';
import { useProfileStore } from '@/stores/profileStore';
import { useGetRenterInvestorProfile, useUpdateRenterInvestorProfile } from '@/services/renterInvestorProfile';
import { UpdateRenterInvestorProfileRequest } from '@/types/renterInvestorProfile';

export const useGlobalProfile = (
  options?: {
    onProfileUpdateSuccess?: () => void;
    onProfileUpdateError?: (error: any) => void;
  }
) => {
  const {
    profileData,
    isLoading: storeLoading,
    isError,
    error,
    setProfileData,
    setLoading,
    setError,
    clearError,
    isDataStale,
    updateLastFetched,
  } = useProfileStore();

  const {
    data: queryData,
    isLoading: queryLoading,
    error: queryError,
    refetch: refetchProfile,
  } = useGetRenterInvestorProfile({
    onSuccess: (data) => {
      if (data?.success === true && data?.data) {
        setProfileData(data.data);
        updateLastFetched();
      }
    },
    onError: (error) => {
      setError(error);
    },
  });

  const updateProfileMutation = useUpdateRenterInvestorProfile({
    onSuccess: (data) => {
      if (data?.success === true && data?.data) {
        setProfileData(data.data);
        updateLastFetched();
      }
      options?.onProfileUpdateSuccess?.();
    },
    onError: (error) => {
      setError(error);
      options?.onProfileUpdateError?.(error);
    },
  });

  const fetchProfile = useCallback(async (forceRefresh = false) => {
    // Don't fetch if data is fresh and not forcing refresh
    if (!forceRefresh && !isDataStale() && profileData) {
      return profileData;
    }

    try {
      await refetchProfile();
      return profileData;
    } catch (error: any) {
      throw error;
    }
  }, [profileData, isDataStale, refetchProfile]);

  const refreshProfile = useCallback(async () => {
    return fetchProfile(true);
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: UpdateRenterInvestorProfileRequest) => {
    updateProfileMutation.mutate(data);
  }, [updateProfileMutation]);

  // Use query data if available, otherwise fall back to store data
  const finalProfileData = queryData?.data || profileData;
  const finalLoading = queryLoading || storeLoading;
  const finalError = queryError || error;

  return {
    profileData: finalProfileData,
    isLoading: finalLoading,
    isError,
    error: finalError,
    fetchProfile,
    refreshProfile,
    updateProfile,
  };
}; 