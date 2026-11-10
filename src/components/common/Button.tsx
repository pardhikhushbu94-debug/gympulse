import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: disabled ? theme.colors.border : theme.colors.primary,
          },
          text: {
            color: disabled ? theme.colors.textMuted : theme.colors.primaryContrast,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.colors.cardElevated,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
          text: {
            color: theme.colors.text,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: disabled ? theme.colors.border : theme.colors.primary,
          },
          text: {
            color: disabled ? theme.colors.textMuted : theme.colors.primary,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: theme.colors.text,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: theme.colors.danger,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      default:
        return {
          container: { backgroundColor: theme.colors.primary },
          text: { color: theme.colors.primaryContrast },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: theme.radii.sm },
          text: { fontSize: 13, fontWeight: '600' },
        };
      case 'lg':
        return {
          container: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: theme.radii.lg },
          text: { fontSize: 17, fontWeight: '700' },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: theme.radii.md },
          text: { fontSize: 15, fontWeight: '600' },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.primaryContrast : theme.colors.primary}
        />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, icon ? { marginLeft: 8 } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.6,
  },
});
