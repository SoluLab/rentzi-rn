import React from "react";
import { StyleSheet, View } from "react-native";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";
import { Header } from "@/components/ui/Header";
import { MobileVerificationHeader } from "@/components/ui/auth";
import { useMobileVerification } from "@/hooks/useMobileVerification";
import { colors, spacing } from "@/constants";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function MobileVerificationScreen() {
  const {
    otp,
    timeLeft,
    canResend,
    isLoading,
    setOtp,
    handleVerifyOTP,
    handleResendOTP,
    formatTime,
    params,
  } = useMobileVerification();

  return (
    <View style={styles.container}>
      <Header title="Verify Mobile Number" />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <MobileVerificationHeader phone={params.phone} />

          <View style={styles.otpSection}>
            <OTPInput value={otp} onOTPChange={setOtp} length={6} />
          </View>

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

          <Button
            onPress={handleVerifyOTP}
            disabled={otp.length !== 6 || isLoading}
            loading={isLoading}
            style={styles.verifyButton}
            title="Verify Mobile Number"
          />

          <View style={styles.helpSection}>
            <Typography
              variant="caption"
              color="secondary"
              align="center"
              style={styles.helpText}
            >
              Didn't receive the code? Check your SMS or try resending.
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
  otpSection: {
    marginBottom: spacing.md,
    alignItems: "center",
  },
  timerSection: {
    marginBottom: spacing.md,
    justifyContent: "center",
  },
  resendButton: {
    paddingHorizontal: spacing.lg,
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
