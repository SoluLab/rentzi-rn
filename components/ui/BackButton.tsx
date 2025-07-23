import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
interface BackButtonProps {
  onPress?: () => void;
  style?: any;
  iconColor?: string;
  backgroundColor?: string;
}
export function BackButton({
  onPress,
  style,
  iconColor = colors.neutral.white,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
}: BackButtonProps) {
  const router = useRouter();
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };
  return (
    <TouchableOpacity
      style={[styles.backButton, { backgroundColor }, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color={iconColor} />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});