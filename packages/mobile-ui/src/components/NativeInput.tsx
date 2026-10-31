import React, { useId } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { monoLabel, theme } from '../theme';

export interface NativeInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const NativeInput: React.FC<NativeInputProps> = ({
  label,
  error,
  style,
  nativeID: nativeIDProp,
  accessibilityLabel,
  ...props
}) => {
  const autoId = useId().replace(/:/g, '');
  const nativeID = nativeIDProp ?? autoId;

  return (
    <View style={styles.inputContainer}>
      {label ? (
        <Text nativeID={`${nativeID}-label`} style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        nativeID={nativeID}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? props.placeholder}
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={`${theme.muted}99`}
        {...props}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

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
