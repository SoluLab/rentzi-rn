import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { shadow } from "@/constants/shadow";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  variant?: "default" | "elevated" | "outlined";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = "md",
  variant = "default",
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    { padding: spacing[padding] },
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.card,
    borderRadius: radius.card,
  },
  
  default: {
    ...shadow.small,
  },
  
  elevated: {
    ...shadow.medium,
  },
  
  outlined: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
});