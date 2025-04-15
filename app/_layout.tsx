import React, { useEffect, useState, useRef } from "react";
import { Stack } from "expo-router";
import { ConvexProvider } from "convex/react";
import { Platform } from "react-native";
import { convex } from "../convex/react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { UserProvider } from "@/context/UserContext";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "@/components/Notifications";
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    []
  );

  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token)
    );

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? [])
      );
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    // Hide splash screen after a short delay
    const hideSplash = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await SplashScreen.hideAsync();
    };

    hideSplash();
  }, []);

  return (
    <ConvexProvider client={convex}>
      <UserProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown:false
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Chat Rooms",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="create-chat"
            options={{
              title: "Create Chat Room",
              headerShown: false, // We're using our own back button
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="chat/[id]"
            options={({ route }) => ({
              title: (route.params as { name?: string })?.name || "Chat",
            })}
          />
          <Stack.Screen
            name="scan-qr"
            options={{
              title: "Scan QR Code",
              headerShown: false,
              presentation: "fullScreenModal",
            }}
          />
        </Stack>
      </UserProvider>
    </ConvexProvider>
  );
}
