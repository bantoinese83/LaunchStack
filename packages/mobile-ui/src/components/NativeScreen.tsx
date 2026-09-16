import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../theme';

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.paper,
  },
});
