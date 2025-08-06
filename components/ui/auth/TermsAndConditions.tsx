import React from "react";
import { View, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Typography } from "@/components/ui/Typography";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";

interface TermsAndConditionsProps {
  acceptedTerms: boolean;
  onTermsChange: (accepted: boolean) => void;
  error?: string;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  acceptedTerms,
  onTermsChange,
  error,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onTermsChange(!acceptedTerms)}
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
      
      {error && (
        <Typography variant="caption" color="error" style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
}); 