import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { NativeEmptyState } from '../../../../components/mystic/NativeEmptyState';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import { fetchStudioAppointments, studioPatchAppointment } from '../../../../lib/studioApi';

type Row = { id: string; starts_at: string; service_id: string; status: string };

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function StudioCalendarScreen() {
  const { workspaceId } = useStudioAccess();
  const [rows, setRows] = useState<Row[]>([]);
  const [rescheduleAt, setRescheduleAt] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) return;
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 14);
    void fetchStudioAppointments(workspaceId, from.toISOString(), to.toISOString()).then((data) => {
      const list = (data.appointments ?? []) as Row[];
      setRows(list);
      setRescheduleAt(Object.fromEntries(list.map((r) => [r.id, toLocalInput(r.starts_at)])));
    });
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(id: string) {
    if (!workspaceId) return;
    const result = await studioPatchAppointment(workspaceId, id, 'cancel');
    setStatus(result.ok ? 'Canceled' : (result.error ?? 'Failed'));
    load();
  }

  async function reschedule(id: string) {
    if (!workspaceId) return;
    const startsAt = rescheduleAt[id];
    if (!startsAt) return;
    const result = await studioPatchAppointment(
      workspaceId,
      id,
      'reschedule',
      new Date(startsAt).toISOString()
    );
    setStatus(result.ok ? 'Rescheduled' : (result.error ?? 'Failed'));
    load();
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {status ? <Text style={styles.status}>{status}</Text> : null}
      {rows.length === 0 ? (
        <NativeEmptyState variant="calendar" />
      ) : (
        rows.map((row) => {
          const locked = ['canceled', 'completed', 'no_show'].includes(row.status);
          return (
            <View key={row.id} style={styles.card}>
              <Text style={styles.title}>{row.service_id}</Text>
              <Text style={styles.muted}>
                {new Date(row.starts_at).toLocaleString()} · {row.status.replace(/_/g, ' ')}
              </Text>
              {!locked ? (
                <>
                  <Text style={styles.label}>New time</Text>
                  <TextInput
                    value={rescheduleAt[row.id]}
                    onChangeText={(v) => setRescheduleAt((m) => ({ ...m, [row.id]: v }))}
                    placeholder="YYYY-MM-DDTHH:mm"
                    style={styles.input}
                  />
                  <View style={styles.row}>
                    <NativeButton
                      title="Save time"
                      variant="secondary"
                      onPress={() => void reschedule(row.id)}
                      style={styles.half}
                    />
                    <NativeButton
                      title="Cancel visit"
                      variant="danger"
                      onPress={() => void cancel(row.id)}
                      style={styles.half}
                    />
                  </View>
                </>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20 },
  status: { marginBottom: 12, color: theme.chalk },
  card: {
    padding: 14,
    marginBottom: 12,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  title: { fontWeight: '600', textTransform: 'capitalize' },
  muted: { color: theme.muted, fontSize: 13, marginTop: 4 },
  label: { ...monoLabel, color: theme.muted, marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.md,
    padding: 10,
    color: theme.ink,
    backgroundColor: theme.paper,
  },
  row: { flexDirection: 'row', gap: 8, marginTop: 10 },
  half: { flex: 1 },
});
