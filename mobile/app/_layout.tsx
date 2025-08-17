import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { requestNotificationPermissions } from '../utils/notificationUtils';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

function RootStack() {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    // You can return a splash/loading component here if you want
    return null;
  }

  return (
    <Stack>
      {userToken ? (
        // User is logged in, show main app tabs
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // User not logged in, show auth screens
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootStack />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
