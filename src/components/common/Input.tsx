import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPhonePrefix?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPhonePrefix = false,
  containerStyle,
  style,
  ...rest
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.cardElevated,
            borderColor: error
              ? theme.colors.danger
              : isFocused
              ? theme.colors.primary
              : theme.colors.border,
            borderRadius: theme.radii.md,
          },
        ]}
      >
        {isPhonePrefix ? (
          <View style={[styles.prefixBox, { borderRightColor: theme.colors.border }]}>
            <Text style={[styles.prefixText, { color: theme.colors.text }]}>
              🇮🇳 +91
            </Text>
          </View>
        ) : null}

        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            {
              color: theme.colors.text,
            },
            style,
          ]}
          {...rest}
        />
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 50,
  },
  prefixBox: {
    paddingHorizontal: 12,
    borderRightWidth: 1,
    height: '100%',
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
