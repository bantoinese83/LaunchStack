import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native';

/** Atlas Forge tokens — keep in sync with web Tailwind theme */
export const theme = {
  paper: '#F3F4F1',
  surface: '#FFFFFF',
  ink: '#141714',
  muted: '#5A635C',
  line: '#C9CEC6',
  accent: '#0F6E56',
  accentHover: '#0B5844',
  accentSoft: '#E3F0EB',
  danger: '#B42318',
  success: '#027A48',
} as const;

export interface NativeButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const NativeButton: React.FC<NativeButtonProps> = ({
  title,
  variant = 'primary',
  isLoading,
  disabled,
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primaryBtn,
    variant === 'secondary' && styles.secondaryBtn,
    variant === 'danger' && styles.dangerBtn,
    (disabled || isLoading) && styles.disabledBtn,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || isLoading}
      activeOpacity={0.85}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export const NativeCard: React.FC<ViewProps> = ({ children, style, ...props }) => (
  <View style={[styles.card, style]} {...props}>
    {children}
  </View>
);

export interface NativeInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const NativeInput: React.FC<NativeInputProps> = ({ label, error, style, ...props }) => (
  <View style={styles.inputContainer}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={[styles.input, error ? styles.inputError : null, style]}
      placeholderTextColor={theme.muted}
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryBtn: {
    backgroundColor: theme.accent,
  },
  secondaryBtn: {
    backgroundColor: theme.ink,
  },
  dangerBtn: {
    backgroundColor: theme.danger,
  },
  disabledBtn: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.line,
  },
  inputContainer: {
    marginBottom: 12,
    width: '100%',
  },
  label: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 6,
    height: 44,
    paddingHorizontal: 12,
    color: theme.ink,
    fontSize: 15,
  },
  inputError: {
    borderColor: theme.danger,
  },
  errorText: {
    color: theme.danger,
    fontSize: 12,
    marginTop: 4,
  },
});
