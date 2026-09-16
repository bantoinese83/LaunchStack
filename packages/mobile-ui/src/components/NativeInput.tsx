import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '../theme';

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

const styles = StyleSheet.create({
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
});
