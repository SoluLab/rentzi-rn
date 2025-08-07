import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/Typography";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useAuthStore } from "@/stores/authStore";

interface MobileVerificationHeaderProps {
  phone: string;
  code: string;
}

export const MobileVerificationHeader: React.FC<MobileVerificationHeaderProps> = ({
  phone, code
}) => {
  const { user } = useAuthStore();

  // Format the phone number properly
  const formatPhoneNumber = () => {
    // If phone already includes country code, use as is
    if (phone && phone.startsWith("+")) {
      return phone;
    }
    
    // If we have both code and phone from register screen, combine them
    if (code && phone) {
      const countryCode = code.startsWith("+") ? code : `+${code}`;
      return `${countryCode} ${phone}`;
    }
    
    // If we have a user with a phone number, try to use that
    if (user?.profileDetails?.phone) {
      const userPhone = user.profileDetails.phone;
      if (userPhone.startsWith("+")) {
        return userPhone;
      }
      // If user phone doesn't have country code and we have code from register
      if (code) {
        const countryCode = code.startsWith("+") ? code : `+${code}`;
        return `${countryCode} ${userPhone}`;
      }
      return userPhone;
    }
    
    // If only phone is available (fallback)
    if (phone) {
      return phone;
    }
    
    // If only code is available (fallback)
    if (code) {
      const countryCode = code.startsWith("+") ? code : `+${code}`;
      return `${countryCode} [phone number]`;
    }
    
    return "your mobile number";
  };

  const formattedPhone = formatPhoneNumber();

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
        {`We've sent a 6-digit verification code to\n${formattedPhone}`}
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