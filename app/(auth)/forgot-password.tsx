import React, { useState } from "react";
import { View, StyleSheet, Platform, StatusBar } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing"; 
import { validateEmail } from "@/utils/validation";
import { Header } from "@/components/ui/Header";
import { AUTH, ERROR_MESSAGES } from "@/constants/strings";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForgotPassword } from "@/services/apiClient";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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
      const response = await forgotPasswordMutation.mutateAsync({ email });
      
      if (response.success) {
        toast.success(AUTH.FORGOT_PASSWORD.SUBTITLE_CODE_SENT_OTP);
        router.push({
          pathname: "/(auth)/forgot-password-otp",
          params: { email: email },
        });
      } else {
        toast.error(response.message || ERROR_MESSAGES.AUTH.CODE_SEND_FAILED);
        setError(response.message || ERROR_MESSAGES.AUTH.CODE_SEND_FAILED);
      }
    } catch (error: any) {
      console.log("ForgotPassword error:", error);
      const errorMessage = error.message || ERROR_MESSAGES.AUTH.CODE_SEND_FAILED;
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

  return (
    <View style={styles.container}>
      <Header title="Forgot Password" />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Form */}
        <View style={styles.form}>
          <Typography
            variant="h4"
            color="primary"
            align="center"
            style={styles.formTitle}
          >
            Reset Passwords
          </Typography>

          <Typography
            variant="body2"
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
            loading={forgotPasswordMutation.status === "pending"}
            disabled={!email || forgotPasswordMutation.status === "pending"}
            style={styles.sendButton}
            variant="primary"
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  title: {
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.xs,
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  formTitle: {
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  sendButton: {
    marginTop: spacing.md,
  },
});
