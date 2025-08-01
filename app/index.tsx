import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, Image, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Typography } from '@/components/ui/Typography';
 
import { spacing } from '@/constants/spacing';
import { useAuthStore } from '@/stores/authStore';
 
export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [hasNavigated, setHasNavigated] = useState(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  useEffect(() => {
    // Start animations
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.2)),
    });
    titleOpacity.value = withDelay(
      400,
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      })
    );
    titleTranslateY.value = withDelay(
      400,
      withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      })
    );
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    // Set navigation timeout with guard
    navigationTimeoutRef.current = setTimeout(() => {
      if (!hasNavigated) {
        setHasNavigated(true);
        try {
          // Temporarily skip authentication and go directly to homeowner section
         // router.replace('/(homeowner-tabs)');
          // Original logic (commented out for now):
          if (isAuthenticated) {
              //router.replace('/(tabs)');
              router.replace('/(homeowner-tabs)');
           } else {
            //router.replace('/(auth)/login');
            router.replace('/(homeowner-tabs)');
          }
        } catch (error) {
          console.error('Navigation error:', error);
          // Fallback navigation
          router.replace('/(homeowner-tabs)');
        }
      }
    }, 2500);
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []); // Remove isAuthenticated and router from dependencies to prevent infinite loop
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: logoScale.value }],
    };
  });
  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    };
  });
  return (
    <LinearGradient
      colors={['#0E2538', '#28679E']}
      useAngle={true}
      angle={45}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Animated.View style={logoAnimatedStyle}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="cover"
              />
            </Animated.View>
            <Animated.View style={titleAnimatedStyle}>
              <Typography variant="h1" color="white" align="center" style={styles.title}>
                Rentzi
              </Typography>
              <Typography variant="body" color="gold" align="center" style={styles.subtitle}>
                Welcome to Luxury Living
              </Typography>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.layout.screenPadding,
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
 
  },
  title: {
    fontSize: 32,
    fontWeight: '700', 
  },
  subtitle: {
  
    fontSize: 16,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    opacity: 0.7,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});