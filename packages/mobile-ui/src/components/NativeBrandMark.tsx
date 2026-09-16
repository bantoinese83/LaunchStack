import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export const NativeBrandMark: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <View style={[styles.logoBadge, { width: size, height: size, borderRadius: size * 0.09 }]}>
    <Text style={[styles.logoText, { fontSize: size * 0.36 }]}>LS</Text>
  </View>
);

const styles = StyleSheet.create({
  logoBadge: {
    backgroundColor: theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: theme.paper,
    fontWeight: '700',
  },
});
