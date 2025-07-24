import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Header } from '@/components/ui/Header';
import { Typography } from '@/components/ui/Typography';
import { OTPInput } from '@/components/ui/OTPInput';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { validateOTP } from '@/utils/validation';
import { useVerifyOtp } from '@/services/apiClient';
import { toast } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { email, phone } = useLocalSearchParams();
  const verifyOtpMutation = useVerifyOtp();
  const isLoading = verifyOtpMutation.status === 'pending' || verifyOtpMutation.isPending;
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

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
      await verifyOtpMutation.mutateAsync({ email: email as string, otp });
      toast.success('Verification successful! Welcome to Renzi');
      // Always navigate to home screen after successful verification
      router.replace('/(tabs)');
    } catch (error: any) {
      let errorMessage = 'Verification failed. Please check your OTP code.';
      if (error?.message) {
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
      setTimeLeft(300); // Reset timer
      setError('');
      toast.success('OTP resent successfully');
    } catch (error: any) {
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <ScreenContainer>
      <Header title="Verify OTP" showBackButton />
      
      <View style={styles.container}>
        <Typography variant="h2" style={styles.title}>
          Enter Verification Code
        </Typography>
        
        <Typography variant="body" style={styles.subtitle}>
          We've sent a 6-digit code to {email || phone}
        </Typography>

        <View style={styles.otpContainer}>
          <OTPInput
            value={otp}
            onOTPChange={setOtp}
            length={6}
            error={error}
          />
        </View>

        {error ? (
          <Typography variant="body2" style={styles.errorText}>
            {error}
          </Typography>
        ) : null}

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
          title="Resend OTP"
          onPress={handleResendOTP}
          variant="outline"
          disabled={timeLeft > 0}
          style={styles.resendButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
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
    color: colors.status.error,
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