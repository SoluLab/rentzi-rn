import * as React from 'react';
import { Platform } from 'react-native';
import { Toaster as WebToaster, toast as webToast } from 'sonner';
import { Toaster as NativeToaster, toast as nativeToast } from 'sonner-native';

// Create a simplified toast component that handles both platforms
export const Toast: React.FC = () => {
    const isWeb = Platform.OS === 'web';

    return isWeb
        ? <WebToaster />
        : <NativeToaster />
};

export const Toaster = () => {
    return <Toast />
}
// Export a unified toast API
export const toast = {
    // Basic toast
    show: (message: string, options?: any) => {
        if (Platform.OS === 'web') {
            return webToast(message, options);
        } else {
            return nativeToast(message, options);
        }
    },

    // Success toast
    success: (message: string, options?: any) => {
        if (Platform.OS === 'web') {
            return webToast.success(message, options);
        } else {
            return nativeToast.success(message, options);
        }
    },

    // Error toast
    error: (message: string, options?: any) => {
        if (Platform.OS === 'web') {
            return webToast.error(message, options);
        } else {
            return nativeToast.error(message, options);
        }
    },

    // Info toast (may not be available in both libraries)
    info: (message: string, options?: any) => {
        if (Platform.OS === 'web') {
            return webToast.info ? webToast.info(message, options) : webToast(message, options);
        } else {
            return nativeToast.info ? nativeToast.info(message, options) : nativeToast(message, options);
        }
    },

    // Warning toast (may not be available in both libraries)
    warning: (message: string, options?: any) => {
        if (Platform.OS === 'web') {
            return webToast.warning ? webToast.warning(message, options) : webToast(message, options);
        } else {
            return nativeToast.warning ? nativeToast.warning(message, options) : nativeToast(message, options);
        }
    },

    // Dismiss toast
    dismiss: (id?: string) => {
        if (Platform.OS === 'web') {
            return webToast.dismiss(id);
        } else {
            return nativeToast.dismiss(id);
        }
    },

    // Promise toast with fallback to manual handling if needed
    promise: <T,>(
        promiseInput: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: unknown) => string);
        }
    ): Promise<T> => {
        const { loading, success, error } = messages;

        if (Platform.OS === 'web') {
            try {
                // Manually show loading state
                webToast.loading(loading);

                // Handle promise resolution/rejection ourselves to avoid type issues
                promiseInput
                    .then((data) => {
                        const successMsg = typeof success === 'function'
                            ? success(data)
                            : success;
                        webToast.success(successMsg);
                    })
                    .catch((err) => {
                        const errorMsg = typeof error === 'function'
                            ? error(err)
                            : error;
                        webToast.error(errorMsg);
                    });
            } catch (e) {
                // Fallback if the direct method fails
                webToast(loading);
            }
        } else {
            try {
                // For native, manually handle the toast states
                nativeToast.loading(loading);

                // Handle promise resolution/rejection ourselves
                promiseInput
                    .then((data) => {
                        const successMsg = typeof success === 'function'
                            ? success(data)
                            : success;
                        nativeToast.success(successMsg);
                    })
                    .catch((err) => {
                        const errorMsg = typeof error === 'function'
                            ? error(err)
                            : error;
                        nativeToast.error(errorMsg);
                    });
            } catch (e) {
                // Fallback if direct method fails
                nativeToast(loading);
            }
        }

        // Always return the original promise
        return promiseInput;
    }
};