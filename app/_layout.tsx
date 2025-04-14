// app/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { ConvexProvider } from "convex/react";
import { convex } from "../convex/react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { UserProvider } from "@/context/UserContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
            headerStyle: {
              backgroundColor: "#fff",
            },
            headerTintColor: "#2196F3",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            contentStyle: {
              backgroundColor: "#fff",
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Chat Rooms",
              headerShown: true,
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
              headerShown: false, // We're using our own header in the scanner
              presentation: "fullScreenModal",
            }}
          />
        </Stack>
      </UserProvider>
    </ConvexProvider>
  );
}
