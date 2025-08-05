import React, { useState, useEffect, useCallback } from "react";
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
  
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute for resend OTP
  const [isNavigating, setIsNavigating] = useState(false);

  // Initialize mutations with proper error handling
  const verifyOtpMutation = useVerifyOtp(userType, {
    onError: (error: any) => {
      console.error("Verify OTP error:", error);
    }
  });
  
  const verifyLoginOtpMutation = useVerifyLoginOtp(userType, {
    onError: (error: any) => {
      console.error("Verify Login OTP error:", error);
    }
  });

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

  const isLoading =
    verifyOtpMutation.status === "pending" ||
    verifyOtpMutation.isPending ||
    verifyLoginOtpMutation.status === "pending" ||
    verifyLoginOtpMutation.isPending ||
    isNavigating;

  const isResending = resendOtpMutation.isPending;

  // Improved timer with proper cleanup
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const handleVerifyOTP = useCallback(async () => {
    // Prevent multiple submissions
    if (isLoading || isNavigating) {
      return;
    }

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
      setIsNavigating(true);
      let response;
      
      if (phone) {
        // Parse the phone object from JSON string with error handling
        let phoneObj;
        try {
          phoneObj = JSON.parse(phone);
        } catch (parseError) {
          console.error("Error parsing phone object:", parseError);
          setOtpError("Invalid phone number format");
          return;
        }
        
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
          email: email as string,
          otp,
        });
      }

      // Check the response format
      if (response?.success) {
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
          response?.message ||
          "Verification failed. Please check your OTP code.";
        toast.error(errorMessage);
        setOtpError(errorMessage);
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      
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
    } finally {
      setIsNavigating(false);
    }
  }, [otp, timeLeft, phone, email, type, roleType, isLoading, isNavigating, verifyOtpMutation, verifyLoginOtpMutation, router]);

  const handleResendOTP = useCallback(async () => {
    // Don't allow resend if timer is active or already resending
    if (timeLeft > 0 || isResending) {
      return;
    }

    try {
      await resendOtpMutation.mutateAsync({
        email: email as string,
      });
      
      // Reset timer and clear errors only on success
      setTimeLeft(60);
      setOtpError("");
    } catch (error) {
      // Error handling is done via mutation callbacks
      console.error("Resend OTP failed:", error);
    }
  }, [timeLeft, isResending, resendOtpMutation, email]);

  // Safe phone parsing
  const getDisplayPhone = useCallback(() => {
    if (!phone) return "";
    try {
      const phoneObj = JSON.parse(phone);
      return `${phoneObj.countryCode} ${phoneObj.mobile}`;
    } catch (error) {
      console.error("Error parsing phone for display:", error);
      return phone;
    }
  }, [phone]);

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
            {phone ? getDisplayPhone() : email}
          </Typography>

          <View style={styles.otpContainer}>
            <OTPInput
              value={otp}
              onOTPChange={setOtp}
              length={6}
              error={otpError}
              isLoading={isLoading}
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
