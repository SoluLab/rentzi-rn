import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Header } from "@/components/ui/Header";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { NewPasswordHeader } from "@/components/ui/auth";
import { useNewPassword } from "@/hooks/useNewPassword";
import { spacing } from "@/constants/spacing";

export default function NewPasswordScreen() {
  const {
    password,
    confirmPassword,
    errors,
    hasSpaceInPassword,
    isLoading,
    setPassword,
    setConfirmPassword,
    handleResetPassword,
    handleBack,
  } = useNewPassword();

  return (
    <View style={styles.container}>
      <Header title="New Password" onBackPress={handleBack} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <NewPasswordHeader />
            
            <View>
              <Input
                label="New Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a new password"
                error={errors.password}
                secureTextEntry
                showPasswordToggle
                textContentType="newPassword"
              />
              <PasswordStrengthMeter
                password={password}
                hideWhenSpaces={true}
              />
            </View>
            
            <Input
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your new password"
              error={errors.confirmPassword}
              secureTextEntry
              showPasswordToggle
              textContentType="newPassword"
            />
            
            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={
                !password ||
                !confirmPassword ||
                isLoading ||
                hasSpaceInPassword ||
                Object.values(errors).some((error) => error)
              }
              style={styles.resetButton}
              variant="primary"
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
  scrollContent: {
    flexGrow: 1,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  resetButton: {
    marginTop: spacing.md,
  },
});
