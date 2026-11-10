import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../theme/ThemeContext';

export default function IndexScreen() {
  const { isAuthenticated, role } = useAuthStore();
  const { theme } = useTheme();

  useEffect(() => {
    // Quick routing based on auth state and role
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (role === 'admin') {
        router.replace('/(admin)');
      } else if (role === 'trainer') {
        router.replace('/(trainer)');
      } else {
        router.replace('/(tabs)');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, role]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
