import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import { addBlockedDate, fetchBlockedDates, removeBlockedDate } from '../../../../lib/studioApi';

type Blocked = { id: string; block_date: string; reason: string | null };

export default function StudioBlockedScreen() {
  const { workspaceId } = useStudioAccess();
  const [rows, setRows] = useState<Blocked[]>([]);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) return;
    void fetchBlockedDates(workspaceId).then((data) => {
      if (data.error) {
        setMessage(data.error);
        setRows([]);
        return;
      }
      setMessage(null);
      setRows((data.blockedDates ?? []) as Blocked[]);
    });
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function block() {
    if (!workspaceId || !date) return;
    const data = await addBlockedDate(workspaceId, date, reason || undefined);
    setMessage(data.error ? data.error : 'Date blocked');
    if (!data.error) {
      setDate('');
      setReason('');
      load();
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.hint}>Clients cannot book on blocked days (out of town).</Text>
      <TextInput
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />
      <TextInput
        placeholder="Reason (optional)"
        value={reason}
        onChangeText={setReason}
        style={styles.input}
      />
      <NativeButton title="Block date" onPress={() => void block()} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Text style={styles.section}>Upcoming</Text>
      {rows.map((row) => (
        <View key={row.id} style={styles.row}>
          <View>
            <Text style={styles.date}>{row.block_date}</Text>
            {row.reason ? <Text style={styles.muted}>{row.reason}</Text> : null}
          </View>
          <Pressable
            onPress={() => workspaceId && void removeBlockedDate(workspaceId, row.id).then(load)}
          >
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20 },
  hint: { color: theme.muted, marginBottom: 12, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    padding: 12,
    marginBottom: 10,
    backgroundColor: theme.surface,
    color: theme.ink,
  },
  section: { ...monoLabel, color: theme.muted, marginTop: 20, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  date: { fontWeight: '600' },
  muted: { fontSize: 12, color: theme.muted, marginTop: 2 },
  remove: { color: theme.danger, fontSize: 13 },
  message: { marginTop: 10, color: theme.chalk },
});
