import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { toast } from "@/components/ui/Toast";
import { useForgotPassword as useHomeownerForgotPassword } from "@/services/auth";
import { useRenterInvestorForgotPassword } from "@/services/renterInvestorAuth";
import { 
  forgotPasswordSchema, 
  type ForgotPasswordFormData,
  type ForgotPasswordParams
} from "@/types/auth";
import { TOAST_MESSAGES } from "@/constants/toastMessages";

interface UseForgotPasswordFormReturn {
  email: string;
  error: string;
  isLoading: boolean;
  setEmail: (email: string) => void;
  handleSendOTP: () => Promise<void>;
  params: any;
  userType: string;
}

export const useForgotPasswordForm = (): UseForgotPasswordFormReturn => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Determine userType for API call based on roleType
  const userType = params.roleType === "homeowner" ? "homeowner" : "renter_investor";

  // Mutations
  const forgotPasswordMutation = useHomeownerForgotPassword();
  const renterInvestorForgotPasswordMutation = useRenterInvestorForgotPassword();

  const isLoading = forgotPasswordMutation.isPending || renterInvestorForgotPasswordMutation.isPending;

  const validateForm = useCallback((): boolean => {
    try {
      forgotPasswordSchema.parse({ email });
      setError("");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const zodError = error as any;
        const errorMessage = zodError.errors?.[0]?.message || TOAST_MESSAGES.AUTH.VALIDATION.EMAIL_REQUIRED;
        setError(errorMessage);
      }
      return false;
    }
  }, [email]);

  const handleSendOTP = useCallback(async () => {
    if (!validateForm()) return;

    try {
      let response;
      if (userType === "renter_investor") {
        response = await renterInvestorForgotPasswordMutation.mutateAsync({ email });
      } else {
        response = await forgotPasswordMutation.mutateAsync({ email });
      }

      if (response.success) {
        toast.success(
          response.data?.message || TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.OTP_SENT
        );
        router.push({
          pathname: "/(auth)/forgot-password-otp",
          params: { email: email, roleType: params.roleType },
        });
      } else {
        const errorMessage = response.message || TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.OTP_SENT_FAILED;
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error: any) {
      console.log("ForgotPassword error:", error);
      const errorMessage = error.message || TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.OTP_SENT_FAILED;
      toast.error(errorMessage);
      setError(errorMessage);
    }
  }, [
    email,
    validateForm,
    userType,
    renterInvestorForgotPasswordMutation,
    forgotPasswordMutation,
    router,
    params.roleType
  ]);

  const updateEmail = useCallback((value: string) => {
    setEmail(value);
    if (error) {
      setError("");
    }
  }, [error]);

  return {
    email,
    error,
    isLoading,
    setEmail: updateEmail,
    handleSendOTP,
    params,
    userType,
  };
}; 