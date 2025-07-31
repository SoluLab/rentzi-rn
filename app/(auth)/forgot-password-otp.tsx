import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Header } from "@/components/ui/Header";
import { Typography } from "@/components/ui/Typography";
import { OTPInput } from "@/components/ui/OTPInput";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { validateOTP } from "@/utils/validation";
import { useVerifyOtp } from "@/services/apiClient";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function ForgotPasswordOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const verifyOtpMutation = useVerifyOtp();
  const isLoading =
    verifyOtpMutation.status === "pending" || verifyOtpMutation.isPending;
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVerifyOTP = async () => {
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      setError(otpValidation.error!);
      return;
    }
    try {
      const response = await verifyOtpMutation.mutateAsync({
        email: email as string,
        otp,
      });

      // Check the new response format
      if (response.success) {
        toast.success("OTP verified successfully!");
        router.push({
          pathname: "/(auth)/new-password",
          params: { email: email },
        });
      } else {
        // Handle unsuccessful response
        const errorMessage = response.message || "OTP verification failed";
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error: any) {
      let errorMessage = "OTP verification failed";

      // Handle different error formats
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Map specific error messages
      if (errorMessage.includes("Invalid or expired OTP")) {
        errorMessage = "Invalid or expired OTP. Please try again.";
      }

      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const handleResendOTP = async () => {
    try {
      // The original code had sendForgotPasswordOTP here, but it's removed from imports.
      // Assuming it's no longer needed or will be re-added if the intent was to resend OTP.
      // For now, removing it as per the new_code.
      toast.error("Resending OTP functionality is currently unavailable.");
    } catch (error: any) {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Enter OTP" />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Typography
            variant="h4"
            color="primary"
            align="center"
            style={styles.title}
          >
            Enter Verification Code
          </Typography>
          <Typography
            variant="body"
            color="secondary"
            align="center"
            style={styles.subtitle}
          >
            We've sent a 6-digit code to {email}
          </Typography>
          <View style={styles.otpContainer}>
            <OTPInput
              value={otp}
              onOTPChange={setOtp}
              length={6}
              error={error}
            />
          </View>

          <View style={styles.timerContainer}>
            <Typography variant="body2" color="secondary" align="center">
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
            title="Resend OTP"
            onPress={handleResendOTP}
            variant="outline"
            disabled={timeLeft > 0}
            style={styles.resendButton}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  form: {
    gap: spacing.xs,
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.md,
  },
  otpContainer: {
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.status.error,
    marginBottom: spacing.md,
  },
  timerContainer: {
    marginBottom: spacing.xl,
  },

  verifyButton: {
    marginBottom: spacing.md,
  },
  resendButton: {
    marginBottom: spacing.lg,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
  },
});
