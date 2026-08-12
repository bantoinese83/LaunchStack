import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeCard, theme } from '@template/mobile-ui';

export default function MobileHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Workspace</Text>
      <Text style={styles.heading}>Overview</Text>

      <NativeCard style={styles.metricCard}>
        <View style={styles.accentBar} />
        <Text style={styles.metricLabel}>Active Plan</Text>
        <Text style={styles.metricValue}>Pro Monthly</Text>
        <Text style={styles.metricSub}>Stripe verified</Text>
      </NativeCard>

      <NativeCard style={styles.metricCard}>
        <View style={styles.accentBar} />
        <Text style={styles.metricLabel}>Team Members</Text>
        <Text style={styles.metricValue}>4 Active Seats</Text>
        <Text style={styles.metricSub}>16 seats available</Text>
      </NativeCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.paper,
    padding: 20,
  },
  kicker: {
    color: theme.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heading: {
    color: theme.ink,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  metricCard: {
    marginBottom: 12,
    overflow: 'hidden',
    paddingLeft: 18,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: theme.accent,
  },
  metricLabel: {
    color: theme.muted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  metricValue: {
    color: theme.ink,
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 4,
    letterSpacing: -0.3,
  },
  metricSub: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '600',
  },
});
