import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

function NavigationStack() {
  const { isDark, theme } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(trainer)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="plans/index" options={{ headerShown: false }} />
        <Stack.Screen name="checkout/[planId]" options={{ headerShown: false }} />
        <Stack.Screen name="invoices/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="attendance/gym-display" options={{ headerShown: false }} />
        <Stack.Screen name="attendance/live-board" options={{ headerShown: false }} />
        <Stack.Screen name="attendance/absentees" options={{ headerShown: false }} />
        <Stack.Screen name="workout/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="workout/summary" options={{ headerShown: false }} />
        <Stack.Screen name="workout/create" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[recipientId]" options={{ headerShown: false }} />
        <Stack.Screen name="videos/index" options={{ headerShown: false }} />
        <Stack.Screen name="videos/upload" options={{ headerShown: false }} />
        <Stack.Screen name="trainer/client/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="diet/index" options={{ headerShown: false }} />
        <Stack.Screen name="programs/index" options={{ headerShown: false }} />
        <Stack.Screen name="notifications/index" options={{ headerShown: false }} />
        <Stack.Screen name="classes/index" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen
          name="design-system"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <NavigationStack />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
