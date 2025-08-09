import { useCallback } from 'react';
import { useGetHomeownerProfile, useUpdateHomeownerProfile, useChangeHomeownerPassword } from '@/services/homeownerProfile';
import { UpdateProfileRequest, ChangePasswordRequest } from '@/types/homeownerProfile';

export const useHomeownerProfile = (
  options?: {
    onProfileUpdateSuccess?: () => void;
    onProfileUpdateError?: (error: any) => void;
    onPasswordChangeSuccess?: () => void;
    onPasswordChangeError?: (error: any) => void;
  }
) => {
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
      // No need to manually call refetchProfile() here since 
      // useUpdateHomeownerProfile already calls queryClient.invalidateQueries()
      // which automatically triggers a refetch
      options?.onProfileUpdateSuccess?.();
    },
    onError: (error) => {
      options?.onProfileUpdateError?.(error);
    },
  });

  const changePasswordMutation = useChangeHomeownerPassword({
    onSuccess: () => {
      options?.onPasswordChangeSuccess?.();
    },
    onError: (error) => {
      options?.onPasswordChangeError?.(error);
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