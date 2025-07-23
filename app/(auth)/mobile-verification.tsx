import React, { useState, useEffect } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import { BackButton } from '@/components/ui/BackButton';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import { colors, spacing, typography, radius } from '@/constants';

const { width } = Dimensions.get('window');

export default function MobileVerificationScreen() {
  const router = useRouter();
  const { email, phone, type = 'register' } = useLocalSearchParams<{
    email: string;
    phone: string;
    type: 'register' | 'login';
  }>();

  const {
    user,
    isLoading,
    otpExpiry,
    verifyMobileOTP,
    verifyEmailOTP,
    resendOTP,
  } = useAuthStore();

  const [otp, setOtp] = useState('');
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
      const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
      setTimeLeft(remaining);
      setCanResend(remaining === 0);
    }
  }, [otpExpiry]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      // For login flow, verify email OTP first, then mobile
      if (type === 'login') {
        await verifyEmailOTP(otp, email || '');
        toast.success('Email verified successfully!');
        
        // After email verification for login, complete the login process
        toast.success('Login successful! Welcome back.');
        
        // Navigate based on user role
        if (user?.role === 'homeowner') {
          router.replace('/(homeowner-tabs)');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        // For registration flow, verify mobile OTP
        await verifyMobileOTP(otp, phone || '');
        toast.success('Mobile number verified successfully!');

        // Navigation logic based on user type and role
        if (user?.role === 'homeowner') {
          router.push('/kyc-verification');
        } else {
          router.push('/role-selection');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify OTP');
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      await resendOTP(user?.email || email || '', phone || '');
      toast.success('OTP sent successfully!');
      setTimeLeft(120);
      setCanResend(false);
      setOtp('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    }
  };

  const getVerificationType = () => {
    return type === 'login' ? 'Email' : 'Mobile Number';
  };

  const getContactInfo = () => {
    return type === 'login' ? email : phone;
  };

  const getIcon = () => {
    return type === 'login' ? 'mail-outline' : 'phone-portrait';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ScreenContainer>
            <BackButton />

            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons name={getIcon()} size={48} color={colors.primary} />
                </View>
                <Typography variant="h1" style={styles.title}>
                  Verify {getVerificationType()}
                </Typography>
                <Typography variant="body" style={styles.subtitle}>
                  We've sent a 6-digit verification code to{'\n'}
                  <Typography variant="bodyBold" style={styles.contactInfo}>
                    {getContactInfo()}
                  </Typography>
                </Typography>
              </View>

              {/* OTP Input */}
              <View style={styles.otpSection}>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  length={6}
                  autoFocus
                />
              </View>

              {/* Timer */}
              <View style={styles.timerSection}>
                {!canResend ? (
                  <Typography variant="caption" style={styles.timerText}>
                    Resend code in {formatTime(timeLeft)}
                  </Typography>
                ) : (
                  <Button
                    variant="ghost"
                    onPress={handleResendOTP}
                    disabled={isLoading}
                    style={styles.resendButton}
                  >
                    <Typography variant="bodyBold" style={styles.resendText}>
                      Resend Code
                    </Typography>
                  </Button>
                )}
              </View>

              {/* Verify Button */}
              <Button
                onPress={handleVerifyOTP}
                disabled={otp.length !== 6 || isLoading}
                loading={isLoading}
                style={styles.verifyButton}
              >
                Verify {getVerificationType()}
              </Button>

              {/* Help Text */}
              <View style={styles.helpSection}>
                <Typography variant="caption" style={styles.helpText}>
                  {type === 'login' 
                    ? "Didn't receive the code? Check your email or try resending."
                    : "Didn't receive the code? Check your SMS or try resending."
                  }
                </Typography>
              </View>
            </View>
          </ScreenContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  contactInfo: {
    color: colors.primary,
  },
  otpSection: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    minHeight: 40,
    justifyContent: 'center',
  },
  timerText: {
    color: colors.textSecondary,
  },
  resendButton: {
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
  },
  resendText: {
    color: colors.primary,
  },
  verifyButton: {
    marginBottom: spacing.lg,
  },
  helpSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  helpText: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 20,
  },
});