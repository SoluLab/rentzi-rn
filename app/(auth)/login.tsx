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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { validateEmail, validateMobileNumber } from "@/utils/validation";
import { useLogin } from "@/services/apiClient"; 
import { useFocusEffect } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AuthResponse, LoginRequest } from "@/types";

export default function LoginScreen() {
  const router = useRouter();
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedUserType, setSelectedUserType] = useState<"renter_investor" | "homeowner">("renter_investor");
  const [showDropdown, setShowDropdown] = useState(false);

  const userTypeOptions = [
    { value: "renter_investor", label: "Sign in as Renter/Investor", icon: "person-outline" },
    { value: "homeowner", label: "Sign in as Homeowner", icon: "home-outline" },
  ];

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
        const { token, user } = response.data;
        // Check verification status
        if (!user.isEmailVerified || !user.isPhoneVerified) {
          toast.info("Please verify your account");
          // Pass token and email/phone to OTP screen
          router.push({
            pathname: "/(auth)/otp-verification",
            params: {
              email: user.email,
              phone: user.phoneNumber,
              token,
              type: "login",
              roleType: selectedUserType, // Pass the selected user type
            },
          });
          return;
        }
        // Store token and proceed
        await AsyncStorage.setItem("token", token);
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
    let payload: LoginRequest = { email: "", password };
    if (isEmail) {
      payload.email = emailOrMobile;
    } else if (isMobile) {
      payload.email = emailOrMobile; // API expects email field for both
    } else {
      toast.error("Please enter a valid email address or mobile number");
      toast.error(ERROR_MESSAGES.AUTH.INVALID_MOBILE_EMAIL);
      return;
    }
    console.log("[Login] Sending payload:", payload);
    loginMutation.mutate(payload);
  }, [emailOrMobile, password, loginMutation]);

  const isLoading = loginMutation.isPending;

  const quickAccessLogin = (role: string) => {
    let email = "";
    switch (role) {
      case "renter":
        email = "vimal1@solulab.com";
        break;
      case "investor":
        email = "investor@solulab.co";
        break;
      case "homeowner":
        email = "homeowner@solulab.co";
        break;
      default:
        email = "renter@solulab.co";
    }
    setEmailOrMobile(email);
    setPassword("@Test123");
  };

  const selectedOption = userTypeOptions.find(option => option.value === selectedUserType);

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

                {/* User Type Dropdown */}
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      console.log("Dropdown pressed, current state:", showDropdown);
                      setShowDropdown(!showDropdown);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownContent}>
                      <Ionicons
                        name={selectedOption?.icon as any}
                        size={20}
                        color={colors.primary.gold}
                      />
                      <Typography variant="body" color="primary" style={styles.dropdownText}>
                        {selectedOption?.label}
                      </Typography>
                    </View>
                    <Ionicons
                      name={showDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={colors.primary.gold}
                    />
                  </TouchableOpacity>
                  
                  {showDropdown && (
                    <View style={styles.dropdownMenu}>
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          selectedUserType === "renter_investor" && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setSelectedUserType("renter_investor");
                          setShowDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color={selectedUserType === "renter_investor" ? colors.background.primary : colors.primary.gold}
                        />
                        <Typography 
                          variant="body" 
                          color={selectedUserType === "renter_investor" ? "white" : "primary"}
                          style={styles.dropdownItemText}
                        >
                          Sign in as Renter/Investor
                        </Typography>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          selectedUserType === "homeowner" && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setSelectedUserType("homeowner");
                          setShowDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="home-outline"
                          size={20}
                          color={selectedUserType === "homeowner" ? colors.background.primary : colors.primary.gold}
                        />
                        <Typography 
                          variant="body" 
                          color={selectedUserType === "homeowner" ? "white" : "primary"}
                          style={styles.dropdownItemText}
                        >
                          Sign in as Homeowner
                        </Typography>
                      </TouchableOpacity>
                    </View>
                  )}
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
  dropdownContainer: {
    marginBottom: spacing.md,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.background.secondary,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dropdownText: {
    fontWeight: "600",
  },
  dropdownMenu: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginTop: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary.gold,
  },
  dropdownItemText: {
    fontWeight: "500",
  },
});
