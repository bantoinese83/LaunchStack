import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
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
  const isOutline = variant === 'outline';
  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primaryBtn,
    variant === 'secondary' && styles.secondaryBtn,
    variant === 'outline' && styles.outlineBtn,
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
        <ActivityIndicator color={isOutline ? theme.ink : '#ffffff'} />
      ) : (
        <Text style={[styles.buttonText, isOutline && styles.outlineBtnText]}>{title}</Text>
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
      placeholderTextColor={`${theme.muted}A6`}
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export const NativeBrandMark: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <View style={[styles.logoBadge, { width: size, height: size, borderRadius: size * 0.09 }]}>
    <Text style={[styles.logoText, { fontSize: size * 0.36 }]}>LS</Text>
  </View>
);

export const NativeScreen: React.FC<{ children: React.ReactNode; style?: ViewProps['style'] }> = ({
  children,
  style,
}) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={[styles.screen, style]}
  >
    {children}
  </KeyboardAvoidingView>
);

export const NativeAlert: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.alert}>
    <Text style={styles.alertText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.paper,
  },
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
  outlineBtn: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
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
  outlineBtnText: {
    color: theme.ink,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 6,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.line,
  },
  inputContainer: {
    marginBottom: 14,
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
  logoBadge: {
    backgroundColor: theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: theme.paper,
    fontWeight: '700',
  },
  alert: {
    width: '100%',
    backgroundColor: '#FEF3F2',
    borderColor: '#FECDCA',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  alertText: {
    color: theme.danger,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
