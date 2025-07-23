import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BackButton } from '@/components/ui/BackButton';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { toast } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { validatePassword } from '@/utils/validation';
export default function NewPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const { resetPassword, isLoading } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSpaceInPassword, setHasSpaceInPassword] = useState(false);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Password validation with complexity rules
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error!;
    }
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleResetPassword = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    try {
      await resetPassword(email as string, password);
      toast.success('Password reset successfully! Please login with your new password.');
      // Navigate back to login screen
      router.replace('/(auth)/login');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
    }
  };
  const updatePassword = (value: string) => {
    setPassword(value);
    // Real-time space detection for password
    const hasSpaces = /\s/.test(value);
    setHasSpaceInPassword(hasSpaces);
    if (hasSpaces) {
      setErrors((prev) => ({ ...prev, password: 'Password must not contain spaces' }));
    } else if (errors.password === 'Password must not contain spaces') {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
    // Clear other password errors when user starts typing
    if (errors.password && !hasSpaces) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };
  const updateConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    // Clear confirm password error when user starts typing
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
    // Real-time password match validation
    if (value && password && value !== password) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (value && password && value === password) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="New Password" onBackPress={handleBack} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Form */}

          <View style={styles.form}>
            <Typography variant="h3" color="primary" align="center" style={styles.formTitle}>
              Set New Password
            </Typography>
            <Typography
              variant="body"
              color="secondary"
              align="center"
              style={styles.description}
            >
              Your new password must be different from your previous password.
            </Typography>
            <View>
              <Input
                label="New Password"
                value={password}
                onChangeText={updatePassword}
                placeholder="Create a new password"
                error={errors.password}
                secureTextEntry
                showPasswordToggle
                textContentType="newPassword"
              />
              <PasswordStrengthMeter password={password} hideWhenSpaces={true} />
            </View>
            <Input
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={updateConfirmPassword}
              placeholder="Confirm your new password"
              error={errors.confirmPassword}
              secureTextEntry
              showPasswordToggle
              textContentType="newPassword"
            />
            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={
                !password ||
                !confirmPassword ||
                isLoading ||
                hasSpaceInPassword ||
                Object.values(errors).some((error) => error)
              }
              style={styles.resetButton}
              variant="primary"
            />
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
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xl,

  },
  title: {

  },
  form: {
    gap: spacing.lg,
  },
  formTitle: {

  },
  description: {

  },
  resetButton: {
    marginTop: spacing.md,
  },
});