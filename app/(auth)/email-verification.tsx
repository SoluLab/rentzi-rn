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
import { useVerifyOtp } from '@/services/apiClient';
import { validateOTP } from "@/utils/validation";
import { staticText } from "@/constants/staticText";
import { Ionicons } from "@expo/vector-icons";
export default function EmailVerificationScreen() {
  const router = useRouter();
  const { email, phone, type } = useLocalSearchParams<{
    email: string;
    phone: string;
    type: "register" | "login";
  }>();
  const verifyOtpMutation = useVerifyOtp();
  const isLoading = verifyOtpMutation.status === 'pending' || verifyOtpMutation.isPending;
  const [emailOTP, setEmailOTP] = useState("");
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
  const handleVerifyEmailOTP = async () => {
    // Validate email OTP
    const emailValidation = validateOTP(emailOTP);
    if (!emailValidation.isValid) {
      setError(emailValidation.error!);
      return;
    }
    if (timeLeft <= 0) {
      setError("OTP expired. Request a new one");
      return;
    }
    try {
      const response = await verifyOtpMutation.mutateAsync({ email, otp: emailOTP });
      
      // Check the new response format
      if (response.success) {
        toast.success("Email verification successful!");
        // For login, complete authentication after email verification
        // For registration, continue to mobile verification
        if (type === "login") {
          toast.success("Login successful! Welcome back.");
          router.replace("/(tabs)");
        } else {
          // Navigate to mobile verification for registration
          router.push({
            pathname: "/(auth)/mobile-verification",
            params: {
              email: email,
              phone: phone,
              type: type,
            },
          });
        }
      } else {
        // Handle unsuccessful response
        const errorMessage = response.message || "Email verification failed. Please check your OTP code.";
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (error: any) {
      let errorMessage = "Email verification failed. Please check your OTP code.";
      
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
      } else if (errorMessage.includes("valid 6-digit")) {
        errorMessage = "Please enter a valid 6-digit numeric OTP";
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
      // This part of the logic needs to be updated if resendOTP is no longer available
      // For now, we'll just increment attempts and show a message
      setResendAttempts((prev) => prev + 1);
      setTimeLeft(120);
      setResendCooldown(resendCooldownTime);
      setCanResend(false);
      setError("");
      setEmailOTP("");
      toast.success("New OTP code sent to your email and mobile!");
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };
  const handleEmailOTPChange = (newOTP: string) => {
    setEmailOTP(newOTP);
    if (error) {
      setError("");
    }
  };
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/login");
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
  const isVerifyDisabled = emailOTP.length !== 6 || timeLeft <= 0;
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Header title="Email Verification" onBackPress={handleBack} />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="mail-outline"
                  size={48}
                  color={colors.primary.navy}
                />
              </View>
              <Typography
                variant="h4"
                color="primary"
                align="center"
                style={styles.titleMain}
              >
                Verify Your Email
              </Typography>
              <Typography
                variant="caption"
                color="secondary"
                align="center"
                style={styles.contactInfo}
              >
                {email}  
              </Typography>
              {/* • {phone}    */}
            </View>
            <View style={styles.form}>
              {/* Email OTP Section */}
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
                  Please enter the 6-digit code sent to your email
                </Typography>
                <OTPInput
                  length={6}
                  onOTPChange={handleEmailOTPChange}
                  error={error}
                  isLoading={isLoading}
                  value={emailOTP}
                  timeLeft={formatTime(timeLeft)}
                />
                <Button
                  title="Verify Email"
                  onPress={handleVerifyEmailOTP}
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
                  Resend : {formatTime(timeLeft)}
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

                    {/*   {resendAttempts > 0 && (
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
                {resendAttempts >= maxResendAttempts && (
                  <Typography
                    variant="caption"
                    color="error"
                    align="center"
                    style={styles.maxAttemptsText}
                  >
                    Maximum resend attempts reached. Please try again later.
                  </Typography>
                )}

                {/*  <View style={styles.stepIndicator}>
                  <Typography
                    variant="caption"
                    color="secondary"
                    align="center"
                  >
                    Step 1 of 2 - Email Verification
                  </Typography>

                </View>
                */}
              </Card>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
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
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  content: {},
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
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
    opacity: 0.6,
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  titleMain: {
    fontWeight: "600",
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
