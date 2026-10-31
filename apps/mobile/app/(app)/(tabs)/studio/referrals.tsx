import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { monoLabel, theme } from '@template/mobile-ui';
import { NativeEmptyState } from '../../../../components/mystic/NativeEmptyState';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import { fetchReferralDashboard } from '../../../../lib/studioApi';

type ReferrerRow = {
  name: string;
  total: number;
  pending: number;
  credited: number;
};

export default function StudioReferralsScreen() {
  const { workspaceId } = useStudioAccess();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [referrers, setReferrers] = useState<ReferrerRow[]>([]);

  const load = useCallback(() => {
    if (!workspaceId) return;
    void fetchReferralDashboard(workspaceId, month).then((data) => {
      setReferrers(data.dashboard?.referrers ?? []);
    });
  }, [workspaceId, month]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.label}>Month (YYYY-MM)</Text>
      <TextInput value={month} onChangeText={setMonth} style={styles.input} />
      {referrers.length === 0 ? (
        <NativeEmptyState variant="referrals" compact />
      ) : (
        referrers.map((row, index) => (
          <View key={`${row.name}-${index}`} style={styles.card}>
            <Text style={styles.name}>{row.name}</Text>
            <Text style={styles.meta}>
              {row.total} this month · {row.pending} pending · {row.credited} rewarded
            </Text>
          </View>
        ))
      )}
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
    marginBottom: 16,
    backgroundColor: theme.surface,
    color: theme.ink,
  },
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
  muted: { color: theme.muted },
});
