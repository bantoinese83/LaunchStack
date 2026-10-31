import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type NativeBrandMarkProps = {
  size?: number;
};

export function NativeBrandMark({ size = 48 }: NativeBrandMarkProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>M</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accentSoft,
    overflow: 'hidden',
  },
  letter: {
    color: theme.accent,
    fontWeight: '600',
  },
});
