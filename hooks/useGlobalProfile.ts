import { useCallback } from 'react';
import { useProfileStore } from '@/stores/profileStore';
import { getRenterInvestorProfile, updateRenterInvestorProfile } from '@/services/renterInvestorProfile';
import { toast } from '@/components/ui/Toast';
import { UpdateRenterInvestorProfileRequest } from '@/types/renterInvestorProfile';

export const useGlobalProfile = () => {
  const {
    profileData,
    isLoading,
    isError,
    error,
    setProfileData,
    setLoading,
    setError,
    clearError,
    isDataStale,
    updateLastFetched,
  } = useProfileStore();

  const fetchProfile = useCallback(async (forceRefresh = false) => {
    // Don't fetch if data is fresh and not forcing refresh
    if (!forceRefresh && !isDataStale() && profileData) {
      return profileData;
    }

    setLoading(true);
    clearError();

    try {
      const response = await getRenterInvestorProfile();
      const profile = response.data;
      
      setProfileData(profile);
      updateLastFetched();
      
      return profile;
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to fetch profile';
      setError(error);
      toast.error(errorMessage);
      throw error;
    }
  }, [profileData, isDataStale, setProfileData, setLoading, setError, clearError, updateLastFetched]);

  const refreshProfile = useCallback(async () => {
    return fetchProfile(true);
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: UpdateRenterInvestorProfileRequest) => {
    setLoading(true);
    clearError();

    try {
      const response = await updateRenterInvestorProfile(data);
      const updatedProfile = response.data;
      
      setProfileData(updatedProfile);
      updateLastFetched();
      
      toast.success('Profile updated successfully');
      return updatedProfile;
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to update profile';
      setError(error);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setProfileData, setLoading, setError, clearError, updateLastFetched]);

  return {
    profileData,
    isLoading,
    isError,
    error,
    fetchProfile,
    refreshProfile,
    updateProfile,
  };
}; 