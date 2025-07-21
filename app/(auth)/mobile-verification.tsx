import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { Header } from "@/components/ui/Header";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Card } from "@/components/ui/Card";
import { toast } from "@/components/ui/Toast";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useAuthStore } from "@/stores/authStore";
import { validateOTP } from "@/utils/validation";
import { staticText } from "@/constants/staticText";
import { Ionicons } from "@expo/vector-icons";
export default function MobileVerificationScreen() {
  const router = useRouter();
  const { email, phone, type } = useLocalSearchParams<{
    email: string;
    phone: string;
    type: "register" | "login";
  }>();
  const { verifyMobileOTP, resendOTP, isLoading } = useAuthStore();
  const [mobileOTP, setMobileOTP] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [error, setError] = useState<string>("");
  const maxResendAttempts = 3;
  const resendCooldownTime = 30;
  // Main timer for OTP expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const cooldownTimer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(timeLeft <= 0 || true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(cooldownTimer);
    }
  }, [resendCooldown, timeLeft]);
  const handleVerifyMobileOTP = async () => {
    // Validate mobile OTP
    const mobileValidation = validateOTP(mobileOTP);
    if (!mobileValidation.isValid) {
      setError(mobileValidation.error!);
      return;
    }
    if (timeLeft <= 0) {
      setError("OTP expired. Request a new one");
      return;
    }
    try {
      await verifyMobileOTP(mobileOTP, phone);
      toast.success("Mobile verification successful! 2FA completed.");
      // Always navigate to home screen after successful verification
      router.replace("/(tabs)");
    } catch (error: any) {
      let errorMessage =
        "Mobile verification failed. Please check your OTP code.";
      if (error.message) {
        if (error.message.includes("expired")) {
          errorMessage = "OTP expired. Request a new one";
        } else if (error.message.includes("Incorrect OTP")) {
          errorMessage = "Incorrect OTP entered";
        } else if (error.message.includes("valid 6-digit")) {
          errorMessage = "Please enter a valid 6-digit numeric OTP";
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };
  const handleResendOTP = async () => {
    if (
      !canResend ||
      resendAttempts >= maxResendAttempts ||
      resendCooldown > 0
    ) {
      return;
    }
    try {
      await resendOTP(email, phone);
      setResendAttempts((prev) => prev + 1);
      setTimeLeft(120);
      setResendCooldown(resendCooldownTime);
      setCanResend(false);
      setError("");
      setMobileOTP("");
      toast.success("New OTP code sent to your email and mobile!");
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };
  const handleMobileOTPChange = (newOTP: string) => {
    setMobileOTP(newOTP);
    if (error) {
      setError("");
    }
  };
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/email-verification");
    }
  };
  const getResendButtonState = () => {
    if (resendAttempts >= maxResendAttempts) {
      return {
        disabled: true,
        canShow: false,
        message: "Maximum resend attempts reached",
      };
    }
    if (resendCooldown > 0) {
      return {
        disabled: true,
        canShow: true,
        message: `Resend available in ${resendCooldown}s`,
      };
    }
    return { disabled: !canResend, canShow: true, message: "" };
  };
  const resendButtonState = getResendButtonState();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const isVerifyDisabled = mobileOTP.length !== 6 || timeLeft <= 0;
  return (
    <View style={styles.container}>
      <Header title="Mobile Verification" onBackPress={handleBack} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={48}
                  color={colors.primary.navy}
                />
              </View>
              <Typography variant="h4" color="primary" align="center">
                Verify Your Mobile
              </Typography>
              
              <Typography
                variant="caption"
                color="secondary"
                align="center"
                style={styles.contactInfo}
              >
                 {phone}
              </Typography>
            </View>
            <View style={styles.form}>
              {/* Mobile OTP Section */}
              <Card style={styles.otpCard}>
                <Typography
                  variant="h4"
                  color="primary"
                  align="center"
                  style={styles.otpTitle}
                >
                  Enter Verification Code
                </Typography>
                <Typography
                  variant="caption"
                  color="secondary"
                  align="center"
                  style={styles.otpSubtitle}
                >
                  Please enter the 6-digit code sent to your mobile
                </Typography>
                <OTPInput
                  length={6}
                  onOTPChange={handleMobileOTPChange}
                  error={error}
                  isLoading={isLoading}
                  value={mobileOTP}
                />

                <Button
                  title="Complete Verification"
                  onPress={handleVerifyMobileOTP}
                  loading={isLoading}
                  disabled={isVerifyDisabled}
                  style={styles.verifyButton}
                />

                {/* Resend Section */}

                <Typography
                  variant="caption"
                  color="primary"
                  align="center"
                  style={styles.timer}
                >
                  Resend in: {formatTime(timeLeft)}
                </Typography>

                {resendButtonState.canShow && (
                  <View style={styles.resendSection}>
                    <Button
                      title="Resend OTP"
                      onPress={handleResendOTP}
                      variant="outline"
                      disabled={resendButtonState.disabled}
                      style={styles.resendButton}
                    />

                    {/*  {resendAttempts > 0 && (
                      <Typography
                        variant="caption"
                        color="secondary"
                        align="center"
                        style={styles.attemptsText}
                      >
                        Resend attempts: {resendAttempts}/{maxResendAttempts}
                      </Typography>
                    )}

                     */}
                  </View>
                )}
                {/*  {resendAttempts >= maxResendAttempts && (
                  <Typography
                    variant="caption"
                    color="error"
                    align="center"
                    style={styles.maxAttemptsText}
                  >
                    Maximum resend attempts reached. Please try again later.
                  </Typography>
                )}

                
                <View style={styles.stepIndicator}>
                  <Typography variant="caption" color="secondary" align="center">
                    Step 2 of 2 - Mobile Verification
                  </Typography>
                </View>
                */}
              </Card>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.md,
    opacity: 0.8,
    lineHeight: 22,
  },
  contactInfo: {
    marginTop: spacing.sm,
    fontWeight: "600",
  },
  timer: {
    marginTop: spacing.md,
    fontWeight: "600",
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  otpCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  otpTitle: {
    marginBottom: spacing.xs,
    fontWeight: "600",
  },
  otpSubtitle: {
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  resendSection: {
    alignItems: "center",
    gap: spacing.sm,
  },
  cooldownText: {
    fontWeight: "500",
  },
  resendButton: {
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
  },
  attemptsText: {
    opacity: 0.6,
  },
  verifyButton: {
    marginTop: spacing.md,
  },
  stepIndicator: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  maxAttemptsText: {
    marginTop: spacing.sm,
    fontWeight: "500",
  },
});
