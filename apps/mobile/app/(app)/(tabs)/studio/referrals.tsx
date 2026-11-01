import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { monoLabel, theme } from '@template/mobile-ui';
import { NativeEmptyState } from '../../../../components/mystic/NativeEmptyState';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import { fetchReferralDashboard } from '../../../../lib/studioApi';

type ReferrerRow = {
  name: string;
  total: number;
  pending: number;
  credited: number;
  referrerUserId?: string;
};

type RecentReferral = {
  id: string;
  referred_name: string;
  credited: boolean;
  created_at: string;
};

export default function StudioReferralsScreen() {
  const { workspaceId } = useStudioAccess();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [referrers, setReferrers] = useState<ReferrerRow[]>([]);
  const [recent, setRecent] = useState<RecentReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    void fetchReferralDashboard(workspaceId, month)
      .then((data) => {
        setReferrers(data.dashboard?.referrers ?? []);
        setRecent(data.dashboard?.recent ?? []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not load referrals');
        setReferrers([]);
        setRecent([]);
      })
      .finally(() => setLoading(false));
  }, [workspaceId, month]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.label}>Month (YYYY-MM)</Text>
      <TextInput value={month} onChangeText={setMonth} style={styles.input} />
      <Pressable onPress={load} style={styles.refresh}>
        <Text style={styles.refreshText}>{loading ? 'Refreshing…' : 'Refresh'}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading && referrers.length === 0 ? (
        <ActivityIndicator color={theme.accent} style={{ marginVertical: 24 }} />
      ) : null}
      {!loading && referrers.length === 0 && !error ? (
        <NativeEmptyState variant="referrals" compact />
      ) : (
        referrers.map((row, index) => (
          <View key={row.referrerUserId ?? `${row.name}-${index}`} style={styles.card}>
            <Text style={styles.name}>{row.name}</Text>
            <Text style={styles.meta}>
              {row.total} this month · {row.pending} pending · {row.credited} rewarded
            </Text>
          </View>
        ))
      )}
      {recent.length > 0 ? (
        <View style={styles.recentBlock}>
          <Text style={styles.recentTitle}>Recent</Text>
          {recent.map((row) => (
            <View key={row.id} style={styles.recentRow}>
              <Text style={styles.name}>{row.referred_name}</Text>
              <Text style={styles.meta}>
                {row.credited ? 'Rewarded' : 'Pending'} ·{' '}
                {new Date(row.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20 },
  label: { ...monoLabel, color: theme.muted, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    padding: 12,
    marginBottom: 12,
    backgroundColor: theme.surface,
    color: theme.ink,
  },
  refresh: { marginBottom: 16 },
  refreshText: { color: theme.accent, fontWeight: '600' },
  error: { color: theme.danger, marginBottom: 12 },
  card: {
    padding: 14,
    marginBottom: 10,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  name: { fontWeight: '600', color: theme.ink },
  meta: { marginTop: 4, fontSize: 13, color: theme.muted },
  recentBlock: { marginTop: 16 },
  recentTitle: { ...monoLabel, color: theme.muted, marginBottom: 8 },
  recentRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
});
