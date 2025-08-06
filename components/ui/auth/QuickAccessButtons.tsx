import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { spacing } from "@/constants/spacing";

interface QuickAccessButtonsProps {
  onQuickAccess: (role: string) => void;
}

export const QuickAccessButtons: React.FC<QuickAccessButtonsProps> = ({
  onQuickAccess,
}) => {
  return (
    <View style={styles.container}>
      <Typography
        variant="body2"
        color="secondary"
        align="center"
        style={styles.title}
      >
        Quick Access
      </Typography>
      <View style={styles.buttonContainer}>
        <Button
          title="Renter"
          variant="outline"
          size="small"
          style={styles.button}
          onPress={() => onQuickAccess("renter")}
        />
        <Button
          title="Investor"
          variant="outline"
          size="small"
          style={styles.button}
          onPress={() => onQuickAccess("investor")}
        />
        <Button
          title="Homeowner"
          variant="outline"
          size="small"
          style={styles.button}
          onPress={() => onQuickAccess("homeowner")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  button: {
    minWidth: 90,
  },
}); 