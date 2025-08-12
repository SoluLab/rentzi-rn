import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Typography } from "./Typography";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { radius } from "@/constants/radius";
import { Minus, Plus } from "lucide-react-native";

interface StepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  compact?: boolean; // Add this
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 10,
  step = 1,
  label,
  disabled = false,
  compact = false, // Add this
}) => {
  const handleDecrease = () => {
    if (!disabled && value > min) {
      onValueChange(Math.max(min, value - step));
    }
  };

  const handleIncrease = () => {
    if (!disabled && value < max) {
      onValueChange(Math.min(max, value + step));
    }
  };

  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {label && (
        <Typography variant="caption" color="secondary" style={[styles.label, compact && styles.compactLabel]}>
          {label}
        </Typography>
      )}
      <View style={[styles.stepperContainer, compact && styles.compactStepperContainer]}>
        <TouchableOpacity
          onPress={handleDecrease}
          disabled={!canDecrease}
          style={[
            styles.button,
            styles.decreaseButton,
            !canDecrease && styles.disabledButton,
            compact && styles.compactButton,
          ]}
        >
          <Minus 
            size={compact ? 12 : 16} 
            color={canDecrease ? colors.primary.gold : colors.text.disabled} 
          />
        </TouchableOpacity>
        <View style={[styles.valueContainer, compact && styles.compactValueContainer]}>
          <Typography variant={compact ? "body" : "h4"} color="primary">
            {value}
          </Typography>
        </View>
        <TouchableOpacity
          onPress={handleIncrease}
          disabled={!canIncrease}
          style={[
            styles.button,
            styles.increaseButton,
            !canIncrease && styles.disabledButton,
            compact && styles.compactButton,
          ]}
        >
          <Plus 
            size={compact ? 12 : 16} 
            color={canIncrease ? colors.primary.gold : colors.text.disabled} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  compactContainer: {
    padding: 0,
    margin: 0,
  },
  label: {
    marginBottom: spacing.xs,
  },
  compactLabel: {
    marginBottom: 0,
    fontSize: 10,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  compactStepperContainer: {
    gap: 2,
    minWidth: 0,
  },
  button: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral.lightGray,
  },
  compactButton: {
    padding: 1,
    minWidth: 40,
    minHeight: 20,
  },
  decreaseButton: {
    borderTopLeftRadius: 0,//radius.md,
    borderBottomLeftRadius: 0,//radius.md,
  },
  
  increaseButton: {
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
  },
  
  disabledButton: {
    backgroundColor: colors.neutral.lightGray,
    opacity: 0.5,
  },
  
  valueContainer: {
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,//spacing.md,
    paddingVertical: 0,//spacing.sm,
  },
  compactValueContainer: {
    minWidth: 18,
  },
});