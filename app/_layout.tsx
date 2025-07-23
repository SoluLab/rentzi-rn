import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { Toaster } from '@/components/ui/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import { QueryProvider } from '@/providers/QueryProvider';

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
            <QueryProvider>
            <SafeAreaProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                        name="+not-found"
                        options={{ headerShown: false }}
                    />
                </Stack >
            </SafeAreaProvider>
            </QueryProvider>
        </GestureHandlerRootView>
    );
}
