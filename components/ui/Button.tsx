import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { shadow } from '@/constants/shadow';
import { typography } from '@/constants/typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'smMedium' | 'medium' | 'large'; // ✅ Updated here
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#CFAB33', '#69571A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            styles.primary,
            styles.gradientContainer,
            styles[size],
            disabled && styles.disabled,
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.neutral.white} size="small" />
          ) : (
            <Text style={textStyles}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'secondary'
              ? colors.neutral.white
              : colors.primary.gold
          }
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadow.small,
  },
  // Button Variants
  primary: {
    shadowColor: '#CFAB33',
    shadowOpacity: 0.3,
    elevation: 4,
  },
  gradientContainer: {
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondary: {
    backgroundColor: colors.primary.blue,
    shadowColor: colors.primary.blue,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.gold,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },

  // ✅ Button Sizes
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  smMedium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 45,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 56,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
    backgroundColor: colors.interactive.disabled,
  },

  // Text styles
  baseText: {
    fontFamily: typography.fontFamily.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: colors.neutral.white,
    fontSize: 16,
  },
  secondaryText: {
    color: colors.neutral.white,
    fontSize: 16,
  },
  outlineText: {
    color: colors.primary.gold,
    fontSize: 16,
  },
  ghostText: {
    color: colors.primary.gold,
    fontSize: 16,
  },

  // ✅ Text Size Styles
  smallText: {
    fontSize: 14,
  },
  smMediumText: {
    fontSize: 15,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  disabledText: {
    opacity: 0.7,
  },
});