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
import { useChangeHomeownerPassword } from '@/services/homeownerProfile';
import { useChangeRenterInvestorPassword } from '@/services/renterInvestorProfile';
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
  const [isFormValid, setIsFormValid] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  
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
  
  const { mutate: changeHomeownerPassword, isPending: isHomeownerUpdating } = useChangeHomeownerPassword({
    onSuccess: () => {
      // Navigation callback - only called when API returns success: true
      router.back();
    },
  });
  
  const { mutate: changeRenterPassword, isPending: isRenterUpdating } = useChangeRenterInvestorPassword({
    onSuccess: () => {
      // Navigation callback - only called when API returns success: true
      router.back();
    },
  });
  
  // Use homeowner API only for homeowners, use renter/investor API for renters and investors
  // If role cannot be determined, default to renter/investor API with a warning
  const changePassword = isHomeowner ? changeHomeownerPassword : changeRenterPassword;
  const isUpdating = isHomeowner ? isHomeownerUpdating : isRenterUpdating;
  
  // Log which API will be used
  console.log('ChangePassword - Will use API:', isHomeowner ? 'HOMEOWNER' : 'RENTER_INVESTOR');

  // Real-time validation function
  const validateFormRealTime = () => {
    const newErrors: Record<string, string> = {};
    
    // Current password validation - only show error if field is touched and empty
    if (touchedFields.currentPassword && !currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    // New password validation
    if (touchedFields.newPassword) {
      if (!newPassword) {
        newErrors.newPassword = 'New password is required';
      } else {
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
          newErrors.newPassword = passwordValidation.error!;
        } else if (currentPassword && newPassword === currentPassword) {
          newErrors.newPassword = 'New password must be different from current password';
        }
      }
    }
    
    // Confirm password validation - only show error if field is touched
    if (touchedFields.confirmPassword) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (newPassword && confirmPassword !== newPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    
    // Check if form is valid (all fields filled and no errors)
    const isCurrentPasswordValid = currentPassword.length > 0;
    const isNewPasswordValid = newPassword.length > 0 && 
                              validatePassword(newPassword).isValid && 
                              newPassword !== currentPassword;
    const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === newPassword;
    
    const formValid = isCurrentPasswordValid && isNewPasswordValid && isConfirmPasswordValid;
    setIsFormValid(formValid);
    
    return Object.keys(newErrors).length === 0;
  };

  // Validate form on every field change
  useEffect(() => {
    validateFormRealTime();
  }, [currentPassword, newPassword, confirmPassword, touchedFields]);

  const validateForm = () => {
    return validateFormRealTime();
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
      changePassword(payload);
      // Navigation and error handling are now managed in the hook callbacks
      // No need for additional logic here
    } catch (error: any) {
      // Error handling is already done in the hooks
      console.error('Password change error:', error);
    }
  };

  const updateField = (field: string, value: string) => {
    // Mark field as touched when user starts typing
    if (!touchedFields[field]) {
      setTouchedFields(prev => ({ ...prev, [field]: true }));
    }
    
    if (field === 'currentPassword') setCurrentPassword(value);
    if (field === 'newPassword') setNewPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
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
                style={errors.newPassword ? styles.errorInput : undefined}
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
              style={errors.confirmPassword ? styles.errorInput : undefined}
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
              disabled={!isFormValid || isUpdating}
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
  errorInput: {
    borderColor: colors.status.error,
    borderWidth: 1,
  },
}); 