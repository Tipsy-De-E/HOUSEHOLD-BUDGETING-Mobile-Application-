// src/app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  // Preload Ionicons font once at root level to prevent any runtime asset downloads
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    </ThemeProvider>
  );
}
