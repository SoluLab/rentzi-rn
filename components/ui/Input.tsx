import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radius } from '@/constants/radius';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    variant?: 'default' | 'outlined' | 'filled';
    showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    variant = 'outlined',
    style,
    showPasswordToggle = false,
    secureTextEntry,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const inputStyles = [
        styles.base,
        styles[variant],
        isFocused && styles.focused,
        error && styles.error,
        showPasswordToggle && styles.withIcon,
        style,
    ];

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const shouldSecureText = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={inputStyles}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor={colors.text.secondary}
                    secureTextEntry={shouldSecureText}
                    {...props}
                />
                {showPasswordToggle && (
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={togglePasswordVisibility}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color={colors.text.secondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        position: 'relative',
    },
    base: {
        fontSize: 16,
        color: colors.text.primary,
        borderRadius: radius.input,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        minHeight: 48,
    },
    withIcon: {
        paddingRight: 48,
    },
    default: {
        backgroundColor: colors.neutral.lightGray,
        borderWidth: 0,
    },
    outlined: {
        backgroundColor: colors.neutral.white,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    filled: {
        backgroundColor: colors.neutral.lightGray,
        borderWidth: 0,
    },
    focused: {
        borderColor: colors.primary.gold,
        borderWidth: 2,
    },
    error: {
        borderColor: colors.status.error,
        borderWidth: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: spacing.md,
        top: '50%',
        transform: [{ translateY: -12 }], // half of height (24px)
        justifyContent: 'center',
        alignItems: 'center',
        width: 24,
        height: 24,
    },
    errorText: {
        fontSize: 14,
        color: colors.status.error,
        marginTop: spacing.xs,
    },
});