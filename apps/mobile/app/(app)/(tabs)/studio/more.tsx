import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { formatUsd } from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import {
  fetchStudioAnalytics,
  fetchStudioSettings,
  patchStudioSettings,
} from '../../../../lib/studioApi';

export default function StudioMoreScreen() {
  const { workspaceId } = useStudioAccess();
  const [analytics, setAnalytics] = useState<{
    bookingCount?: number;
    revenueCents?: number;
    completedCount?: number;
  } | null>(null);
  const [winterBuffer, setWinterBuffer] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) return;
    void fetchStudioAnalytics(workspaceId).then(setAnalytics);
    void fetchStudioSettings(workspaceId).then((data) => {
      if (data.settings) setWinterBuffer(data.settings.winter_buffer_enabled);
    });
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveWinter(value: boolean) {
    if (!workspaceId) return;
    setWinterBuffer(value);
    const data = await patchStudioSettings(workspaceId, { winterBufferEnabled: value });
    setMessage(data.error ? data.error : 'Winter buffer updated');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.section}>This month</Text>
      {analytics ? (
        <View style={styles.card}>
          <Text style={styles.stat}>{analytics.bookingCount ?? 0} bookings</Text>
          <Text style={styles.stat}>{formatUsd(analytics.revenueCents ?? 0)} revenue</Text>
          <Text style={styles.muted}>{analytics.completedCount ?? 0} completed</Text>
        </View>
      ) : (
        <Text style={styles.muted}>Loading…</Text>
      )}

      <Text style={styles.section}>Winter buffer</Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>45 min between stops</Text>
        <Switch value={winterBuffer} onValueChange={(v) => void saveWinter(v)} />
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: 40 },
  section: { ...monoLabel, color: theme.accent, marginTop: 16, marginBottom: 8 },
  card: {
    padding: 16,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  stat: { fontSize: 18, fontWeight: '600', color: theme.ink },
  muted: { color: theme.muted, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  rowLabel: { color: theme.ink, flex: 1, paddingRight: 12 },
  message: { marginTop: 16, color: theme.chalk },
});
