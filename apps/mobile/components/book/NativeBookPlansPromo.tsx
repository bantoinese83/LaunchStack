import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BOOKING_PLANS_NUDGE } from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';

export function NativeBookPlansPromo() {
  const router = useRouter();

  return (
    <Pressable
      style={styles.wrap}
      onPress={() => router.push('/(app)/(tabs)/membership')}
      accessibilityRole="button"
      accessibilityLabel={BOOKING_PLANS_NUDGE.cta}
    >
      <View style={styles.copy}>
        <Text style={styles.title}>{BOOKING_PLANS_NUDGE.title}</Text>
        <Text style={styles.body}>{BOOKING_PLANS_NUDGE.body}</Text>
      </View>
      <Text style={styles.cta}>{BOOKING_PLANS_NUDGE.cta} →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    padding: 14,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
    gap: 10,
  },
  copy: { gap: 4 },
  title: { fontSize: 15, fontWeight: '600', color: theme.ink },
  body: { fontSize: 13, lineHeight: 18, color: theme.muted },
  cta: { ...monoLabel, fontSize: 11, color: theme.accent, fontWeight: '600' },
});
