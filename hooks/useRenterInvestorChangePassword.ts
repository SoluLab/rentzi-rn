import { useCallback } from "react";
import { useChangeRenterInvestorPassword as useRenterInvestorChangePasswordService } from "@/hooks/useRenterInvestorProfile";
import { toast } from "@/components/ui/Toast";
import { TOAST_MESSAGES } from "@/constants/toastMessages";
import type { ChangeRenterInvestorPasswordRequest } from "@/types/renterInvestorProfile";

interface UseRenterInvestorChangePasswordReturn {
  changePassword: (data: ChangeRenterInvestorPasswordRequest) => Promise<void>;
  isUpdating: boolean;
}

export const useRenterInvestorChangePassword = (): UseRenterInvestorChangePasswordReturn => {
  const changePasswordMutation = useRenterInvestorChangePasswordService({
    onSuccess: (response: any) => {
      toast.success(response.message || TOAST_MESSAGES.PROFILE.PASSWORD_CHANGE_SUCCESS);
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.message || error?.message || TOAST_MESSAGES.PROFILE.PASSWORD_CHANGE_FAILED;
      toast.error(errorMessage);
    },
  });

  const changePassword = useCallback(async (data: ChangeRenterInvestorPasswordRequest) => {
    // Send all required fields including confirmPassword
    const { currentPassword, newPassword, confirmPassword } = data;
    changePasswordMutation.mutate({ currentPassword, newPassword, confirmPassword });
  }, [changePasswordMutation]);

  return {
    changePassword,
    isUpdating: changePasswordMutation.isPending,
  };
}; 