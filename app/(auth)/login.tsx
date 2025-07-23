import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { toast } from '@/components/ui/Toast';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
import { validateEmail, validatePassword, validateMobileNumber } from '@/utils/validation';
import { staticText } from '@/constants/staticText';
const { width } = Dimensions.get('window');
const screenHeight = Dimensions.get('window').height;
interface DemoUser {
  role: string;
  email: string;
  password: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}
const demoUsers: DemoUser[] = [
  {
    role: 'Renter',
    email: 'renter@rentzi.com',
    password: 'renter123',
    name: 'Alexander Sterling',
    icon: 'home-outline',
  },
  {
    role: 'Investor',
    email: 'investor@rentzi.com',
    password: 'investor123',
    name: 'Victoria Blackwood',
    icon: 'trending-up-outline',
  },
  {
    role: 'Homeowner',
    email: 'homeowner@rentzi.com',
    password: 'homeowner123',
    name: 'Marcus Rothschild',
    icon: 'business-outline',
  },
];
export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Detect if input is email or mobile number
    const isEmail = emailOrMobile.includes('@');
    const isMobile = /^\d+$/.test(emailOrMobile.replace(/\s/g, ''));
    if (isEmail) {
      const emailValidation = validateEmail(emailOrMobile);
      if (!emailValidation.isValid) {
        newErrors.emailOrMobile = emailValidation.error!;
      }
    } else if (isMobile) {
      const mobileValidation = validateMobileNumber(emailOrMobile);
      if (!mobileValidation.isValid) {
        newErrors.emailOrMobile = mobileValidation.error!;
      }
    } else {
      newErrors.emailOrMobile = 'Please enter a valid email address or mobile number';
    }
    // Simple password validation for login - only check if password exists
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      await login(emailOrMobile, password);
      toast.success('Credentials verified! Sending OTP...');
      // Navigate to email verification first for 2FA
      router.push({
        pathname: '/(auth)/email-verification',
        params: {
          email: emailOrMobile.includes('@') ? emailOrMobile : 'user@example.com',
          phone: '+1 (555) 123-4567',
          type: 'login',
        },
      });
    } catch (error: any) {
      // Handle specific error messages from authStore with proper error display
      let errorMessage = 'Login failed. Please try again.';
      if (error.message) {
        if (error.message.includes('No account found')) {
          errorMessage = 'No account found with this email. Please sign up first';
        } else if (error.message.includes('Incorrect password')) {
          errorMessage = 'Incorrect password';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
    }
  };
  const handleDemoLogin = async (demoUser: DemoUser) => {
    setEmailOrMobile(demoUser.email);
    setPassword(demoUser.password);
    setErrors({});
    try {
      await login(demoUser.email, demoUser.password);
      toast.success(`Welcome ${demoUser.name}! Sending OTP...`);
      // Navigate to email verification first for 2FA
      router.push({
        pathname: '/(auth)/email-verification',
        params: {
          email: demoUser.email,
          phone: '+1 (555) 123-4567',
          type: 'login',
        },
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Demo login failed. Please try again.';
      toast.error(errorMessage);
    }
  };
  const handleRegister = () => {
    router.push('/(auth)/register');
  };
  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };
  const updateField = (field: string, value: string) => {
    if (field === 'emailOrMobile') setEmailOrMobile(value);
    if (field === 'password') setPassword(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };
  return (
    <ScreenContainer>
      <LinearGradient
        colors={['#0E2538', '#28679E']}
        useAngle={true}
        angle={45}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <StatusBar style="light" />
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.splitContainer}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                  <View style={styles.logoContainer}>
                    <Image
                      source={{
                        uri: 'https://raw.githubusercontent.com/vimalcvs/room/refs/heads/main/logo-removebg-preview.png',
                      }}
                      style={styles.logo}
                      resizeMode="cover"
                    />
                  </View>
                  <Typography variant="h1" color="white" align="center" style={styles.title}>
                    Rentzi
                  </Typography>
                  <Typography variant="body" color="gold" align="center" style={styles.subtitle}>
                    Welcome to Luxury Livings
                  </Typography>
                </View>
                {/* Form Section */}
                <View style={styles.formSection}>
                  <Card style={styles.formCard}>
                    <View style={styles.form}>
                      <Typography
                        variant="h3"
                        color="primary"
                        align="center"
                        style={styles.formTitle}
                      >
                        Sign In
                      </Typography>
                      <Input
                        label="Email/Mobile Number"
                        value={emailOrMobile}
                        onChangeText={(value) => updateField('emailOrMobile', value)}
                        placeholder="Enter your email or mobile number"
                        keyboardType="default"
                        autoCapitalize="none"
                        error={errors.emailOrMobile}
                      />
                      <Input
                        label="Password"
                        value={password}
                        onChangeText={(value) => updateField('password', value)}
                        placeholder="Enter your password"
                        showPasswordToggle={true}
                        error={errors.password}
                      />
                      <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={handleForgotPassword}
                      >
                        <Typography variant="caption" color="secondary" align="right">
                          Forgot Password?
                        </Typography>
                      </TouchableOpacity>
                      <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={isLoading}
                        style={styles.loginButton}
                        variant="primary"
                      />
                      <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Typography variant="caption" color="secondary" style={styles.dividerText}>
                          Don't have an account?
                        </Typography>
                        <View style={styles.dividerLine} />
                      </View>
                      <Button
                        title="Sign up as Renter/Investor"
                        onPress={handleRegister}
                        variant="outline"
                      />
                      <View style={{ height: 1 }} />
                      <Button
                        title="Sign up as Homeowner"
                        onPress={handleRegister}
                        variant="outline"
                      />
                    </View>
                    {/* Demo Section */}
                    <View style={styles.demoSection}>
                      <Typography
                        variant="caption"
                        color="primary"
                        align="center"
                        style={styles.demoTitle}
                      >
                        Quick Demo Access
                      </Typography>
                      <View style={styles.demoButtons}>
                        {demoUsers.map((user, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.demoButton}
                            onPress={() => handleDemoLogin(user)}
                            disabled={isLoading}
                            activeOpacity={0.8}
                          >
                            <Ionicons name={user.icon} size={20} color={colors.neutral.white} />
                            <Typography
                              variant="caption"
                              color="white"
                              style={styles.demoButtonText}
                            >
                              {user.role}
                            </Typography>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </Card>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </LinearGradient>
    </ScreenContainer>
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
    minHeight: Dimensions.get('window').height - 100,
    paddingTop: spacing.lg,
    paddingBottom: 0,
  },
  splitContainer: {
    flex: 1,
  },
  headerSection: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    flex: 0.8,
    justifyContent: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.xxxl,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    opacity: 0.8,
    fontSize: 16,
  },
  formCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    marginTop: spacing.xl,
  },
  form: {
    gap: spacing.sm,
    marginHorizontal: spacing.sm,
  },
  formTitle: {
    marginBottom: spacing.lg,
    fontWeight: '700',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  loginButton: {
    marginTop: spacing.md,
    marginHorizontal: spacing.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    paddingHorizontal: spacing.sm,
  },
  demoSection: {
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxxl,
  },
  demoTitle: {
    marginBottom: spacing.md,
    opacity: 0.7,
    fontSize: 14,
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  demoButton: {
    flex: 1,
    backgroundColor: colors.primary.gold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    shadowColor: colors.primary.gold,
  },
  demoButtonText: {
    fontWeight: '600',
    fontSize: 12,
  },
});