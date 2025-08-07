import { useCallback } from "react";
import { useHomeownerChangePassword as useHomeownerChangePasswordService } from "@/services/homeownerProfile";
import { toast } from "@/components/ui/Toast";
import { TOAST_MESSAGES } from "@/constants/toastMessages";
import type { ChangePasswordRequest } from "@/types/homeownerProfile";

interface UseHomeownerChangePasswordReturn {
  changePassword: (data: ChangePasswordRequest & { confirmPassword: string }) => Promise<void>;
  isUpdating: boolean;
}

export const useHomeownerChangePassword = (): UseHomeownerChangePasswordReturn => {
  const changePasswordMutation = useHomeownerChangePasswordService({
    onSuccess: (response: any) => {
      if (response.success) {
        toast.success(response.message || TOAST_MESSAGES.PROFILE.PASSWORD_CHANGE_SUCCESS || 'Password changed successfully');
      } else {
        const errorMessage = response.message || TOAST_MESSAGES.PROFILE.PASSWORD_CHANGE_FAILED || 'Failed to change password';
        toast.error(errorMessage);
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.message || error?.message || TOAST_MESSAGES.PROFILE.PASSWORD_CHANGE_FAILED || 'Failed to change password';
      toast.error(errorMessage);
    },
  });

  const changePassword = useCallback(async (data: ChangePasswordRequest & { confirmPassword: string }) => {
    // Send the complete payload including confirmPassword
    changePasswordMutation.mutate(data);
  }, [changePasswordMutation]);

  return {
    changePassword,
    isUpdating: changePasswordMutation.isPending,
  };
}; 