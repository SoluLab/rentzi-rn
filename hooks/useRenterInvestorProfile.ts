import { useCallback } from 'react';
import { useGetRenterInvestorProfile, useUpdateRenterInvestorProfile, useChangeRenterInvestorPassword } from '@/services/renterInvestorProfile';
import { UpdateRenterInvestorProfileRequest, ChangeRenterInvestorPasswordRequest } from '@/types/renterInvestorProfile';

export const useRenterInvestorProfile = (
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
  } = useGetRenterInvestorProfile();

  console.log('useRenterInvestorProfile - Hook called');
  console.log('useRenterInvestorProfile - isLoadingProfile:', isLoadingProfile);
  console.log('useRenterInvestorProfile - profileError:', profileError);
  console.log('useRenterInvestorProfile - profileData:', profileData);

  const updateProfileMutation = useUpdateRenterInvestorProfile({
    onSuccess: () => {
      refetchProfile();
      options?.onProfileUpdateSuccess?.();
    },
    onError: (error) => {
      options?.onProfileUpdateError?.(error);
    },
  });

  const changePasswordMutation = useChangeRenterInvestorPassword({
    onSuccess: () => {
      options?.onPasswordChangeSuccess?.();
    },
    onError: (error) => {
      options?.onPasswordChangeError?.(error);
    },
  });

  const updateProfile = useCallback((data: UpdateRenterInvestorProfileRequest) => {
    updateProfileMutation.mutate(data);
  }, [updateProfileMutation]);

  const changePassword = useCallback((data: ChangeRenterInvestorPasswordRequest) => {
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