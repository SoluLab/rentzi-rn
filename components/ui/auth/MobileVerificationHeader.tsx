import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

interface MobileVerificationHeaderProps {
  phone: string;
}

export const MobileVerificationHeader: React.FC<MobileVerificationHeaderProps> = ({
  phone,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="call-outline"
          size={48}
          color={colors.primary.gold}
        />
      </View>
      
      <Typography variant="h4" color="primary" align="center">
        Verify Mobile Number
      </Typography>
      
      <Typography variant="body2" color="secondary" align="center">
        We've sent a 6-digit verification code to{"\n"}
        <Typography variant="body2" color="secondary" align="center">
          {phone}
        </Typography>
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
}); 