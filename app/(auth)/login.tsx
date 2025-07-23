import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { ERROR_MESSAGES } from "@/utils/api";

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
import { useTheme } from "@react-navigation/native";
import { useLogin } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { useFocusEffect } from "@react-navigation/native";

export default function LoginScreen() { 

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

  const router = useRouter();
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
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
      newErrors.emailOrMobile =
        "Please enter a valid email address or mobile number";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    router.push("/(auth)/register");
  };
  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };
  const updateField = (field: string, value: string) => {
    if (field === "emailOrMobile") setEmailOrMobile(value);
    if (field === "password") setPassword(value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const { login } = useAuthStore();

  const loginMutation = useLogin({
    onSuccess: async (response) => {
      if (response.success && response.data) {
        await AsyncStorage.setItem("token", response.data.accessToken);
        await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
        toast.success("Login successful!");
        router.replace("/(tabs)");
      } else {
        toast.error(response.message || ERROR_MESSAGES.DEFAULT);
      }
    },
    onError: (error: any) => {
      console.error("Login Error:", error);
      const errorMessage = error?.message || ERROR_MESSAGES.DEFAULT;
      toast.error(errorMessage);
    },
  });

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    const isEmail = emailOrMobile.includes("@");
    const isMobile = /^\d+$/.test(emailOrMobile.replace(/\s/g, ""));
    let payload: any = { password };
    if (isEmail) {
      payload.email = emailOrMobile;
    } else if (isMobile) {
      payload.mobile = emailOrMobile.replace(/\s/g, "");
    } else {
      toast.error("Please enter a valid email address or mobile number");
      return;
    }
    loginMutation.mutate(payload);
  }, [emailOrMobile, password, loginMutation]);

  const isLoading = loginMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0E2538", "#28679E"]} style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} >
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            <View style={styles.container}>
              {/* Header Section */}
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <Image
                    source={{
                      uri: "https://raw.githubusercontent.com/vimalcvs/room/refs/heads/main/logo-removebg-preview.png",
                    }}
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
                  <Input
                    label="Email/Mobile Number"
                    value={emailOrMobile}
                    onChangeText={(value) =>
                      updateField("emailOrMobile", value)
                    }
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
                    <Typography
                      variant="caption"
                      color="secondary"
                      align="right"
                    >
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
                      onPress={handleRegister}
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
                      onPress={handleRegister}
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
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginHorizontal: spacing.md,
  },
  formTitle: {
    marginBottom: spacing.md,
    fontWeight: "700",
  },
  forgotPassword: {
    alignSelf: "flex-end",
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
    paddingHorizontal: spacing.xl,
  },
});
