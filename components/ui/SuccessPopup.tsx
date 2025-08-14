import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { Check, Mail, Phone, Bell, ArrowRight } from 'lucide-react-native';

interface SuccessPopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function SuccessPopup({
  visible,
  onClose,
  title,
  message,
  buttonText = 'OK',
}: SuccessPopupProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start animations
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate checkmark after a short delay
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(checkmarkScaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(checkmarkOpacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      checkmarkScaleAnim.setValue(0);
      checkmarkOpacityAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.checkmarkContainer,
                {
                  opacity: checkmarkOpacityAnim,
                  transform: [{ scale: checkmarkScaleAnim }],
                },
              ]}
            >
              <Check size={40} color={colors.neutral.white} />
            </Animated.View>
          </View>

          {/* Title */}
          <Typography variant="h4" style={styles.title}>
            {title}
          </Typography>

          {/* Message */}
          <Typography variant="body" color="secondary" style={styles.message}>
            {message}
          </Typography>

          {/* Notification Icons */}
          <View style={styles.notificationIcons}>
            <View style={styles.notificationItem}>
              <View style={styles.iconWrapper}>
                <Mail size={20} color={colors.primary.gold} />
              </View>
              <Typography variant="caption" color="secondary">
                Email
              </Typography>
            </View>
            <View style={styles.notificationItem}>
              <View style={styles.iconWrapper}>
                <Phone size={20} color={colors.primary.gold} />
              </View>
              <Typography variant="caption" color="secondary">
                SMS
              </Typography>
            </View>
            <View style={styles.notificationItem}>
              <View style={styles.iconWrapper}>
                <Bell size={20} color={colors.primary.gold} />
              </View>
              <Typography variant="caption" color="secondary">
                In-App
              </Typography>
            </View>
          </View>

          {/* Button */}
          <Button
            title={buttonText}
            onPress={handleClose}
            style={styles.button}
            leftIcon={<ArrowRight size={20} color={colors.neutral.white} />}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: screenWidth - spacing.lg * 2,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.status.success,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  notificationIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  notificationItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
}); 