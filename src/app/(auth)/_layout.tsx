import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
