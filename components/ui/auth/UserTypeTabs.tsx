import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "@/components/ui/Typography";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { type UserType } from "@/types/auth";

interface UserTypeTabsProps {
  selectedUserType: UserType;
  onUserTypeChange: (type: UserType) => void;
}

export const UserTypeTabs: React.FC<UserTypeTabsProps> = ({
  selectedUserType,
  onUserTypeChange,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedUserType === "renter_investor" && styles.activeTabButton,
        ]}
        onPress={() => onUserTypeChange("renter_investor")}
      >
        <Ionicons
          name="person-outline"
          size={20}
          color={
            selectedUserType === "renter_investor"
              ? colors.neutral.white
              : colors.text.secondary
          }
        />
        <Typography
          variant="body"
          color={
            selectedUserType === "renter_investor" ? "white" : "secondary"
          }
          style={styles.tabText}
        >
          Renter/Investor
        </Typography>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          selectedUserType === "homeowner" && styles.activeTabButton,
        ]}
        onPress={() => onUserTypeChange("homeowner")}
      >
        <Ionicons
          name="home-outline"
          size={20}
          color={
            selectedUserType === "homeowner"
              ? colors.neutral.white
              : colors.text.secondary
          }
        />
        <Typography
          variant="body"
          color={
            selectedUserType === "homeowner" ? "white" : "secondary"
          }
          style={styles.tabText}
        >
          Homeowner
        </Typography>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    borderRadius: 100,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.md,
    shadowColor: colors.text.primary,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 100,
  },
  activeTabButton: {
    backgroundColor: colors.primary.gold,
  },
  tabText: {
    fontWeight: "600",
  },
}); 