import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { MembershipStatus } from '../../types';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  status?: MembershipStatus;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  status,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  // Map membership status if provided
  let effectiveVariant = variant;
  if (status) {
    if (status === 'active') effectiveVariant = 'success';
    else if (status === 'expiring_soon') effectiveVariant = 'warning';
    else if (status === 'expired') effectiveVariant = 'danger';
    else if (status === 'frozen') effectiveVariant = 'neutral';
  }

  const getColors = () => {
    switch (effectiveVariant) {
      case 'primary':
        return {
          bg: theme.isDark ? '#233008' : '#ECFCCB',
          text: theme.isDark ? '#CCFF00' : '#4D7C0F',
          border: theme.isDark ? '#435E0B' : '#BEF264',
        };
      case 'success':
        return {
          bg: theme.isDark ? '#062B1D' : '#D1FAE5',
          text: theme.isDark ? '#34D399' : '#047857',
          border: theme.isDark ? '#0F5138' : '#A7F3D0',
        };
      case 'warning':
        return {
          bg: theme.isDark ? '#311F08' : '#FEF3C7',
          text: theme.isDark ? '#FBBF24' : '#B45309',
          border: theme.isDark ? '#593D13' : '#FDE68A',
        };
      case 'danger':
        return {
          bg: theme.isDark ? '#331010' : '#FEE2E2',
          text: theme.isDark ? '#F87171' : '#B91C1C',
          border: theme.isDark ? '#631E1E' : '#FECACA',
        };
      case 'neutral':
      default:
        return {
          bg: theme.colors.cardElevated,
          text: theme.colors.textSecondary,
          border: theme.colors.border,
        };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderRadius: theme.radii.full,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
