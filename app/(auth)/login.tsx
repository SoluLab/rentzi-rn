import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { ERROR_MESSAGES, AUTH } from "@/constants/strings";

import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { validateEmail, validateMobileNumber } from "@/utils/validation";
import { useLogin } from "@/services/auth";
import { useFocusEffect } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AuthResponse, LoginRequest } from "@/types";
import { NetworkTest } from "@/components/ui/NetworkTest";

export default function LoginScreen() {
  const router = useRouter();
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedUserType, setSelectedUserType] = useState<
    "renter_investor" | "homeowner"
  >("renter_investor");

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle("light-content");
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("#fff");
      }
      return () => {
        StatusBar.setBarStyle("light-content");
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#fff");
        }
      };
    }, [])
  );

  const handleRegister = (roleType: string) => {
    router.push({ pathname: "/(auth)/register", params: { roleType } });
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const isEmail = emailOrMobile.includes("@");
    const isMobile = /^\d+$/.test(emailOrMobile.replace(/\s/g, ""));
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
      newErrors.emailOrMobile = ERROR_MESSAGES.AUTH.INVALID_MOBILE_EMAIL;
    }
    if (!password) {
      newErrors.password = ERROR_MESSAGES.AUTH.PASSWORDS_REQUIRED;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: string, value: string) => {
    if (field === "emailOrMobile") setEmailOrMobile(value);
    if (field === "password") setPassword(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const loginMutation = useLogin(selectedUserType, {
    onSuccess: async (response: AuthResponse) => {
      console.log("Login API success:", response);
      if (response.success && response.data) {
        const { user } = response.data;

        // Check verification status
        if (!user.isEmailVerified || !user.isPhoneVerified) {
          toast.info("Please verify your account");
          // Pass email/phone to OTP screen (token is now stored in AsyncStorage)
          router.push({
            pathname: "/(auth)/otp-verification",
            params: {
              email: user.email,
              phone: JSON.stringify(user.phone), // Pass the entire phone object
              type: "login",
              roleType: selectedUserType, // Pass the selected user type
            },
          });
          return;
        }
        // User is already verified, proceed to main app
        toast.success(AUTH.LOGIN.SUCCESS);
        router.replace("/(tabs)");
      } else {
        // Handle error response format: { "success": false, "message": "Invalid email or password", "data": null }
        const errorMessage =
          response.message || ERROR_MESSAGES.AUTH.LOGIN_FAILED;
        toast.error(errorMessage);
        console.error("Login API error:", response);
      }
    },
    onError: (error) => {
      console.error("Login API error:", error);
      // Handle error response format: { "success": false, "message": "Invalid email or password", "data": null }
      let errorMessage = ERROR_MESSAGES.AUTH.LOGIN_FAILED;

      if (error?.data?.message) {
        // If error has data.message (API error response)
        errorMessage = error.data.message;
      } else if (error?.message) {
        // If error has direct message (network error, etc.)
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    const isEmail = emailOrMobile.includes("@");
    const isMobile = /^\d+$/.test(emailOrMobile.replace(/\s/g, ""));
    let payload: LoginRequest = { identifier: "", password };
    if (isEmail) {
      payload.identifier = emailOrMobile;
    } else if (isMobile) {
      payload.identifier = emailOrMobile; // API expects identifier field for both
    } else {
      toast.error("Please enter a valid email address or mobile number");
      toast.error(ERROR_MESSAGES.AUTH.INVALID_MOBILE_EMAIL);
      return;
    }
    console.log("[Login] Sending payload:", payload);
    loginMutation.mutate(payload);
  }, [emailOrMobile, password, loginMutation]);

  const isLoading = loginMutation.isPending;

  const quickAccessLogin = async (role: string) => {
    let email = "vimal@solulab.co";
    const defaultPassword = "@Test123";

    // Set the user type based on role
    if (role === "homeowner") {
      setSelectedUserType("homeowner");
    } else {
      setSelectedUserType("renter_investor");
    }

    // Set credentials
    setEmailOrMobile(email);
    setPassword(defaultPassword);

    // Small delay to ensure state updates
    setTimeout(() => {
      // Create login payload
      const payload: LoginRequest = {
        identifier: email,
        password: defaultPassword,
      };

      // Trigger login
      loginMutation.mutate(payload);
    }, 100);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0E2538", "#28679E"]} style={styles.container}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          enableOnAndroid={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/images/logo.png")}
                  style={styles.logo}
                  resizeMode="cover"
                />
              </View>
              <Typography
                variant="h4"
                color="white"
                align="center"
                weight="bold"
              >
                Rentzi
              </Typography>

              <Typography variant="body" color="gold" align="center">
                Welcome to Luxury Livings
              </Typography>
            </View>
            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.form}>
                <Typography
                  variant="h3"
                  color="primary"
                  align="center"
                  style={styles.formTitle}
                >
                  Sign In
                </Typography>

                {/* User Type Tabs */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tabButton,
                      selectedUserType === "renter_investor" &&
                        styles.activeTabButton,
                    ]}
                    onPress={() => setSelectedUserType("renter_investor")}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={
                        selectedUserType === "renter_investor"
                          ? colors.neutral.white
                          : colors.text.secondary
                      }
                    />
                    <Typography
                      variant="body"
                      color={
                        selectedUserType === "renter_investor"
                          ? "white"
                          : "secondary"
                      }
                      style={styles.tabText}
                    >
                      Renter/Investor
                    </Typography>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tabButton,
                      selectedUserType === "homeowner" &&
                        styles.activeTabButton,
                    ]}
                    onPress={() => setSelectedUserType("homeowner")}
                  >
                    <Ionicons
                      name="home-outline"
                      size={20}
                      color={
                        selectedUserType === "homeowner"
                          ? colors.neutral.white
                          : colors.text.secondary
                      }
                    />
                    <Typography
                      variant="body"
                      color={
                        selectedUserType === "homeowner" ? "white" : "secondary"
                      }
                      style={styles.tabText}
                    >
                      Homeowner
                    </Typography>
                  </TouchableOpacity>
                </View>

                <Input
                  label="Email/Mobile Number"
                  value={emailOrMobile}
                  onChangeText={(value) => updateField("emailOrMobile", value)}
                  placeholder="Enter your email or mobile number"
                  keyboardType="default"
                  autoCapitalize="none"
                  error={errors.emailOrMobile}
                />
                <Input
                  label="Password"
                  value={password}
                  onChangeText={(value) => updateField("password", value)}
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
                  <Typography
                    variant="caption"
                    color="secondary"
                    style={styles.dividerText}
                  >
                    Don't have an account?
                  </Typography>
                  <View style={styles.dividerLine} />
                </View>
                <View style={styles.buttonSection}>
                  <Button
                    title="Sign up as Renter/Investor"
                    onPress={() => handleRegister("renter_investor")}
                    variant="outline"
                    leftIcon={
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color={colors.primary.gold}
                      />
                    }
                  />
                  <View style={{ height: 12 }} />
                  <Button
                    title="Sign up as Homeowner"
                    onPress={() => handleRegister("homeowner")}
                    variant="outline"
                    leftIcon={
                      <Ionicons
                        name="home-outline"
                        size={20}
                        color={colors.primary.gold}
                      />
                    }
                  />
                </View>

                {/* Quick Access Buttons at Bottom End */}

                {/* Network Test Component for Debugging */}
                <NetworkTest />

                <Typography
                  variant="body2"
                  color="secondary"
                  align="center"
                  style={{ marginTop: spacing.md }}
                >
                  Quick Access
                </Typography>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: spacing.md,
                    marginBottom: spacing.md,
                    gap: 12,
                  }}
                >
                  <Button
                    title="Renter"
                    variant="outline"
                    size="small"
                    style={{ minWidth: 90 }}
                    onPress={() => quickAccessLogin("renter")}
                  />
                  <Button
                    title="Investor"
                    variant="outline"
                    size="small"
                    style={{ minWidth: 90 }}
                    onPress={() => quickAccessLogin("investor")}
                  />
                  <Button
                    title="Homeowner"
                    variant="outline"
                    size="small"
                    style={{ minWidth: 90 }}
                    onPress={() => quickAccessLogin("homeowner")}
                  />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </LinearGradient>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  headerSection: {
    flex: 0.25,
    alignItems: "center",
    justifyContent: "center",
  },
  formSection: {
    flex: 0.75,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background.primary,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    marginTop: spacing.xxxl,
  },
  logo: {
    width: 60,
    height: 60,
  },
  form: {
    gap: spacing.xs,
    paddingHorizontal: spacing.layout.screenPadding,
  },
  formTitle: {
    marginBottom: spacing.md,
    fontWeight: "700",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: spacing.md,
  },
  loginButton: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    paddingHorizontal: spacing.sm,
  },

  buttonSection: {
    paddingHorizontal: spacing.md,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    borderRadius: 100,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.md,
    shadowColor: colors.text.primary,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 100,
  },
  activeTabButton: {
    backgroundColor: colors.primary.gold,
  },
  tabText: {
    fontWeight: "600",
  },
});
