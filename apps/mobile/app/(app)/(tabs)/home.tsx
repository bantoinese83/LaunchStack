import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeButton, NativeCard, theme } from '@template/mobile-ui';
import { createSupabaseBrowserClient } from '@template/api';

export default function MobileHomeScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Workspace</Text>
      <Text style={styles.heading}>Overview</Text>
      <Text style={styles.lede}>Shared auth, seats, and billing — same contracts as web.</Text>

      <NativeCard style={styles.metricCard}>
        <View style={styles.accentBar} />
        <Text style={styles.metricLabel}>Active Plan</Text>
        <Text style={styles.metricValue}>Pro Monthly</Text>
        <Text style={styles.metricSub}>Stripe verified</Text>
      </NativeCard>

      <NativeCard style={styles.metricCard}>
        <View style={styles.accentBar} />
        <Text style={styles.metricLabel}>Team Members</Text>
        <Text style={styles.metricValue}>4 / 20 seats</Text>
        <Text style={styles.metricSub}>16 seats available</Text>
      </NativeCard>

      <NativeCard style={styles.metricCard}>
        <View style={styles.accentBar} />
        <Text style={styles.metricLabel}>Roadmap</Text>
        <Text style={styles.metricValue}>18 posts</Text>
        <Text style={styles.metricSub}>5 planned this sprint</Text>
      </NativeCard>

      <NativeButton
        title="Sign out"
        variant="outline"
        onPress={handleSignOut}
        style={styles.signOut}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.paper,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
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
  },
  lede: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
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
  signOut: {
    marginTop: 12,
  },
});
