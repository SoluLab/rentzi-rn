import React from "react";
import { View, StyleSheet } from "react-native";
import { Header } from "@/components/ui/Header";
import { Typography } from "@/components/ui/Typography";
import { OTPInput } from "@/components/ui/OTPInput";
import { Button } from "@/components/ui/Button";
import { ForgotPasswordOTPHeader } from "@/components/ui/auth";
import { useForgotPasswordOTP } from "@/hooks/useForgotPasswordOTP";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function ForgotPasswordOTPScreen() {
  const {
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
  } = useForgotPasswordOTP();

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
          <ForgotPasswordOTPHeader email={params.email} />
          
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
            disabled={timeLeft > 0 || isResending}
            loading={isResending}
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
  otpContainer: {
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
