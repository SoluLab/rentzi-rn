import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useSegments, useLocalSearchParams } from 'expo-router';
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
import { useRenterInvestorChangePassword } from '@/hooks/useRenterInvestorChangePassword';
import { useAuthStore } from '@/stores/authStore';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const segments = useSegments();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Debug: Log user data to understand what's available
  console.log('ChangePassword - Full user object:', user);
  console.log('ChangePassword - User role:', user?.role);
  console.log('ChangePassword - User ID:', user?.id);
  console.log('ChangePassword - User email:', user?.email);
  
  // Determine user type and use appropriate hook
  // Priority: URL params > Auth store > Route segments
  const urlRole = params.role as string;
  const userRole = user?.role;
  
  // Fallback: Try to determine role from route segments
  const routeBasedRole = segments.some(segment => segment === '(homeowner-tabs)') ? 'homeowner' : 
                        segments.some(segment => segment === '(tabs)') ? 'renter' : null;
  
  const finalUserRole = urlRole || userRole || routeBasedRole;
  const isHomeowner = finalUserRole === 'homeowner';
  const isRenterOrInvestor = finalUserRole === 'renter' || finalUserRole === 'investor';
  
  // Debug: Log role determination
  console.log('ChangePassword - URL role param:', urlRole);
  console.log('ChangePassword - User role from auth store:', userRole);
  console.log('ChangePassword - Route segments:', segments);
  console.log('ChangePassword - Route-based role:', routeBasedRole);
  console.log('ChangePassword - Final user role:', finalUserRole);
  console.log('ChangePassword - Is homeowner determined:', isHomeowner);
  console.log('ChangePassword - Is renter/investor determined:', isRenterOrInvestor);
  
  // Monitor user state changes
  useEffect(() => {
    console.log('ChangePassword - User state changed:', user);
    console.log('ChangePassword - User role in useEffect:', user?.role);
    console.log('ChangePassword - Final user role in useEffect:', finalUserRole);
  }, [user, finalUserRole]);
  
  const { changePassword: changeHomeownerPassword, isUpdating: isHomeownerUpdating } = useHomeownerChangePassword();
  const { changePassword: changeRenterPassword, isUpdating: isRenterUpdating } = useRenterInvestorChangePassword();
  
  // Use homeowner API only for homeowners, use renter/investor API for renters and investors
  // If role cannot be determined, default to renter/investor API with a warning
  const changePassword = isHomeowner ? changeHomeownerPassword : changeRenterPassword;
  const isUpdating = isHomeowner ? isHomeownerUpdating : isRenterUpdating;
  
  // Log which API will be used
  console.log('ChangePassword - Will use API:', isHomeowner ? 'HOMEOWNER' : 'RENTER_INVESTOR');

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
    
    // Debug: Log user data at the time of password change
    console.log('ChangePassword - URL role param at password change:', urlRole);
    console.log('ChangePassword - User data at password change:', user);
    console.log('ChangePassword - User role at password change:', user?.role);
    console.log('ChangePassword - Final user role at password change:', finalUserRole);
    
    // Warn if using fallback role
    if (!urlRole && !userRole && routeBasedRole) {
      console.warn('ChangePassword - Using fallback route-based role:', routeBasedRole);
    }
    
    // Ensure we have a valid role (from URL params, auth store, or route segments)
    if (!finalUserRole) {
      console.error('ChangePassword - No user role found');
      console.error('ChangePassword - URL role param:', urlRole);
      console.error('ChangePassword - User role from auth store:', userRole);
      console.error('ChangePassword - Route segments:', segments);
      toast.error('User role not found. Please try again.');
      return;
    }
    
    const payload = {
      currentPassword,
      newPassword,
      confirmPassword,
    };
    
    // Debug logging to ensure correct API is being called
    console.log('ChangePassword - User role:', user?.role);
    console.log('ChangePassword - Is homeowner:', isHomeowner);
    console.log('ChangePassword - Is renter/investor:', isRenterOrInvestor);
    console.log('ChangePassword - Using API:', isHomeowner ? 'HOMEOWNER' : 'RENTER_INVESTOR');
    
    // Ensure we're using the correct API for the user role
    if (!isHomeowner && !isRenterOrInvestor) {
      console.error('ChangePassword - Invalid user role. Final user role:', finalUserRole);
      console.error('ChangePassword - User object:', user);
      console.error('ChangePassword - Route segments:', segments);
      toast.error('Invalid user role. Please contact support.');
      return;
    }
    
    try {
      await changePassword(payload);
      // The hooks will automatically show success toast and handle navigation
      router.back();
    } catch (error: any) {
      // Error handling is already done in the hooks
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
              Enter your current password and create a new secure password for your account
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