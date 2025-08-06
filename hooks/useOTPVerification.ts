import { useState, useEffect, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { toast } from "@/components/ui/Toast";
import { useVerifyOtp, useVerifyLoginOtp, useResendOtp } from "@/services/auth";
import { useRenterInvestorVerifyLoginOtp, useRenterInvestorResendOtp } from "@/services/renterInvestorAuth";
import { 
  otpSchema, 
  type OTPFormData,
  type OTPVerificationParams,
  type OTPVerificationRequest,
  type ResendOTPRequest
} from "@/types/auth";
import { TOAST_MESSAGES } from "@/constants/toastMessages";

interface UseOTPVerificationReturn {
  otp: string;
  otpError: string;
  timeLeft: number;
  isLoading: boolean;
  isResending: boolean;
  setOtp: (otp: string) => void;
  handleVerifyOTP: () => Promise<void>;
  handleResendOTP: () => Promise<void>;
  formatTime: (seconds: number) => string;
  params: OTPVerificationParams;
  userType: string;
}

export const useOTPVerification = (): UseOTPVerificationReturn => {
  const router = useRouter();
  const params = useLocalSearchParams<OTPVerificationParams>();
  
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute for resend OTP

  // Determine userType for API call based on roleType
  const userType = params.roleType === "homeowner" ? "homeowner" : "renter_investor";

  // Mutations
  const verifyOtpMutation = useVerifyOtp(userType);
  const verifyLoginOtpMutation = useVerifyLoginOtp(userType);
  const renterInvestorVerifyLoginOtpMutation = useRenterInvestorVerifyLoginOtp();
  
  const resendOtpMutation = useResendOtp(userType, {
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || TOAST_MESSAGES.AUTH.OTP.RESEND_SUCCESS);
      } else {
        toast.error(response.message || TOAST_MESSAGES.AUTH.OTP.RESEND_FAILED);
      }
    },
    onError: (error: any) => {
      const errorMessage = 
        error?.data?.message || 
        error?.message || 
        TOAST_MESSAGES.AUTH.OTP.RESEND_FAILED;
      toast.error(errorMessage);
    }
  });

  const renterInvestorResendOtpMutation = useRenterInvestorResendOtp({
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || TOAST_MESSAGES.AUTH.OTP.RESEND_SUCCESS);
      } else {
        toast.error(response.message || TOAST_MESSAGES.AUTH.OTP.RESEND_FAILED);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        TOAST_MESSAGES.AUTH.OTP.RESEND_FAILED;
      toast.error(errorMessage);
    },
  });

  const isLoading =
    verifyOtpMutation.isPending ||
    verifyLoginOtpMutation.isPending ||
    renterInvestorVerifyLoginOtpMutation.isPending ||
    resendOtpMutation.isPending ||
    renterInvestorResendOtpMutation.isPending;

  const isResending = resendOtpMutation.isPending || renterInvestorResendOtpMutation.isPending;

  // Timer effect
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
      setOtpError("");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const zodError = error as any;
        const errorMessage = zodError.errors?.[0]?.message || TOAST_MESSAGES.AUTH.VALIDATION.OTP_REQUIRED;
        setOtpError(errorMessage);
      }
      return false;
    }
  }, [otp]);

  const handleVerifyOTP = useCallback(async () => {
    // Clear any previous errors
    setOtpError("");

    // Validate OTP
    if (!validateOTP()) {
      return;
    }

    if (timeLeft <= 0) {
      setOtpError(TOAST_MESSAGES.AUTH.OTP.EXPIRED_OTP);
      return;
    }

    try {
      let response;

      if (params.type === "login" && userType === "renter_investor") {
        // Use new renter/investor verify login OTP API
        response = await renterInvestorVerifyLoginOtpMutation.mutateAsync({
          identifier: params.email,
          otp,
        });
        
        if (response.success) {
          toast.success(TOAST_MESSAGES.AUTH.OTP.VERIFICATION_SUCCESS);
          router.replace("/(tabs)");
        } else {
          const errorMessage = response.message || TOAST_MESSAGES.AUTH.OTP.VERIFICATION_FAILED;
          toast.error(errorMessage);
          setOtpError(errorMessage);
        }
        return;
      }

      // Handle other verification flows
      if (params.phone) {
        // Parse the phone object from JSON string
        const phoneObj = JSON.parse(params.phone);
        // If phone is present, use mobile verification
        response = await verifyLoginOtpMutation.mutateAsync({
          identifier: {
            countryCode: phoneObj.countryCode,
            mobile: phoneObj.mobile,
          },
          otp,
        });
      } else {
        // Otherwise use email verification
        response = await verifyOtpMutation.mutateAsync({
          identifier: params.email,
          otp,
        });
      }

      if (response.success) {
        toast.success(TOAST_MESSAGES.AUTH.OTP.VERIFICATION_SUCCESS);

        // Handle navigation based on type and role
        if (params.type === "register") {
          // For registration flow, redirect to login
          router.replace("/(auth)/login");
        } else {
          // For login flow, route based on roleType parameter
          if (params.roleType === "homeowner") {
            router.replace("/(homeowner-tabs)");
          } else {
            router.replace("/(tabs)");
          }
        }
      } else {
        const errorMessage = response.message || TOAST_MESSAGES.AUTH.OTP.VERIFICATION_FAILED;
        toast.error(errorMessage);
        setOtpError(errorMessage);
      }
    } catch (error: any) {
      let errorMessage = TOAST_MESSAGES.AUTH.OTP.VERIFICATION_FAILED;

      // Handle different error formats
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Map specific error messages
      if (errorMessage.includes("Invalid or expired OTP")) {
        errorMessage = TOAST_MESSAGES.AUTH.OTP.INVALID_OTP;
      } else if (errorMessage.includes("expired")) {
        errorMessage = TOAST_MESSAGES.AUTH.OTP.EXPIRED_OTP;
      } else if (errorMessage.includes("Incorrect OTP")) {
        errorMessage = TOAST_MESSAGES.AUTH.OTP.INCORRECT_OTP;
      }

      toast.error(errorMessage);
      setOtpError(errorMessage);
    }
  }, [
    otp,
    timeLeft,
    validateOTP,
    params,
    userType,
    renterInvestorVerifyLoginOtpMutation,
    verifyLoginOtpMutation,
    verifyOtpMutation,
    router
  ]);

  const handleResendOTP = useCallback(async () => {
    // Don't allow resend if timer is active or already resending
    if (timeLeft > 0 || isResending) {
      return;
    }

    try {
      if (userType === "renter_investor" && params.type === "login") {
        await renterInvestorResendOtpMutation.mutateAsync({
          identifier: params.email,
          type: "login",
        });
      } else {
        // fallback to original resendOtpMutation for other flows
        await resendOtpMutation.mutateAsync({
          email: params.email,
        });
      }
      
      setTimeLeft(60);
      setOtpError("");
    } catch (error) {
      // Error handling is done via mutation callbacks
      console.error("Resend OTP failed:", error);
    }
  }, [
    timeLeft,
    isResending,
    userType,
    params.type,
    params.email,
    renterInvestorResendOtpMutation,
    resendOtpMutation
  ]);

  return {
    otp,
    otpError,
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