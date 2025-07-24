import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { toast } from "@/components/ui/Toast";
import { useAuthStore } from "@/stores/authStore";
import { colors, spacing } from "@/constants";
import { Header } from "@/components/ui/Header";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function MobileVerificationScreen() {
  const router = useRouter();
  const {
    email,
    phone,
    type = "register",
  } = useLocalSearchParams<{
    email: string;
    phone: string;
    type: "register" | "login";
  }>();

  const {
    user,
    isLoading,
    otpExpiry,
    verifyMobileOTP,
    verifyEmailOTP,
    resendOTP,
  } = useAuthStore();

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      // For login flow, verify email OTP first, then mobile
      if (type === "login") {
        await verifyEmailOTP(otp, email || "");
        toast.success("Email verified successfully!");

        // After email verification for login, complete the login process
        toast.success("Login successful! Welcome back.");

        // Navigate based on user role
        if (user?.role === "homeowner") {
          router.replace("/(homeowner-tabs)");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        // For registration flow, verify mobile OTP
        await verifyMobileOTP(otp, phone || "");
        toast.success("Mobile number verified successfully!");

        // Navigation logic based on user type and role
        if (user?.role === "homeowner") {
          router.push("/kyc-verification");
        } else {
          router.push("/role-selection");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP");
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      await resendOTP(user?.email || email || "", phone || "");
      toast.success("OTP sent successfully!");
      setTimeLeft(120);
      setCanResend(false);
      setOtp("");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    }
  };

  const getVerificationType = () => {
    return type === "login" ? "Email" : "Mobile Number";
  };

  const getContactInfo = () => {
    return type === "login" ? email : phone;
  };

  const getIcon = () => {
    return type === "login" ? "mail-outline" : "phone-portrait";
  };

  return (
    <View style={styles.container}>
      <Header title={`Verify ${getVerificationType()}`} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={getIcon()}
                size={48}
                color={colors.primary.gold}
              />
            </View>
            <Typography
              variant="h4"
              color="primary"
              align="center"
              style={styles.title}
            >
              Verify {getVerificationType()}
            </Typography>
            <Typography
              variant="body2"
              color="secondary"
              align="center"
              style={styles.subtitle}
            >
              We've sent a 6-digit verification code to{"\n"}
              <Typography
                variant="body2"
                color="secondary"
                align="center"
                style={styles.contactInfo}
              >
                {getContactInfo()}
              </Typography>
            </Typography>
          </View>

          {/* OTP Input */}
          <View style={styles.otpSection}>
            <OTPInput value={otp} onOTPChange={setOtp} length={6} />
          </View>

          {/* Timer */}
          <View style={styles.timerSection}>
            {!canResend ? (
              <Typography variant="body2" color="secondary" align="center">
                Resend code in {formatTime(timeLeft)}
              </Typography>
            ) : (
              <Button
                variant="ghost"
                onPress={handleResendOTP}
                disabled={isLoading}
                style={styles.resendButton}
                title="Resend Code"
              />
            )}
          </View>

          {/* Verify Button */}
          <Button
            onPress={handleVerifyOTP}
            disabled={otp.length !== 6 || isLoading}
            loading={isLoading}
            style={styles.verifyButton}
            title={`Verify ${getVerificationType()}`}
          />

          {/* Help Text */}
          <View style={styles.helpSection}>
            <Typography
              variant="caption"
              color="secondary"
              align="center"
              style={styles.helpText}
            >
              {type === "login"
                ? "Didn't receive the code? Check your email or try resending."
                : "Didn't receive the code? Check your SMS or try resending."}
            </Typography>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  otpSection: {
    marginBottom: spacing.md,
    alignItems: "center",
  },
  timerSection: {
    marginBottom: spacing.md,
    justifyContent: "center",
  },

  resendButton: {
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
  },

  verifyButton: {
    marginBottom: spacing.lg,
  },
  helpSection: {
    alignItems: "center",
    paddingTop: spacing.md,
  },
  helpText: {
    textAlign: "center",

    lineHeight: 20,
  },
});
