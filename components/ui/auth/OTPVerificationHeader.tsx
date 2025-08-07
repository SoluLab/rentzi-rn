import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

interface OTPVerificationHeaderProps {
  email: string;
  phone?: string;
}

export const OTPVerificationHeader: React.FC<OTPVerificationHeaderProps> = ({
  email,
  phone,
}) => {
  const getContactInfo = () => {
    if (phone) {
      try {
        const phoneObj = JSON.parse(phone);
        return `${phoneObj.countryCode} ${phoneObj.mobile}`;
      } catch {
        return phone;
      }
    }
    return email;
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="call-outline"
          size={48}
          color={colors.primary.gold}
        />
      </View>
      
      <Typography variant="h4" style={styles.title}>
        Enter Verification Code
      </Typography>

      <Typography variant="body" style={styles.subtitle}>
        We've sent a 6-digit code to {getContactInfo()}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: spacing.xl,
    color: colors.text.secondary,
  },
}); 