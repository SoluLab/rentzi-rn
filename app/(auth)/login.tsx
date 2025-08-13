import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { UserTypeTabs, QuickAccessButtons } from "@/components/ui/auth";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useLoginForm } from "@/hooks/useLoginForm";
import { useFocusEffect } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import type { CountryCode } from "@/types/auth";

export default function LoginScreen() {
  const router = useRouter();
  const {
    formData,
    userType,
    errors,
    isLoading,
    updateField,
    setUserType,
    handleLogin,
    quickAccessLogin,
  } = useLoginForm();

  const [isPhoneMode, setIsPhoneMode] = React.useState(false);
  const [phoneCountry, setPhoneCountry] = React.useState<CountryCode | undefined>(undefined);
  const [phoneNumber, setPhoneNumber] = React.useState("");

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
    router.push({ 
      pathname: '/(auth)/forgot-password', 
      params: { roleType: userType } 
    });
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
              <Typography variant="h4" color="white" align="center" weight="bold">
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

                <UserTypeTabs
                  selectedUserType={userType}
                  onUserTypeChange={setUserType}
                />

                {!isPhoneMode ? (
                  <Input
                    label="Email ID"
                    value={formData.identifier}
                    onChangeText={(value) => updateField("identifier", value)}
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.identifier}
                  />
                ) : (
                  <PhoneInput
                    label="Mobile Number"
                    value={phoneNumber}
                    onChangeText={(value) => {
                      setPhoneNumber(value);
                      const code = phoneCountry?.phoneCode || "";
                      updateField(
                        "identifier",
                        JSON.stringify({ countryCode: code, mobile: value })
                      );
                    }}
                    placeholder="Enter your mobile number"
                    error={errors.identifier}
                    selectedCountry={phoneCountry}
                    onCountryChange={(country) => {
                      setPhoneCountry(country);
                      if (phoneNumber) {
                        updateField(
                          "identifier",
                          JSON.stringify({ countryCode: country.phoneCode, mobile: phoneNumber })
                        );
                      }
                    }}
                  />
                )}

                <Input
                  label="Password"
                  value={formData.password}
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

                <View style={[styles.divider, { justifyContent: "center" }]}>
                  <Typography
                    variant="body"
                    color="primary"
                    style={StyleSheet.flatten([styles.dividerText, styles.linkText])}
                    onPress={() => setIsPhoneMode((prev) => !prev)}
                  >
                    {isPhoneMode ? "SignIn with Email ID" : "SignIn with Mobile Number"}
                  </Typography>
                </View>

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

                {/* <QuickAccessButtons onQuickAccess={quickAccessLogin} /> */}
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
  linkText: {
    color: colors.primary.blue,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  buttonSection: {
    paddingHorizontal: spacing.md,
  },
});
