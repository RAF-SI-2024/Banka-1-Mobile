import React, { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// Prikaži notifikacije i u foreground-u
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function NotificationHandler() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // 1) Registracija za push i dobijanje tokena
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log('Expo push token:', token);
        sendTokenToBackend(token);
      }
    });

    // 2) Foreground notifikacije
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as { otpCode?: string };
      if (data.otpCode) {
        Alert.alert('Stigao OTP kod', data.otpCode);
      }
    });

    // 3) Taps na notifikacije
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as { otpCode?: string };
      if (data.otpCode) {
        Alert.alert('Klik na notifikaciju', data.otpCode);
      }
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return null;
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Constants.isDevice) {
    Alert.alert('Morate na pravom uređaju za testiranje notifikacija');
    return null;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Alert.alert('Dozvola odbijena!', 'Ne možemo da šaljemo notifikacije.');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  return token;
}

async function sendTokenToBackend(token: string) {
  const jwt = await SecureStore.getItemAsync('userJwtToken');
  if (!jwt) {
    console.error('JWT nije pronađen u SecureStore');
    return;
  }
  try {
    const res = await fetch('https://your-backend.com/add-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ deviceToken: token }),
    });
    console.log('Token registrovan, status:', res.status);
  } catch (err) {
    console.error('Greška pri registraciji tokena:', err);
  }
}
