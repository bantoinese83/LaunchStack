import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '../theme';

export const NativeCard: React.FC<ViewProps> = ({ children, style, ...props }) => (
  <View style={[styles.card, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.line,
    ...Platform.select({
      ios: {
        shadowColor: theme.ink,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
});
