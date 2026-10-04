import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { monoLabel, theme } from '../theme';

export interface NativeInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const NativeInput: React.FC<NativeInputProps> = ({ label, error, style, ...props }) => (
  <View style={styles.inputContainer}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={[styles.input, error ? styles.inputError : null, style]}
      placeholderTextColor={`${theme.muted}99`}
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
    ...monoLabel,
    color: theme.muted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.md,
    height: 46,
    paddingHorizontal: 14,
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
