import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/Typography";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

interface ForgotPasswordOTPHeaderProps {
  email: string;
}

export const ForgotPasswordOTPHeader: React.FC<ForgotPasswordOTPHeaderProps> = ({
  email,
}) => {
  return (
    <View style={styles.container}>
      <Typography
        variant="h4"
        color="primary"
        align="center"
        style={styles.title}
      >
        Enter Verification Code
      </Typography>
      
      <Typography
        variant="body"
        color="secondary"
        align="center"
        style={styles.subtitle}
      >
        We've sent a 6-digit code to {email}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.md,
  },
}); 