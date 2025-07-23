import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_NOTIFICATION_TOKEN_KEY = 'deviceNotificationToken';

export async function registerForPushNotificationsAsync(): Promise<void> {
  let token: string | null = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      // Permission not granted
      return;
    }
    const expoPushToken = await Notifications.getExpoPushTokenAsync();
    token = expoPushToken.data;
    if (token) {
      await AsyncStorage.setItem(DEVICE_NOTIFICATION_TOKEN_KEY, token);
    }
  } else {
    // Not a physical device
    return;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

export async function getDeviceNotificationToken(): Promise<string | null> {
  return AsyncStorage.getItem(DEVICE_NOTIFICATION_TOKEN_KEY);
}
