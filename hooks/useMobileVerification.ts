import { useState, useEffect, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { toast } from "@/components/ui/Toast";
import { useVerifyLoginOtp, useResendOtp } from '@/services/auth';
import { useRenterInvestorVerifyLoginOtp, useRenterInvestorResendOtp } from '@/services/renterInvestorAuth';
import { useAuthStore } from "@/stores/authStore";
import { 
  otpSchema, 
  type OTPFormData,
  type MobileVerificationParams
} from "@/types/auth";
import { TOAST_MESSAGES } from "@/constants/toastMessages";

interface UseMobileVerificationReturn {
  otp: string;
  timeLeft: number;
  canResend: boolean;
  isLoading: boolean;
  setOtp: (otp: string) => void;
  handleVerifyOTP: () => Promise<void>;
  handleResendOTP: () => Promise<void>;
  formatTime: (seconds: number) => string;
  params: any;
  userType: string;
}

export const useMobileVerification = (): UseMobileVerificationReturn => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [canResend, setCanResend] = useState(false);

  const { user, otpExpiry } = useAuthStore();

  // Determine userType for API call based on roleType
  const userType = params.roleType === "homeowner" ? "homeowner" : "renter_investor";

  // Mutations
  const homeownerVerifyLoginOtpMutation = useVerifyLoginOtp();
  const renterInvestorVerifyLoginOtpMutation = useRenterInvestorVerifyLoginOtp();
  const homeownerResendOtpMutation = useResendOtp();
  
  const renterInvestorResendOtpMutation = useRenterInvestorResendOtp({
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || TOAST_MESSAGES.AUTH.MOBILE_VERIFICATION.RESEND_SUCCESS);
      } else {
        toast.error(response.message || TOAST_MESSAGES.AUTH.MOBILE_VERIFICATION.RESEND_FAILED);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        TOAST_MESSAGES.AUTH.MOBILE_VERIFICATION.RESEND_FAILED;
      toast.error(errorMessage);
    },
  });

  const isLoading = 
    homeownerVerifyLoginOtpMutation.isPending ||
    renterInvestorVerifyLoginOtpMutation.isPending ||
    homeownerResendOtpMutation.isPending ||
    renterInvestorResendOtpMutation.isPending;

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Update timer based on OTP expiry from store
  useEffect(() => {
    if (otpExpiry > 0) {
      const remaining = Math.max(
        0,
        Math.floor((otpExpiry - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
      setCanResend(remaining === 0);
    }
  }, [otpExpiry]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const validateOTP = useCallback((): boolean => {
    try {
      otpSchema.parse({ otp });
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const zodError = error as any;
        const errorMessage = zodError.errors?.[0]?.message || TOAST_MESSAGES.AUTH.VALIDATION.OTP_REQUIRED;
        toast.error(errorMessage);
      }
      return false;
    }
  }, [otp]);

  const handleVerifyOTP = useCallback(async () => {
    if (!validateOTP()) {
      return;
    }

    try {
      let response;
      const email = Array.isArray(params.email) ? params.email[0] : params.email;
      const identifier = email || user?.email || '';

      console.log("[MobileVerification] Calling API for userType:", userType);
      
      if (userType === "renter_investor") {
        console.log("[MobileVerification] Using RENTER API (port 5000)");
        response = await renterInvestorVerifyLoginOtpMutation.mutateAsync({
          identifier,
          otp,
        });
      } else {
        console.log("[MobileVerification] Using HOMEOWNER API (port 5001)");
        // For homeowner registration
        const phone = Array.isArray(params.phone) ? params.phone[0] : params.phone;
        response = await homeownerVerifyLoginOtpMutation.mutateAsync({
          identifier: {
            countryCode: "+1", // Default country code for homeowner
            mobile: phone || "",
          },
          otp,
        });
      }

      if (response.success) {
        toast.success(TOAST_MESSAGES.AUTH.MOBILE_VERIFICATION.SUCCESS);
        toast.success(TOAST_MESSAGES.AUTH.MOBILE_VERIFICATION.REGISTRATION_COMPLETED);
        router.replace("/(auth)/login");
      } else {
        const errorMessage = response.message || TOAST_MESSAGES.AUTH.MOBILE_VERIFICATION.VERIFICATION_FAILED;
        toast.error(errorMessage);
      }
    } catch (error: any) {
      let errorMessage = TOAST_MESSAGES.AUTH.MOBILE_VERIFICATION.VERIFICATION_FAILED;
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes("Invalid or expired OTP")) {
        errorMessage = TOAST_MESSAGES.AUTH.MOBILE_VERIFICATION.VERIFICATION_FAILED;
      }
      
      toast.error(errorMessage);
    }
  }, [
    otp,
    validateOTP,
    params.email,
    user?.email,
    userType,
    renterInvestorVerifyLoginOtpMutation,
    homeownerVerifyLoginOtpMutation,
    router
  ]);

  const handleResendOTP = useCallback(async () => {
    if (!canResend) return;

    try {
      const email = Array.isArray(params.email) ? params.email[0] : params.email;
      const identifier = email || user?.email || '';

      console.log("[MobileVerification] Resend OTP for userType:", userType);
      
      if (userType === "renter_investor") {
        console.log("[MobileVerification] Using RENTER API for resend (port 5000)");
        await renterInvestorResendOtpMutation.mutateAsync({
          identifier,
          type: 'signup',
        });
      } else {
        console.log("[MobileVerification] Using HOMEOWNER API for resend (port 5001)");
        // Use homeowner resend OTP function
        await homeownerResendOtpMutation.mutateAsync({
          email: identifier,
        });
        toast.success(TOAST_MESSAGES.AUTH.MOBILE_VERIFICATION.RESEND_SUCCESS);
      }

      setTimeLeft(60);
      setCanResend(false);
      setOtp("");
    } catch (error: any) {
      toast.error(error.message || TOAST_MESSAGES.AUTH.MOBILE_VERIFICATION.RESEND_FAILED);
    }
  }, [
    canResend,
    params.email,
    user?.email,
    userType,
    renterInvestorResendOtpMutation,
    homeownerResendOtpMutation
  ]);

  return {
    otp,
    timeLeft,
    canResend,
    isLoading,
    setOtp,
    handleVerifyOTP,
    handleResendOTP,
    formatTime,
    params,
    userType,
  };
}; 