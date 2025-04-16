import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { ConvexProvider } from 'convex/react';
import { Platform } from 'react-native';
import { convex } from '../convex/react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { UserProvider } from '@/context/UserContext';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notification handling for physical devices only
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: Device.isDevice, // Only show alerts on physical devices
    shouldPlaySound: Device.isDevice,
    shouldSetBadge: Device.isDevice,
  }),
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    RobotoBold: require('../assets/fonts/Roboto-Bold.ttf'),
    RobotoRegular: require('../assets/fonts/Roboto-Regular.ttf'),
    RobotoSemiBold: require('../assets/fonts/Roboto-SemiBold.ttf'),
  });

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Only initialize notifications on physical devices
    if (Device.isDevice) {
      if (Platform.OS === 'android') {
        // Initialize notification channel (no need to store channels in state)
        Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        // Handle notification silently
        console.log('Notification received:', notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
      });
    }

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ConvexProvider client={convex}>
      <UserProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Chat Rooms',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="create-chat"
            options={{
              title: 'Create Chat Room',
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="chat/[id]"
            options={({ route }) => ({
              title: (route.params as { name?: string })?.name || 'Chat',
            })}
          />
          <Stack.Screen
            name="scan-qr"
            options={{
              title: 'Scan QR Code',
              headerShown: false,
              presentation: 'fullScreenModal',
            }}
          />
        </Stack>
      </UserProvider>
    </ConvexProvider>
  );
}
