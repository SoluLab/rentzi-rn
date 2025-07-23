import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {} from "react-native";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useAuthStore } from "@/stores/authStore";
import { validateEmail } from "@/utils/validation";
import { Header } from "@/components/ui/Header";

export default function ForgotPasswordScreen() {
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
  const { sendForgotPasswordOTP, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateForm = () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error!);
      return false;
    }
    setError("");
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;

    try {
      await sendForgotPasswordOTP(email);
      toast.success("OTP sent to your email successfully!");

      // Navigate to OTP verification screen
      router.push({
        pathname: "/(auth)/forgot-password-otp",
        params: { email: email },
      });
    } catch (error: any) {
      console.log("ForgotPassword error:", error); // Debug: log error response
      let errorMessage =
        error.message || "Failed to send OTP. Please try again.";
      // Show specific message if email is not found
      if (
        errorMessage.toLowerCase().includes("email not found") ||
        errorMessage.toLowerCase().includes("no account")
      ) {
        errorMessage =
          "This email is not registered. Please check your email or sign up.";
      }
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const updateEmail = (value: string) => {
    setEmail(value);
    if (error) {
      setError("");
    }
  };
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
   
      <Header title="Forgot Password" onBackPress={handleBack} />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form */}
          <View style={styles.form}>
            <Typography
              variant="h3"
              color="primary"
              align="center"
              style={styles.formTitle}
            >
              Reset Passwords
            </Typography>

            <Typography
              variant="body"
              color="secondary"
              align="center"
              style={styles.description}
            >
              Enter your email address and we'll send you a verification code to
              reset your password.
            </Typography>

            <Input
              label="Email Address"
              value={email}
              onChangeText={updateEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
            />

            <Button
              title="Send Verification Code"
              onPress={handleSendOTP}
              loading={isLoading}
              disabled={!email || isLoading}
              style={styles.sendButton}
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    opacity: 0.8,
    fontSize: 16,
  },
  formCard: {},
  form: {
    gap: spacing.xs,
    marginHorizontal: spacing.md,
  },
  formTitle: {
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  description: {
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  sendButton: {
    marginTop: spacing.md,
  },
});
