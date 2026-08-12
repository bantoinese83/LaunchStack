import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeCard } from '@template/mobile-ui';

export default function MobileHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Workspace Overview</Text>

      <NativeCard style={styles.metricCard}>
        <Text style={styles.metricLabel}>Active Plan</Text>
        <Text style={styles.metricValue}>Pro Monthly</Text>
        <Text style={styles.metricSub}>Stripe Verified</Text>
      </NativeCard>

      <NativeCard style={styles.metricCard}>
        <Text style={styles.metricLabel}>Team Members</Text>
        <Text style={styles.metricValue}>4 Active Seats</Text>
        <Text style={styles.metricSub}>16 Seats Available</Text>
      </NativeCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  heading: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricCard: {
    marginBottom: 12,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  metricSub: {
    color: '#34d399',
    fontSize: 12,
  },
});
