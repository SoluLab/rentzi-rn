import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { toast } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { validatePassword } from '@/utils/validation';
import { useHomeownerChangePassword } from '@/hooks/useHomeownerChangePassword';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { changePassword, isUpdating } = useHomeownerChangePassword();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (newPassword) {
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = passwordValidation.error!;
      }
    } else {
      newErrors.newPassword = 'New password is required';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    
    const payload = {
      currentPassword,
      newPassword,
      confirmPassword,
    };
    
    try {
      await changePassword(payload);
      // The hook will automatically show success toast and handle navigation
      router.back();
    } catch (error: any) {
      // Error handling is already done in the hook
      console.error('Password change error:', error);
    }
  };

  const updateField = (field: string, value: string) => {
    if (field === 'currentPassword') setCurrentPassword(value);
    if (field === 'newPassword') setNewPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Change Password" onBackPress={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Change Password Section */}
          <View style={styles.section}>
            <Typography variant="h4" style={styles.sectionTitle}>
              Change Password
            </Typography>
            <Typography variant="caption" color="secondary" style={styles.sectionDescription}>
              Enter your current password and create a new secure password
            </Typography>
            
            <Input
              label="Current Password"
              value={currentPassword}
              onChangeText={(value) => updateField('currentPassword', value)}
              placeholder="Enter your current password"
              secureTextEntry
              showPasswordToggle
              error={errors.currentPassword}
            />
            
            <View>
              <Input
                label="New Password"
                value={newPassword}
                onChangeText={(value) => updateField('newPassword', value)}
                placeholder="Enter your new password"
                secureTextEntry
                showPasswordToggle
                error={errors.newPassword}
              />
              <PasswordStrengthMeter password={newPassword} hideWhenSpaces={true} />
            </View>
            
            <Input
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              placeholder="Confirm your new password"
              secureTextEntry
              showPasswordToggle
              error={errors.confirmPassword}
            />
          </View>
          
          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Change Password"
              onPress={handleChangePassword}
              loading={isUpdating}
              variant="primary"
              style={styles.saveButton}
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
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  sectionDescription: {
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    paddingHorizontal: spacing.layout.screenPadding,
    paddingTop: spacing.lg,
  },
  saveButton: {
    marginBottom: spacing.lg,
  },
}); 