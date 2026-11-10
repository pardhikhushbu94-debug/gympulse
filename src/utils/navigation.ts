import { router } from 'expo-router';

/**
 * Safely goes back in history if possible, or falls back to a default route
 * to avoid Expo Router "GO_BACK was not handled by any navigator" error on web page reloads or direct links.
 */
export function safeGoBack(fallbackRoute: string = '/(tabs)') {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackRoute as any);
  }
}
