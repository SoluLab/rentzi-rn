import { useCallback } from "react";
import { useChangeHomeownerPassword as useHomeownerChangePasswordService } from "@/services/homeownerProfile";
import { toast } from "@/components/ui/Toast";
import { TOAST_MESSAGES } from "@/constants/toastMessages";
import type { ChangePasswordRequest } from "@/types/homeownerProfile";

interface UseHomeownerChangePasswordReturn {
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  isUpdating: boolean;
}

export const useHomeownerChangePassword = (): UseHomeownerChangePasswordReturn => {
  const changePasswordMutation = useHomeownerChangePasswordService({
    onSuccess: (response: any) => {
      toast.success(response.message || TOAST_MESSAGES.PROFILE.PASSWORD_CHANGE_SUCCESS);
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.message || error?.message || TOAST_MESSAGES.PROFILE.PASSWORD_CHANGE_FAILED;
      toast.error(errorMessage);
    },
  });

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    // Send all required fields including confirmPassword
    const { currentPassword, newPassword, confirmPassword } = data;
    changePasswordMutation.mutate({ currentPassword, newPassword, confirmPassword });
  }, [changePasswordMutation]);

  return {
    changePassword,
    isUpdating: changePasswordMutation.isPending,
  };
}; 