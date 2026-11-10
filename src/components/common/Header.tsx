import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Moon, Sun, Dumbbell, Palette, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { useNutritionStore } from '../../store/nutritionStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showThemeToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showThemeToggle = true,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const { notifications } = useNutritionStore();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <View style={styles.leftRow}>
        <View style={[styles.logoIconBox, { backgroundColor: theme.colors.primary }]}>
          <Dumbbell size={20} color={theme.colors.primaryContrast} />
        </View>
        <View>
          <Text style={[styles.brandText, { color: theme.colors.text }]}>
            {title || 'GYMPULSE'}
          </Text>
          <Text style={[styles.subtitleText, { color: theme.colors.textSecondary }]}>
            {subtitle || (user ? `Namaste, ${user.fullName.split(' ')[0]}` : 'Fitness Redefined')}
          </Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity
          onPress={() => router.push('/notifications' as any)}
          style={[styles.iconButton, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}
          accessibilityLabel="Notifications"
        >
          <Bell size={18} color={theme.colors.text} />
          {unreadCount > 0 && (
            <View style={[styles.badgeDot, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/design-system')}
          style={[styles.iconButton, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}
          accessibilityLabel="Design System"
        >
          <Palette size={18} color={theme.colors.primary} />
        </TouchableOpacity>

        {showThemeToggle ? (
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}
            accessibilityLabel="Toggle Theme"
          >
            {isDark ? (
              <Sun size={18} color={theme.colors.primary} />
            ) : (
              <Moon size={18} color={theme.colors.text} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
