import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { toast } from "@/components/ui/Toast";
import { useResetPassword } from "@/services/auth";
import { useRenterInvestorResetPassword } from '@/services/renterInvestorAuth';
import { 
  newPasswordSchema, 
  type NewPasswordFormData
} from "@/types/auth";
import { TOAST_MESSAGES } from "@/constants/toastMessages";

interface UseNewPasswordReturn {
  password: string;
  confirmPassword: string;
  errors: Record<string, string>;
  hasSpaceInPassword: boolean;
  isLoading: boolean;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  handleResetPassword: () => Promise<void>;
  handleBack: () => void;
  params: any;
  userType: string;
}

export const useNewPassword = (): UseNewPasswordReturn => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSpaceInPassword, setHasSpaceInPassword] = useState(false);

  // Determine userType for API call based on roleType
  const userType = params.roleType === "homeowner" ? "homeowner" : "renter_investor";

  // Mutations
  const resetPasswordMutation = useResetPassword();
  const renterInvestorResetPasswordMutation = useRenterInvestorResetPassword();
  
  const activeMutation = userType === "renter_investor" ? renterInvestorResetPasswordMutation : resetPasswordMutation;
  const isLoading = activeMutation.isPending;

  const validateForm = useCallback((): boolean => {
    try {
      newPasswordSchema.parse({ password, confirmPassword });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const zodError = error as any;
        const newErrors: Record<string, string> = {};
        zodError.errors?.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [password, confirmPassword]);

  const handleResetPassword = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    try {
      const email = Array.isArray(params.email) ? params.email[0] : params.email;
      const code = Array.isArray(params.code) ? params.code[0] : params.code;
      const verificationId = Array.isArray(params.verificationId) ? params.verificationId[0] : params.verificationId;

      if (userType === "renter_investor") {
        await renterInvestorResetPasswordMutation.mutateAsync({
          email,
          password,
          otp: code,
        });
      } else {
        // Homeowner logic (default)
        const resetPayload: any = {
          email,
          code,
          newPassword: password,
        };
        if (verificationId) {
          resetPayload.verificationId = Number(verificationId);
        }
        await resetPasswordMutation.mutateAsync(resetPayload);
      }

      toast.success(TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.RESET_SUCCESS);
      router.replace("/(auth)/login");
    } catch (error: any) {
      const errorMessage = error.message || TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.RESET_FAILED;
      toast.error(errorMessage);
    }
  }, [
    password,
    confirmPassword,
    validateForm,
    userType,
    params.email,
    params.code,
    params.verificationId,
    renterInvestorResetPasswordMutation,
    resetPasswordMutation,
    router
  ]);

  const updatePassword = useCallback((value: string) => {
    setPassword(value);
    
    // Real-time space detection for password
    const hasSpaces = /\s/.test(value);
    setHasSpaceInPassword(hasSpaces);
    
    if (hasSpaces) {
      setErrors((prev) => ({
        ...prev,
        password: TOAST_MESSAGES.AUTH.VALIDATION.PASSWORD_CONTAINS_SPACES,
      }));
    } else if (errors.password === TOAST_MESSAGES.AUTH.VALIDATION.PASSWORD_CONTAINS_SPACES) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
    
    // Clear other password errors when user starts typing
    if (errors.password && !hasSpaces) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  }, [errors.password]);

  const updateConfirmPassword = useCallback((value: string) => {
    setConfirmPassword(value);
    
    // Clear confirm password error when user starts typing
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
    
    // Real-time password match validation
    if (value && password && value !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: TOAST_MESSAGES.AUTH.VALIDATION.PASSWORDS_DONT_MATCH,
      }));
    } else if (value && password && value === password) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  }, [errors.confirmPassword, password]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/login");
    }
  }, [router]);

  return {
    password,
    confirmPassword,
    errors,
    hasSpaceInPassword,
    isLoading,
    setPassword: updatePassword,
    setConfirmPassword: updateConfirmPassword,
    handleResetPassword,
    handleBack,
    params,
    userType,
  };
}; 