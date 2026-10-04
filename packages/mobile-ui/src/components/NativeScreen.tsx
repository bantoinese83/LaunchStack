import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../theme';

export const NativeScreen: React.FC<{
  children: React.ReactNode;
  style?: ViewProps['style'];
  /** `shell` matches web auth backdrop; `paper` is the default app canvas */
  background?: 'paper' | 'shell';
}> = ({ children, style, background = 'paper' }) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={[styles.screen, background === 'shell' && styles.screenShell, style]}
  >
    {children}
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.paper,
  },
  screenShell: {
    backgroundColor: theme.shell,
  },
});
