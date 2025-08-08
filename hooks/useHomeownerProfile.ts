import { useCallback } from 'react';
import { useGetHomeownerProfile, useUpdateHomeownerProfile, useChangeHomeownerPassword } from '@/services/homeownerProfile';
import { UpdateProfileRequest, ChangePasswordRequest } from '@/types/homeownerProfile';
import { toast } from '@/components/ui/Toast';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export const useHomeownerProfile = () => {
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useGetHomeownerProfile();

  console.log('useHomeownerProfile - Hook called');
  console.log('useHomeownerProfile - isLoadingProfile:', isLoadingProfile);
  console.log('useHomeownerProfile - profileError:', profileError);
  console.log('useHomeownerProfile - profileData:', profileData);
  console.log('useHomeownerProfile - profileData?.data:', profileData?.data);

  const updateProfileMutation = useUpdateHomeownerProfile({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.PROFILE.UPDATE_SUCCESS);
      refetchProfile();
    },
    onError: (error) => {
      const errorMessage = error?.data?.message || TOAST_MESSAGES.PROFILE.UPDATE_FAILED;
      toast.error(errorMessage);
    },
  });

  const changePasswordMutation = useChangeHomeownerPassword({
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.PROFILE.PASSWORD_CHANGE_SUCCESS);
    },
    onError: (error) => {
      const errorMessage = error?.data?.message || TOAST_MESSAGES.PROFILE.PASSWORD_CHANGE_FAILED;
      toast.error(errorMessage);
    },
  });

  const updateProfile = useCallback((data: UpdateProfileRequest) => {
    updateProfileMutation.mutate(data);
  }, [updateProfileMutation]);

  const changePassword = useCallback((data: ChangePasswordRequest) => {
    changePasswordMutation.mutate(data);
  }, [changePasswordMutation]);

  return {
    // Profile data
    profile: profileData?.data,
    isLoadingProfile,
    profileError,
    refetchProfile,
    
    // Profile actions
    updateProfile,
    changePassword,
    
    // Mutation states
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
  };
}; 