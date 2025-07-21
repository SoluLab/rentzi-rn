import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { Typography } from '@/components/ui/Typography';
import { OTPInput } from '@/components/ui/OTPInput';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { validateOTP } from '@/utils/validation';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
export default function ForgotPasswordOTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { verifyForgotPasswordOTP, sendForgotPasswordOTP, isLoading } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
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
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const handleVerifyOTP = async () => {
    // Validate OTP
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      setError(otpValidation.error!);
      return;
    }
    if (timeLeft <= 0) {
      setError('OTP expired. Request a new one');
      return;
    }
    try {
      await verifyForgotPasswordOTP(otp, email as string);
      toast.success('OTP verified successfully!');
      // Navigate to new password screen
      router.push({
        pathname: '/(auth)/new-password',
        params: { email: email },
      });
    } catch (error: any) {
      let errorMessage = 'Verification failed. Please check your OTP code.';
      if (error.message) {
        if (error.message.includes('expired')) {
          errorMessage = 'OTP expired. Request a new one';
        } else if (error.message.includes('Incorrect OTP')) {
          errorMessage = 'Incorrect OTP entered';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };
  const handleResendOTP = async () => {
    try {
      await sendForgotPasswordOTP(email as string);
      setTimeLeft(120); // Reset timer
      setError('');
      toast.success('OTP resent successfully');
    } catch (error: any) {
      toast.error('Failed to resend OTP. Please try again.');
    }
  };
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/forgot-password');
    }
  };
  return (
    <ScreenContainer>
      <Header title="Enter OTP" onBackPress={handleBack} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Typography variant="h2" color="primary" style={styles.title}>
              Enter Verification Code
            </Typography>
            <Typography variant="body1" color="primary" style={styles.subtitle}>
              We've sent a 6-digit code to {email}
            </Typography>
            <View style={styles.otpContainer}>
              <OTPInput value={otp} onOTPChange={setOtp} length={6} error={error} />
            </View>
            {error ? (
              <Typography variant="body2" color="primary" style={styles.errorText}>
                {error}
              </Typography>
            ) : null}
            <View style={styles.timerContainer}>
              <Typography variant="body2" color="primary" style={styles.timerText}>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.secondary,
  },
  otpContainer: {
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  timerContainer: {
    alignItems: 'center',
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
});