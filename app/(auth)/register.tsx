import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { TermsAndConditions } from "@/components/ui/auth";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { spacing, colors } from "@/constants";
import { staticText } from "@/constants/staticText";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const roleType = params?.roleType as string | undefined;
  
  // Debug logging
  console.log("[RegisterScreen] params:", params);
  console.log("[RegisterScreen] roleType:", roleType);
  
  // Safety check to ensure params is not undefined
  if (!params) {
    console.log("Params is undefined, using default values");
  }
  
  const {
    formData,
    selectedCountryCode,
    acceptedTerms,
    errors,
    isLoading,
    updateField,
    setSelectedCountryCode,
    setAcceptedTerms,
    handleRegister,
  } = useRegisterForm(roleType);

  // Determine header title based on role type
  const getHeaderTitle = () => {
    if (roleType === "homeowner") {
      return "Create Homeowner Account";
    } else if (roleType === "renter_investor") {
      return "Create Renter/Investor Account";
    }
    return "Create Account";
  };

  return (
    <View style={styles.container}>
      <Header title={getHeaderTitle()} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Input
            label="First Name"
            value={formData.firstName}
            onChangeText={(value) => updateField("firstName", value)}
            placeholder="Enter first name"
            error={errors.firstName}
            autoCapitalize="words"
            textContentType="givenName"
          />
          
          <Input
            label="Last Name"
            value={formData.lastName}
            onChangeText={(value) => updateField("lastName", value)}
            placeholder="Enter last name"
            error={errors.lastName}
            autoCapitalize="words"
            textContentType="familyName"
          />
          
          <Input
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => updateField("email", value)}
            placeholder="Enter your email"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
          />
          
          <PhoneInput
            label="Mobile Number"
            value={formData.mobileNumber}
            onChangeText={(value) => updateField("mobileNumber", value)}
            placeholder="Enter your mobile number"
            error={errors.mobileNumber}
            selectedCountry={selectedCountryCode}
            onCountryChange={setSelectedCountryCode}
          />
          
          <View>
            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateField("password", value)}
              placeholder="Create a password"
              error={errors.password}
              secureTextEntry
              showPasswordToggle
              textContentType="newPassword"
            />
            <PasswordStrengthMeter
              password={formData.password}
              hideWhenSpaces={true}
            />
          </View>
          
          <Input
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField("confirmPassword", value)}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            secureTextEntry
            showPasswordToggle
            textContentType="newPassword"
          />
          
          <TermsAndConditions
            acceptedTerms={acceptedTerms}
            onTermsChange={setAcceptedTerms}
            error={errors.terms}
          />
          
          <Button
            title={staticText.auth.createAccount}
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.registerButton}
          />
          
          <View style={styles.loginPrompt}>
            <Typography variant="body" color="secondary">
              {staticText.auth.alreadyHaveAccount}{" "}
            </Typography>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Typography variant="body" color="primary">
                {staticText.auth.signIn}
              </Typography>
            </TouchableOpacity>
          </View>
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
  form: {
    gap: spacing.md,
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  registerButton: {
    marginTop: spacing.md,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
