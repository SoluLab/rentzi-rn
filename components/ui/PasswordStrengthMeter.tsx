import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { colors, spacing, radius } from '@/constants';
interface PasswordStrengthMeterProps {
  password: string;
  hideWhenSpaces?: boolean;
}
export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  hideWhenSpaces = false,
}) => {
  const calculateStrength = (password: string) => {
    if (!password) return { score: 0, strength: 'weak' };
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    };
    // Count how many requirements are met
    Object.values(checks).forEach((check) => {
      if (check) score++;
    });
    // Determine strength level
    if (score < 3) return { score, strength: 'weak' };
    if (score < 5) return { score, strength: 'medium' };
    return { score, strength: 'strong' };
  };
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return '#FF4444'; // Red
      case 'medium':
        return '#FFB800'; // Yellow/Orange
      case 'strong':
        return '#00C851'; // Green
      default:
        return colors.border.light;
    }
  };
  const getStrengthWidth = (score: number) => {
    return `${(score / 5) * 100}%`;
  };
  const { score, strength } = calculateStrength(password);
  const strengthColor = getStrengthColor(strength);
  const strengthWidth = getStrengthWidth(score);
  if (!password) return null;
  // Hide meter if password contains spaces and hideWhenSpaces is true
  if (hideWhenSpaces && /\s/.test(password)) return null;
  return (
    <View style={styles.container}>
      <View style={styles.meterContainer}>
        <View style={styles.meterBackground}>
          <View
            style={[
              styles.meterFill,
              {
                backgroundColor: strengthColor,
                width: strengthWidth,
              },
            ]}
          />
        </View>
      </View>
      <Typography variant="caption" color="secondary" style={styles.helpText}>
        Use 8 or more characters with a mix of letters, numbers & symbols.
      </Typography>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
  },
  meterContainer: {
    marginBottom: spacing.xs,
  },
  meterBackground: {
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: radius.xs,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: radius.xs,
    transition: 'width 0.3s ease',
  },
  helpText: {
    fontSize: 12,
    lineHeight: 16,
  },
});