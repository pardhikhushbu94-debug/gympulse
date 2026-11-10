import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { UserRole } from '../../types';
import { router } from 'expo-router';

export const QuickRoleSwitcher: React.FC = () => {
  const { role, switchRole } = useAuthStore();
  const { theme } = useTheme();

  const handleSelectRole = (newRole: UserRole) => {
    switchRole(newRole);
    if (newRole === 'member') {
      router.replace('/(tabs)');
    } else if (newRole === 'trainer') {
      router.replace('/(trainer)');
    } else if (newRole === 'admin') {
      router.replace('/(admin)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>ROLE PREVIEW:</Text>
      <View style={styles.buttonRow}>
        {(['member', 'trainer', 'admin'] as UserRole[]).map((r) => {
          const isActive = role === r;
          return (
            <TouchableOpacity
              key={r}
              activeOpacity={0.7}
              onPress={() => handleSelectRole(r)}
              style={[
                styles.rolePill,
                {
                  backgroundColor: isActive ? theme.colors.primary : 'transparent',
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  {
                    color: isActive ? theme.colors.primaryContrast : theme.colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {r === 'member' ? '👤 Member' : r === 'trainer' ? '🏋️ Trainer' : '👑 Admin'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
