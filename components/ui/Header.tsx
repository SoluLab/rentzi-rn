import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Typography } from './Typography';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface HeaderProps {
  title?: string;
  subtitle?: string; // ✅ Add subtitle prop
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
}

export function Header({
  title,
  subtitle, // ✅ Use subtitle prop
  showBackButton = true,
  onBackPress,
  rightComponent,
  backgroundColor = colors.primary.header
}: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color={colors.neutral.white} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.centerSection}>
            {title && (
              <Typography variant="h5" color="inverse" align="left">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body" color="gold" align="left">
                {subtitle}
              </Typography>
            )}
          </View>

          <View style={styles.rightSection}>
            {rightComponent}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});