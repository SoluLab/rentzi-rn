import React from "react";
import { View, StyleSheet, Platform, StatusBar } from "react-native";
import { useFocusEffect } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ForgotPasswordHeader } from "@/components/ui/auth";
import { useForgotPasswordForm } from "@/hooks/useForgotPassword";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function ForgotPasswordScreen() {
  const {
    email,
    error,
    isLoading,
    setEmail,
    handleSendOTP,
  } = useForgotPasswordForm();

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
        <View style={styles.form}>
          <ForgotPasswordHeader />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
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
  form: {
    gap: spacing.xs,
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  sendButton: {
    marginTop: spacing.md,
  },
});
