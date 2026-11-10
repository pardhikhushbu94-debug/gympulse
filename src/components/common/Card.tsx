import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, elevated = false, style }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: elevated ? theme.colors.cardElevated : theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    padding: 16,
    borderWidth: 1,
    marginVertical: 6,
  },
});
