import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { Typography } from './Typography';

interface OTPInputProps {
  length?: number;
  onOTPChange: (otp: string) => void;
  error?: string;
  isLoading?: boolean;
  value?: string;
  timeLeft?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onOTPChange,
  error,
  isLoading = false,
  value = '',
}) => {
  const [otp, setOTP] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);

  // Update OTP when value prop changes
  useEffect(() => {
    if (value) {
      const newOTP = value.split('').concat(new Array(Math.max(0, length - value.length)).fill(''));
      setOTP(newOTP);
    } else {
      setOTP(new Array(length).fill(''));
    }
  }, [value, length]);

  const handleChange = useCallback((inputValue: string, index: number) => {
    const newOTP = [...otp];
    newOTP[index] = inputValue;
    setOTP(newOTP);
    
    // Safely call onOTPChange if it exists and is a function
    if (onOTPChange && typeof onOTPChange === 'function') {
      onOTPChange(newOTP.join(''));
    }
    
    // Auto-focus next input
    if (inputValue && index < length - 1) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }, 0);
    }
  }, [otp, onOTPChange, length]);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }, 0);
    }
  }, [otp]);

  const handleFocus = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleBlur = useCallback(() => {
    setActiveIndex(-1);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={`otp-input-${index}`}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={[
              styles.input,
              activeIndex === index && styles.activeInput,
              error && styles.errorInput,
            ]}
            value={digit}
            onChangeText={(inputValue) => handleChange(inputValue.slice(-1), index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
            editable={!isLoading}
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
          />
        ))}
      </View>
      {error && (
        <Typography variant="caption" color="error" style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  input: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: radius.input,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    backgroundColor: colors.neutral.white,
  },
  activeInput: {
    borderColor: colors.primary.gold,
    borderWidth: 2,
  },
  errorInput: {
    borderColor: colors.status.error,
  },
  errorText: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});