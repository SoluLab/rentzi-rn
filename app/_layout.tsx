import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, Platform, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { Toaster } from '@/components/ui/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import { QueryProvider } from '@/providers/QueryProvider';
import { WalletConnectProvider } from '@/providers/WalletConnectProvider';
import { WalletConnectModal } from '@walletconnect/modal-react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded] = useFonts({
        Montserrat: require('../assets/fonts/Montserrat-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Toaster />
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <QueryProvider>
                <WalletConnectProvider>
                    <SafeAreaProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen
                                name="+not-found"
                                options={{ headerShown: false }}
                            />
                        </Stack>
                        <WalletConnectModal 
                            projectId="77aa612b54c486a8859edcc7bba0663c" 
                            providerMetadata={{
                                name: 'Rentzi',
                                description: 'Rentzi Wallet Connection',
                                url: 'https://rentzi.com',
                                icons: ['https://rentzi.com/logo.png'],
                                redirect: {
                                    native: 'rentzi://',
                                    universal: 'https://rentzi.com'
                                }
                            }}
                        />
                    </SafeAreaProvider>
                </WalletConnectProvider>
            </QueryProvider>
        </GestureHandlerRootView>
    );
}
