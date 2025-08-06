import { useState, useEffect, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { toast } from "@/components/ui/Toast";
import { useVerifyOtp, useResendOtp } from '@/services/auth';
import { useRenterInvestorVerifyForgotPasswordOtp, useRenterInvestorResendOtp } from '@/services/renterInvestorAuth';
import { 
  otpSchema, 
  type OTPFormData
} from "@/types/auth";
import { TOAST_MESSAGES } from "@/constants/toastMessages";

interface UseForgotPasswordOTPReturn {
  otp: string;
  error: string;
  timeLeft: number;
  isLoading: boolean;
  isResending: boolean;
  setOtp: (otp: string) => void;
  handleVerifyOTP: () => Promise<void>;
  handleResendOTP: () => Promise<void>;
  formatTime: (seconds: number) => string;
  params: any;
  userType: string;
}

export const useForgotPasswordOTP = (): UseForgotPasswordOTPReturn => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute

  // Determine userType for API call based on roleType
  const userType = params.roleType === "homeowner" ? "homeowner" : "renter_investor";

  // Mutations
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();
  const renterInvestorVerifyForgotPasswordOtpMutation = useRenterInvestorVerifyForgotPasswordOtp();
  
  const renterInvestorResendOtpMutation = useRenterInvestorResendOtp({
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.RESEND_SUCCESS);
      } else {
        toast.error(response.message || TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.RESEND_FAILED);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.RESEND_FAILED;
      toast.error(errorMessage);
    },
  });

  const isLoading =
    verifyOtpMutation.isPending ||
    resendOtpMutation.isPending ||
    renterInvestorVerifyForgotPasswordOtpMutation.isPending ||
    renterInvestorResendOtpMutation.isPending;

  const isResending = resendOtpMutation.isPending || renterInvestorResendOtpMutation.isPending;

  // Timer for OTP expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const validateOTP = useCallback((): boolean => {
    try {
      otpSchema.parse({ otp });
      setError("");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const zodError = error as any;
        const errorMessage = zodError.errors?.[0]?.message || TOAST_MESSAGES.AUTH.VALIDATION.OTP_REQUIRED;
        setError(errorMessage);
      }
      return false;
    }
  }, [otp]);

  const handleVerifyOTP = useCallback(async () => {
    if (!validateOTP()) return;

    try {
      let response;
      const email = Array.isArray(params.email) ? params.email[0] : params.email;
      
      console.log("[ForgotPasswordOTP] Verifying OTP for userType:", userType);
      
      if (userType === "renter_investor") {
        console.log("[ForgotPasswordOTP] Using RENTER API for verification (port 5000)");
        response = await renterInvestorVerifyForgotPasswordOtpMutation.mutateAsync({
          email,
          otp,
        });
      } else {
        console.log("[ForgotPasswordOTP] Using HOMEOWNER API for verification (port 5001)");
        response = await verifyOtpMutation.mutateAsync({
          identifier: email,
          otp,
        });
      }

      if (response.success) {
        toast.success(TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.VERIFICATION_SUCCESS);
        const roleType = Array.isArray(params.roleType) ? params.roleType[0] : params.roleType;
        router.push({
          pathname: "/(auth)/new-password",
          params: { email, code: otp, roleType },
        });
      } else {
        const errorMessage = response.message || TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.VERIFICATION_FAILED;
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error: any) {
      let errorMessage = TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.VERIFICATION_FAILED;
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes("Invalid or expired OTP")) {
        errorMessage = TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.VERIFICATION_FAILED;
      }
      
      toast.error(errorMessage);
      setError(errorMessage);
    }
  }, [
    otp,
    validateOTP,
    params.email,
    params.roleType,
    userType,
    renterInvestorVerifyForgotPasswordOtpMutation,
    verifyOtpMutation,
    router
  ]);

  const handleResendOTP = useCallback(async () => {
    try {
      const email = Array.isArray(params.email) ? params.email[0] : params.email;
      if (userType === "renter_investor") {
        await renterInvestorResendOtpMutation.mutateAsync({
          identifier: email,
          type: 'password_reset',
        });
      } else {
        // Homeowner and other roles
        await resendOtpMutation.mutateAsync({
          email,
        });
      }
      
      setTimeLeft(60);
      setOtp("");
    } catch (error: any) {
      toast.error(TOAST_MESSAGES.AUTH.FORGOT_PASSWORD.RESEND_FAILED);
    }
  }, [
    params.email,
    userType,
    renterInvestorResendOtpMutation,
    resendOtpMutation
  ]);

  return {
    otp,
    error,
    timeLeft,
    isLoading,
    isResending,
    setOtp,
    handleVerifyOTP,
    handleResendOTP,
    formatTime,
    params,
    userType,
  };
}; 