import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Header } from "@/components/ui/Header";
import { Typography } from "@/components/ui/Typography";
import { OTPInput } from "@/components/ui/OTPInput";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { validateOTP } from "@/utils/validation";
import { useVerifyOtp, useVerifyLoginOtp, useResendOtp } from "@/services/auth";
import { toast } from "@/components/ui/Toast";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { Ionicons } from "@expo/vector-icons";
import { useRenterInvestorVerifyLoginOtp } from "@/services/renterInvestorAuth";
import { RenterInvestorVerifyLoginOtpRequest, RenterInvestorVerifyLoginOtpResponse } from "@/types/renterInvestorAuth";
import { useRenterInvestorResendOtp } from "@/services/renterInvestorAuth";
import { RenterInvestorResendOtpRequest, RenterInvestorResendOtpResponse } from "@/types/renterInvestorAuth";

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { email, phone, type, roleType } = useLocalSearchParams<{
    email: string;
    phone: string;
    type: "register" | "login";
    roleType: string;
  }>();
  // Determine userType for API call based on roleType
  const userType = roleType === "homeowner" ? "homeowner" : "renter_investor";
  const verifyOtpMutation = useVerifyOtp(userType);
  const verifyLoginOtpMutation = useVerifyLoginOtp(userType);
  const renterInvestorVerifyLoginOtpMutation = useRenterInvestorVerifyLoginOtp();
  const renterInvestorResendOtpMutation = useRenterInvestorResendOtp({
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "OTP resent successfully");
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    },
  });
  const isLoading =
    verifyOtpMutation.status === "pending" ||
    verifyOtpMutation.isPending ||
    verifyLoginOtpMutation.status === "pending" ||
    verifyLoginOtpMutation.isPending ||
    renterInvestorVerifyLoginOtpMutation.status === "pending" ||
    renterInvestorVerifyLoginOtpMutation.isPending ||
    renterInvestorResendOtpMutation.status === "pending" ||
    renterInvestorResendOtpMutation.isPending;

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute for resend OTP
  const resendOtpMutation = useResendOtp(userType, {
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "OTP resent successfully");
      } else {
        toast.error(response.message || "Failed to resend OTP");
      }
    },
    onError: (error: any) => {
      const errorMessage = 
        error?.data?.message || 
        error?.message || 
        "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
    }
  });
  const isResending = resendOtpMutation.isPending;

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVerifyOTP = async () => {
    // Clear any previous errors
    setOtpError("");
    

    // Validate OTP
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      setOtpError(otpValidation.error!);
      return;
    }

    if (timeLeft <= 0) {
      setOtpError("OTP expired. Request a new one");
      return;
    }

    try {
      let response;
      if (type === "login" && userType === "renter_investor") {
        // Use new renter/investor verify login OTP API
        response = await renterInvestorVerifyLoginOtpMutation.mutateAsync({
          identifier: email as string,
          otp,
        });
        if (response.success) {
          toast.success("Verification successful!");
          // Save token or user info as needed here
          router.replace("/(tabs)");
        } else {
          const errorMessage = response.message || "Verification failed. Please check your OTP code.";
          toast.error(errorMessage);
          setOtpError(errorMessage);
        }
        return;
      }
      if (phone) {
        // Parse the phone object from JSON string
        const phoneObj = JSON.parse(phone);
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
          identifier: email as string,
          otp,
        });
      }

      // Check the new response format
      if (response.success) {
        toast.success("Verification successful!");

        // Handle navigation based on type and role
        if (type === "register") {
          // For registration flow, redirect to login
          router.replace("/(auth)/login");
        } else {
          // For login flow, route based on roleType parameter
          if (roleType === "homeowner") {
            router.replace("/(homeowner-tabs)");
          } else {
            router.replace("/(tabs)");
          }
        }
      } else {
        // Handle unsuccessful response
        const errorMessage =
          response.message ||
          "Verification failed. Please check your OTP code.";
        toast.error(errorMessage);
        setOtpError(errorMessage);
      }
    } catch (error: any) {
      let errorMessage = "Verification failed. Please check your OTP code.";

      // Handle different error formats
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Map specific error messages
      if (errorMessage.includes("Invalid or expired OTP")) {
        errorMessage = "Invalid or expired OTP. Please try again.";
      } else if (errorMessage.includes("expired")) {
        errorMessage = "OTP expired. Request a new one";
      } else if (errorMessage.includes("Incorrect OTP")) {
        errorMessage = "Incorrect OTP entered";
      }

      toast.error(errorMessage);
      setOtpError(errorMessage);
    }
  };

  const handleResendOTP = async () => {
    // Don't allow resend if timer is active or already resending
    if (timeLeft > 0 || isResending) {
      return;
    }

    try {
      if (userType === "renter_investor" && type === "login") {
        await renterInvestorResendOtpMutation.mutateAsync({
          identifier: email as string,
          type: "login",
        });
        setTimeLeft(60);
        setOtpError("");
        return;
      }
      // fallback to original resendOtpMutation for other flows
      await resendOtpMutation.mutateAsync({
        email: email as string,
      });
      setTimeLeft(60);
      setOtpError("");
    } catch (error) {
      // Error handling is done via mutation callbacks
      console.error("Resend OTP failed:", error);
    }
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <Header title="Verify OTP" showBackButton />

        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={"call-outline"}
                size={48}
                color={colors.primary.gold}
              />
            </View>
          </View>
          <Typography variant="h4" style={styles.title}>
            Enter Verification Code
          </Typography>

          <Typography variant="body" style={styles.subtitle}>
            We've sent a 6-digit code to{" "}
            {phone
              ? `${JSON.parse(phone).countryCode} ${JSON.parse(phone).mobile}`
              : email}
          </Typography>

          <View style={styles.otpContainer}>
            <OTPInput
              value={otp}
              onOTPChange={setOtp}
              length={6}
              error={otpError}
            />
          </View>

          <View style={styles.timerContainer}>
            <Typography variant="body2" style={styles.timerText}>
              Time remaining: {formatTime(timeLeft)}
            </Typography>
          </View>

          <Button
            title="Verify OTP"
            onPress={handleVerifyOTP}
            disabled={otp.length !== 6 || isLoading}
            loading={isLoading}
            style={styles.verifyButton}
          />

          <Button
            title={isResending ? "Resending..." : "Resend OTP"}
            onPress={handleResendOTP}
            variant="outline"
            disabled={timeLeft > 0 || isResending}
            loading={isResending}
            style={styles.resendButton}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: spacing.xl,
    color: colors.text.secondary,
  },
  otpContainer: {
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.status.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  timerText: {
    color: colors.text.secondary,
  },
  verifyButton: {
    marginBottom: spacing.md,
  },
  resendButton: {
    marginBottom: spacing.lg,
  },

  header: {
    alignItems: "center",

    marginVertical: spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,

    alignItems: "center",
    justifyContent: "center",
  },
});
