import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking, // <-- Add this import
} from 'react-native';
import { router } from 'expo-router';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import {
  validateEmail,
  validatePassword,
  validateMobileNumber,
  validateFullName,
} from '@/utils/validation';
import { spacing, colors, radius, shadow } from '@/constants';
import { staticText } from '@/constants/staticText';
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}
interface CountryCode {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}
// Mock database for checking uniqueness
const existingUsers = [
  { email: 'renter@rentzi.com', phone: '+15551234567' },
  { email: 'investor@rentzi.com', phone: '+15551234568' },
  { email: 'homeowner@rentzi.com', phone: '+15551234569' },
  { email: 'test@test.com', phone: '+15551234570' },
];
export default function RegisterScreen() {
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSpaceInPassword, setHasSpaceInPassword] = useState(false);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // First name validation
    const firstNameValidation = validateFullName(formData.firstName);
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.error!;
    }
    // Last name validation
    const lastNameValidation = validateFullName(formData.lastName);
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.error!;
    }
    // Email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    } else {
      // Check email uniqueness
      const emailExists = existingUsers.some(
        (user) => user.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (emailExists) {
        newErrors.email = 'An account with this email already exists';
      }
    }
    // Mobile number validation
    const mobileValidation = validateMobileNumber(formData.mobileNumber);
    if (!mobileValidation.isValid) {
      newErrors.mobileNumber = mobileValidation.error!;
    } else {
      // Check if mobile is exactly 10 digits
      const cleanMobile = formData.mobileNumber.replace(/\D/g, '');
      if (cleanMobile.length !== 10) {
        newErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
      } else {
        // Check mobile uniqueness
        const fullMobile = `${selectedCountryCode?.phoneCode || '+1'}${cleanMobile}`;
        const mobileExists = existingUsers.some((user) => user.phone === fullMobile);
        if (mobileExists) {
          newErrors.mobileNumber = 'An account with this mobile number already exists';
        }
      }
    }
    // Password validation with complexity rules
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error!;
    }
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    // Terms acceptance validation
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the Terms & Conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleRegister = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const cleanMobile = formData.mobileNumber.replace(/\D/g, '');
      const fullMobile = `${selectedCountryCode?.phoneCode || '+1'}${cleanMobile}`;
      await register({
        fullName: fullName,
        email: formData.email.toLowerCase().trim(),
        phone: fullMobile,
        country: selectedCountryCode?.name || 'United States',
        dateOfBirth: new Date(2000, 0, 1).toISOString(),
        password: formData.password,
        role: 'homeowner', // Set role as homeowner during registration
      });
      toast.success('Registration successful! Please verify your account');
      // Navigate directly to mobile verification
      router.push({
        pathname: '/(auth)/mobile-verification',
        params: {
          email: formData.email.toLowerCase().trim(),
          phone: fullMobile,
          type: 'register',
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  };
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Real-time space detection for password
    if (field === 'password') {
      const hasSpaces = /\s/.test(value);
      setHasSpaceInPassword(hasSpaces);
      if (hasSpaces) {
        setErrors((prev) => ({ ...prev, password: 'Password must not contain spaces' }));
      } else if (errors.password === 'Password must not contain spaces') {
        setErrors((prev) => ({ ...prev, password: '' }));
      }
    } else {
      // Clear error when user starts typing for other fields
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    }
  };
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Header title="Create Account" />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.form}>
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData('firstName', value)}
                  placeholder="Enter first name"
                  error={errors.firstName}
                  autoCapitalize="words"
                  textContentType="givenName"
                  containerStyle={styles.inputBox}
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData('lastName', value)}
                  placeholder="Enter last name"
                  error={errors.lastName}
                  autoCapitalize="words"
                  textContentType="familyName"
                  containerStyle={styles.inputBox}
                />
                <Input
                  label="Email Address"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  placeholder="Enter your email"
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  containerStyle={styles.inputBox}
                />
                <PhoneInput
                  label="Mobile Number"
                  value={formData.mobileNumber}
                  onChangeText={(value) => updateFormData('mobileNumber', value)}
                  placeholder="Enter your mobile number"
                  error={errors.mobileNumber}
                  selectedCountry={selectedCountryCode}
                  onCountryChange={setSelectedCountryCode}
                  containerStyle={styles.inputBox}
                />
                <View>
                  <Input
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    placeholder="Create a password"
                    error={errors.password}
                    secureTextEntry
                    showPasswordToggle
                    textContentType="newPassword"
                    containerStyle={styles.inputBox}
                  />
                  <PasswordStrengthMeter password={formData.password} hideWhenSpaces={true} />
                </View>
                <Input
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  placeholder="Confirm your password"
                  error={errors.confirmPassword}
                  secureTextEntry
                  showPasswordToggle
                  textContentType="newPassword"
                  containerStyle={styles.inputBox}
                />
                <View style={styles.termsContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => {
                      setAcceptedTerms(!acceptedTerms);
                      if (errors.terms) {
                        setErrors((prev) => ({ ...prev, terms: '' }));
                      }
                    }}
                  >
                    <View style={[styles.checkboxInner, acceptedTerms && styles.checkboxChecked]}>
                      {acceptedTerms && (
                        <Typography variant="caption" color="white">
                          ✓
                        </Typography>
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.termsTextRow}>
                    <Typography variant="body" color="secondary">
                      I agree to the
                    </Typography>
                    <TouchableOpacity accessibilityRole="link" onPress={() => Linking.openURL('https://www.google.com/')}>
                      <Typography variant="body" color="primary">
                        {' '}Terms & Conditions{' '}
                      </Typography>
                    </TouchableOpacity>
                    <Typography variant="body" color="secondary">
                      and
                    </Typography>
                    <TouchableOpacity accessibilityRole="link" onPress={() => Linking.openURL('https://www.google.com/')}>
                      <Typography variant="body" color="primary">
                        {' '}Privacy Policy
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </View>
                {errors.terms && (
                  <Typography variant="caption" color="error" style={styles.errorText}>
                    {errors.terms}
                  </Typography>
                )}
                <Button
                  title={staticText.auth.createAccount}
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.registerButton}
                />
                <View style={styles.loginPrompt}>
                  <Typography variant="body" color="secondary">
                    {staticText.auth.alreadyHaveAccount}{' '}
                  </Typography>
                  <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                    <Typography variant="body" color="primary">
                      {staticText.auth.signIn}
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>
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
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  nameField: {
    flex: 1,
  },
  inputBox: {},
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkbox: {
    marginTop: 2,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    ...shadow.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  termsText: {
    flex: 1,
  },
  termsTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    
    marginTop: 2,
  },
  errorText: {
    marginTop: -spacing.md,
  },
  registerButton: {
    marginTop: spacing.md,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
});