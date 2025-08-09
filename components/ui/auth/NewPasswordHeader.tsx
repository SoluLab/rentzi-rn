import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/Typography";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export const NewPasswordHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <Typography
        variant="h3"
        color="primary"
        align="center"
        style={styles.title}
      >
        Set New Password
      </Typography>
      
      <Typography
        variant="body"
        color="secondary"
        align="center"
        style={styles.description}
      >
        Your new password must be different from your previous password.
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