import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
interface TypographyProps {
  children: React.ReactNode;
  variant?: keyof typeof typography.variants;
  color?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'inverse'
    | 'gold'
    | 'navy'
    | 'error'
    | 'success'
    | 'warning'
    | 'info'
    | 'muted';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: keyof typeof typography.fontWeight;
  style?: TextStyle;
  numberOfLines?: number;
  onPress?: () => void;
}
export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  style,
  numberOfLines,
  onPress,
}) => {
  const getVariantStyle = (): TextStyle => {
    const variantConfig = typography.variants[variant] || typography.variants.body;
    return {
      fontSize: variantConfig.fontSize,
      fontWeight: weight || variantConfig.fontWeight,
      lineHeight: variantConfig.lineHeight * variantConfig.fontSize,
      letterSpacing: variantConfig.letterSpacing,
      ...(variantConfig.textTransform && { textTransform: variantConfig.textTransform }),
    };
  };
  const getColorStyle = (): TextStyle => {
    switch (color) {
      case 'primary':
        return { color: colors.text.primary };
      case 'secondary':
        return { color: colors.text.secondary };
      case 'tertiary':
        return { color: colors.text.tertiary };
      case 'inverse':
        return { color: colors.text.inverse };
      case 'gold':
        return { color: colors.text.gold };
      case 'white':
        return { color: colors.neutral.white };
      case 'navy':
        return { color: colors.text.navy };
      case 'muted':
        return { color: colors.text.muted };
      case 'error':
        return { color: colors.status.error };
      case 'success':
        return { color: colors.status.success };
      case 'warning':
        return { color: colors.status.warning };
      case 'info':
        return { color: colors.status.info };
      default:
        return { color: colors.text.primary };
    }
  };
  const getAlignStyle = (): TextStyle => {
    return { textAlign: align };
  };
  const combinedStyle: TextStyle = {
    ...styles.base,
    ...getVariantStyle(),
    ...getColorStyle(),
    ...getAlignStyle(),
    ...style,
  };
  return (
    <Text style={combinedStyle} numberOfLines={numberOfLines} onPress={onPress}>
      {children}
    </Text>
  );
};
const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily.primary,
  },
});