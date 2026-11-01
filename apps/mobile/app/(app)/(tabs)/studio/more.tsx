import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { formatStudioAnalyticsRate, formatUsd } from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';
import { NativeSalonLoader } from '../../../../components/mystic/NativeSalonLoader';
import { NativePressableScale } from '../../../../components/motion/NativePressableScale';
import { NativeFadeIn } from '../../../../components/motion/NativeFadeIn';
import { hapticSoft } from '../../../../lib/haptics';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import {
  fetchStudioAnalytics,
  fetchStudioSettings,
  patchStudioSettings,
} from '../../../../lib/studioApi';

type AnalyticsSnap = {
  periodLabel?: string;
  bookingCount?: number;
  revenueCents?: number;
  completedCount?: number;
  noShowCount?: number;
  avgTicketCents?: number;
  completionRate?: number | null;
  error?: string;
};

export default function StudioMoreScreen() {
  const router = useRouter();
  const { workspaceId } = useStudioAccess();
  const [analytics, setAnalytics] = useState<AnalyticsSnap | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [winterBuffer, setWinterBuffer] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) return;
    void fetchStudioAnalytics(workspaceId, 'mtd').then((data: AnalyticsSnap) => {
      if (data.error) {
        setAnalyticsError(data.error);
        setAnalytics(null);
        return;
      }
      setAnalyticsError(null);
      setAnalytics(data);
    });
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
      <NativeFadeIn>
        <Text style={styles.section}>{analytics?.periodLabel ?? 'This month'}</Text>
        {analyticsError ? (
          <Text style={styles.error}>{analyticsError}</Text>
        ) : analytics ? (
          <View style={styles.revenuePoster}>
            <LinearGradient
              colors={['#242B20', theme.shell]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.revenue}>{formatUsd(analytics.revenueCents ?? 0)}</Text>
            <Text style={styles.revenueMuted}>Completed revenue</Text>
            <View style={styles.statRow}>
              <Text style={styles.statOnDark}>{analytics.bookingCount ?? 0} bookings</Text>
              <Text style={styles.statOnDark}>{analytics.completedCount ?? 0} done</Text>
            </View>
            {analytics.avgTicketCents ? (
              <Text style={styles.revenueMuted}>
                Avg ticket {formatUsd(analytics.avgTicketCents)}
              </Text>
            ) : null}
            {analytics.completionRate != null ? (
              <Text style={styles.revenueMuted}>
                Settle rate {formatStudioAnalyticsRate(analytics.completionRate)}
                {analytics.noShowCount ? ` · ${analytics.noShowCount} no-show` : ''}
              </Text>
            ) : null}
          </View>
        ) : (
          <NativeSalonLoader copyKey="studio" size="sm" />
        )}

        <Text style={styles.section}>Winter buffer</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>45 min between stops</Text>
          <Switch
            value={winterBuffer}
            onValueChange={(v) => {
              hapticSoft();
              void saveWinter(v);
            }}
            trackColor={{ true: theme.accent, false: theme.line }}
          />
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Text style={styles.section}>Studio</Text>
        <LinkRow label="Referrals" onPress={() => router.push('/(app)/(tabs)/studio/referrals')} />
        <LinkRow
          label="Deposits & surcharges"
          onPress={() => router.push('/(app)/(tabs)/studio/settings')}
        />
        <LinkRow
          label="Blocked travel days"
          onPress={() => router.push('/(app)/(tabs)/studio/blocked')}
        />
      </NativeFadeIn>
    </ScrollView>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <NativePressableScale onPress={onPress} style={styles.link} accessibilityRole="button">
      <Text style={styles.linkText}>{label}</Text>
      <Text style={styles.chevron}>→</Text>
    </NativePressableScale>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: 40 },
  section: { ...monoLabel, color: theme.plum, marginTop: 18, marginBottom: 10 },
  revenuePoster: {
    borderRadius: theme.radii.xl,
    padding: 20,
    overflow: 'hidden',
    minHeight: 140,
  },
  revenue: {
    fontSize: 36,
    fontWeight: '600',
    color: theme.paper,
    letterSpacing: -1,
  },
  revenueMuted: {
    color: 'rgba(247,244,237,0.55)',
    marginTop: 4,
    fontSize: 13,
  },
  statRow: { flexDirection: 'row', gap: 16, marginTop: 14 },
  statOnDark: { fontSize: 14, fontWeight: '600', color: theme.paper },
  muted: { color: theme.muted, marginTop: 4, fontSize: 13 },
  error: { color: theme.plum, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  rowLabel: { color: theme.ink, flex: 1, paddingRight: 12, fontSize: 15 },
  message: { marginTop: 12, color: theme.chalk, fontSize: 13 },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
  linkText: { fontWeight: '500', color: theme.ink, flex: 1, fontSize: 16 },
  chevron: { color: theme.gold, marginLeft: 8, fontSize: 16 },
});
