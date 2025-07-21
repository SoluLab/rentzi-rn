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
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 10,
  step = 1,
  label,
  disabled = false,
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
    <View style={styles.container}>
      {label && (
        <Typography variant="caption" color="secondary" style={styles.label}>
          {label}
        </Typography>
      )}
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          onPress={handleDecrease}
          disabled={!canDecrease}
          style={[
            styles.button,
            styles.decreaseButton,
            !canDecrease && styles.disabledButton,
          ]}
        >
          <Minus 
            size={16} 
            color={canDecrease ? colors.primary.gold : colors.text.disabled} 
          />
        </TouchableOpacity>
        
        <View style={styles.valueContainer}>
          <Typography variant="h4" color="primary">
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
          ]}
        >
          <Plus 
            size={16} 
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
  
  label: {
    marginBottom: spacing.xs,
  },
  
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  
  button: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral.lightGray,
  },
  
  decreaseButton: {
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});