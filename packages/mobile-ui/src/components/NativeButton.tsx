import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../theme';

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
});
