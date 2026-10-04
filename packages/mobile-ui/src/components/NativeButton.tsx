import React from 'react';
import {
  ActivityIndicator,
  Platform,
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
      activeOpacity={0.88}
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
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryBtn: {
    backgroundColor: theme.accent,
    ...Platform.select({
      ios: {
        shadowColor: theme.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  secondaryBtn: {
    backgroundColor: theme.shell,
    ...Platform.select({
      ios: {
        shadowColor: theme.shell,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: { elevation: 5 },
      default: {},
    }),
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
