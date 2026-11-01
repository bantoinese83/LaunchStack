import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { monoLabel, theme } from '@template/mobile-ui';
import { NativeFadeIn } from '../motion/NativeFadeIn';
/** Editorial empty board — fills space without a second illustrated empty state. */
export function NativeQuietBoard() {
  return (
    <NativeFadeIn rise delayMs={80} style={styles.wrap}>
      <Text style={styles.kicker}>Stops</Text>
      <Text style={styles.title}>Nothing on the board</Text>
      <Text style={styles.body}>
        Bookings show here with en route, door timer, and complete. Pull down to refresh when the
        calendar fills.
      </Text>
    </NativeFadeIn>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    paddingTop: 8,
    paddingBottom: 12,
  },
  kicker: {
    ...monoLabel,
    color: theme.plum,
    fontSize: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.ink,
    letterSpacing: -0.5,
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: theme.muted,
    maxWidth: 340,
  },
});
