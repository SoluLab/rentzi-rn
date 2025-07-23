import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { Typography } from './Typography';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

const { width } = Dimensions.get('window');

interface OTPInputProps {
  length: number;
  onOTPChange?: (otp: string) => void;
  onChange?: (otp: string) => void; // Added for backward compatibility
  error?: string;
  isLoading?: boolean;
  value?: string;
  timeLeft?: string;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length,
  onOTPChange,
  onChange,
  error,
  isLoading = false,
  value = '',
  timeLeft,
  autoFocus = false,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Support both onOTPChange and onChange for backward compatibility
  const handleOTPChange = (newOtp: string) => {
    if (onOTPChange) {
      onOTPChange(newOtp);
    }
    if (onChange) {
      onChange(newOtp);
    }
  };

  // Update local state when value prop changes
  useEffect(() => {
    if (value !== otp.join('')) {
      const newOtp = value.split('').slice(0, length);
      while (newOtp.length < length) {
        newOtp.push('');
      }
      setOtp(newOtp);
    }
  }, [value, length]);

  // Auto focus first input when component mounts
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    // Only allow numeric input
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];

    if (text.length > 1) {
      // Handle paste operation
      const pastedText = text.slice(0, length);
      for (let i = 0; i < length; i++) {
        newOtp[i] = pastedText[i] || '';
      }
      setOtp(newOtp);
      handleOTPChange(newOtp.join(''));

      // Focus on the last filled input or next empty input
      const nextIndex = Math.min(pastedText.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
    } else {
      // Handle single character input
      newOtp[index] = text;
      setOtp(newOtp);
      handleOTPChange(newOtp.join(''));

      // Move to next input if current input is filled
      if (text && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        // Clear current input
        newOtp[index] = '';
        setOtp(newOtp);
        handleOTPChange(newOtp.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        handleOTPChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const getInputStyle = (index: number) => [
    styles.input,
    focusedIndex === index && styles.inputFocused,
    error && styles.inputError,
    otp[index] && styles.inputFilled,
  ];

  // Calculate input width based on screen width and spacing
  const inputWidth = Math.min(45, (width - (spacing.lg * 2) - (spacing.xs * (length - 1))) / length);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {Array.from({ length }, (_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[getInputStyle(index), { width: inputWidth }]}
            value={otp[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
            editable={!isLoading}
            textAlign="center"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
          />
        ))}
      </View>
      {timeLeft && (
        <Typography variant="caption" color="secondary" align="center" style={styles.timeLeft}>
          Code expires in: {timeLeft}
        </Typography>
      )}
      {error && (
        <Typography variant="caption" color="error" align="center" style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  input: {
    height: 45,
    borderWidth: 2,
    borderColor: colors.border.primary,
    borderRadius: radius.md,
    backgroundColor: colors.background.secondary,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  inputFocused: {
    borderColor: colors.primary.gold,
    backgroundColor: colors.background.primary,
  },
  inputFilled: {
    borderColor: colors.primary.navy,
    backgroundColor: colors.background.primary,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  timeLeft: {
    marginTop: spacing.md,
    fontWeight: '500',
  },
  errorText: {
    marginTop: spacing.sm,
    fontWeight: '500',
  },
});