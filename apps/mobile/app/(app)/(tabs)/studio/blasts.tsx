import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import { sendStudioBlast } from '../../../../lib/studioApi';

const SEGMENTS = ['all', 'members', 'packages', 'upcoming_week'] as const;
const CHANNELS = ['both', 'email', 'sms'] as const;

export default function StudioBlastsScreen() {
  const { workspaceId } = useStudioAccess();
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>('both');
  const [segment, setSegment] = useState<(typeof SEGMENTS)[number]>('all');
  const [subject, setSubject] = useState('Mystic Hair Co.');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function send() {
    if (!workspaceId || !body.trim()) return;
    const data = await sendStudioBlast({
      workspaceId,
      channel,
      segment,
      subject,
      body: body.trim(),
    });
    setMessage(data.error ? data.error : `Sent to ${data.sent ?? 0} recipients`);
    if (!data.error) setBody('');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.section}>Channel</Text>
      <View style={styles.row}>
        {CHANNELS.map((c) => (
          <Chip key={c} label={c} active={channel === c} onPress={() => setChannel(c)} />
        ))}
      </View>
      <Text style={styles.section}>Segment</Text>
      <View style={styles.row}>
        {SEGMENTS.map((s) => (
          <Chip
            key={s}
            label={s.replace('_', ' ')}
            active={segment === s}
            onPress={() => setSegment(s)}
          />
        ))}
      </View>
      <TextInput
        value={subject}
        onChangeText={setSubject}
        placeholder="Email subject"
        style={styles.input}
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Message body"
        multiline
        style={[styles.input, styles.body]}
      />
      <NativeButton title="Send blast" onPress={() => void send()} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: 40 },
  section: { ...monoLabel, color: theme.muted, marginTop: 8, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.line,
  },
  chipActive: { backgroundColor: theme.shell, borderColor: theme.shell },
  chipText: { fontSize: 12, color: theme.ink, textTransform: 'capitalize' },
  chipTextActive: { color: theme.paper },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    padding: 12,
    marginBottom: 10,
    backgroundColor: theme.surface,
    color: theme.ink,
  },
  body: { minHeight: 120, textAlignVertical: 'top' },
  message: { marginTop: 12, color: theme.chalk },
});
