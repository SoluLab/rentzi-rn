import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { toast } from "@/components/ui/Toast";
import { useSignup } from "@/services/apiClient";
import { validateRegistrationForm } from "@/utils/validation";
import { spacing, colors, radius, shadow } from "@/constants";
import { staticText } from "@/constants/staticText";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams } from "expo-router";
import * as Localization from "expo-localization";
import { countryCodes } from "@/components/ui/PhoneInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const roleType = params.roleType as string | undefined;
  let headerTitle = "Create Account";
  if (roleType === "homeowner") {
    headerTitle = "Create Homeowner Account";
  } else if (roleType === "renter_investor") {
    headerTitle = "Create Renter/Investor Account";
  }
  // Remove useAuthStore
  // const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState<
    CountryCode | undefined
  >(undefined); // fix linter: use undefined
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSpaceInPassword, setHasSpaceInPassword] = useState(false);

  // Use TanStack Query mutation
  const signupMutation = useSignup();

  const isLoading =
    signupMutation.status === "pending" || signupMutation.isPending;

  const validateForm = () => {
    const { errors: newErrors, isValid } = validateRegistrationForm({
      ...formData,
      acceptedTerms,
      selectedCountryCode,
    });
    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }
    try {
      const cleanMobile = formData.mobileNumber.replace(/\D/g, "");
      const countryCode = selectedCountryCode?.phoneCode || "+1";
      
      // Determine user type based on roleType parameter
      // API only accepts "renter" or "investor" as valid user types
      let userType = ["renter"];
      if (roleType === "homeowner") {
        // For homeowners, we'll use "renter" as the user type since API doesn't accept "homeowner"
        userType = ["renter"];
      } else if (roleType === "renter_investor") {
        userType = ["renter"];
      }
      
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        countryCode: countryCode,
        mobile: cleanMobile,
        userType: userType,
      };
      console.log("[Register] Sending payload:", payload);
      const response = await signupMutation.mutateAsync(payload);
      console.log("[Register] API response:", response);
      if (response?.success) {
        // Store the token if it exists in the response
        if (response?.data?.token) {
          await AsyncStorage.setItem("token", response.data.token);
        }
        
        // Store user data for later use
        if (response?.data?.user) {
          await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));
        }
        
        toast.success("Registration successful! Please verify your email");
        // Navigate to OTP verification for email verification
        router.push({
          pathname: "/(auth)/otp-verification",
          params: {
            email: formData.email.toLowerCase().trim(),
            type: "register",
            roleType: roleType,
          },
        });
      } else {
        const errorMsg =
          response?.message || "Registration failed. Please try again.";
        toast.error(errorMsg);
        console.error("[Register] Registration error (API response):", response);
      }
    } catch (error: any) {
      const errorMsg =
        error?.message || "Registration failed. Please try again.";
      toast.error(errorMsg);
      console.error("[Register] Registration error (exception):", error);
    }
  };
  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "password") {
      const hasSpaces = /\s/.test(value);
      setHasSpaceInPassword(hasSpaces);
      if (hasSpaces) {
        setErrors((prev) => ({
          ...prev,
          password: "Password must not contain spaces",
        }));
      } else if (errors.password === "Password must not contain spaces") {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
    } else {
      // Clear error when user starts typing for other fields
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };
  const inputBox: import("react-native").ViewStyle = {};

  React.useEffect(() => {
    if (!selectedCountryCode) {
      const locales = Localization.getLocales();
      let countryCode = (locales && locales.length > 0 && locales[0].regionCode) ? locales[0].regionCode : "US";
      let found = countryCodes.find((c) => c.code === countryCode);
      if (!found) found = countryCodes.find((c) => c.code === "US");
      if (found) setSelectedCountryCode(found);
    }
  }, [selectedCountryCode]);

  return (
    <View style={styles.container}>
      <Header title={headerTitle} />
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
            onChangeText={(value) => updateFormData("firstName", value)}
            placeholder="Enter first name"
            error={errors.firstName}
            autoCapitalize="words"
            textContentType="givenName"
            containerStyle={inputBox}
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChangeText={(value) => updateFormData("lastName", value)}
            placeholder="Enter last name"
            error={errors.lastName}
            autoCapitalize="words"
            textContentType="familyName"
            containerStyle={inputBox}
          />
          <Input
            label="Email Address"
            value={formData.email}
            onChangeText={(value) => updateFormData("email", value)}
            placeholder="Enter your email"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            containerStyle={inputBox}
          />
          <PhoneInput
            label="Mobile Number"
            value={formData.mobileNumber}
            onChangeText={(value) => updateFormData("mobileNumber", value)}
            placeholder="Enter your mobile number"
            error={errors.mobileNumber}
            selectedCountry={selectedCountryCode}
            onCountryChange={setSelectedCountryCode}
          />
          <View>
            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateFormData("password", value)}
              placeholder="Create a password"
              error={errors.password}
              secureTextEntry
              showPasswordToggle
              textContentType="newPassword"
              containerStyle={inputBox}
            />
            <PasswordStrengthMeter
              password={formData.password}
              hideWhenSpaces={true}
            />
          </View>
          <Input
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData("confirmPassword", value)}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            secureTextEntry
            showPasswordToggle
            textContentType="newPassword"
            containerStyle={inputBox}
          />
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => {
                setAcceptedTerms(!acceptedTerms);
                if (errors.terms) {
                  setErrors((prev) => ({ ...prev, terms: "" }));
                }
              }}
            >
              <View
                style={[
                  styles.checkboxInner,
                  acceptedTerms && styles.checkboxChecked,
                ]}
              >
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
              <TouchableOpacity
                accessibilityRole="link"
                onPress={() => Linking.openURL("https://www.google.com/")}
              >
                <Typography variant="body" color="primary">
                  {" "}
                  Terms & Conditions{" "}
                </Typography>
              </TouchableOpacity>
              <Typography variant="body" color="secondary">
                and
              </Typography>
              <TouchableOpacity
                accessibilityRole="link"
                onPress={() => Linking.openURL("https://www.google.com/")}
              >
                <Typography variant="body" color="primary">
                  {" "}
                  Privacy Policy
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
          {errors.terms && (
            <Typography
              variant="caption"
              color="error"
              style={styles.errorText}
            >
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  checkbox: {
    marginTop: 5,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: radius.xs,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.gold,
    borderColor: colors.primary.gold,
  },
  termsTextRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
  },
  errorText: {
    marginTop: -spacing.md,
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
