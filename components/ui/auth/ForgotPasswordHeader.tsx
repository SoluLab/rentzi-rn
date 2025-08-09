import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/Typography";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export const ForgotPasswordHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <Typography
        variant="h4"
        color="primary"
        align="center"
        style={styles.title}
      >
        Reset Password
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    lineHeight: 20,
  },
}); 