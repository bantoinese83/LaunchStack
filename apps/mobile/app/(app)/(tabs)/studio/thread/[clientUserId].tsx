import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NativeButton, theme } from '@template/mobile-ui';
import { useStudioAccess } from '../../../../../hooks/useStudioAccess';
import { fetchStudioThread, sendStudioMessage } from '../../../../../lib/studioApi';

type Message = { id: string; body: string; sender_role: string };

export default function StudioThreadScreen() {
  const { clientUserId, clientName } = useLocalSearchParams<{
    clientUserId: string;
    clientName?: string;
  }>();
  const { workspaceId } = useStudioAccess();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId || !clientUserId) return;
    void fetchStudioThread(workspaceId, clientUserId).then((data) => {
      setMessages(data.messages ?? []);
    });
  }, [workspaceId, clientUserId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send() {
    if (!workspaceId || !clientUserId || !body.trim()) return;
    const data = await sendStudioMessage(workspaceId, clientUserId, body.trim());
    if (data.error) setStatus(data.error);
    else {
      setBody('');
      setStatus(null);
      load();
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {clientName ? <Text style={styles.heading}>{clientName}</Text> : null}
      {messages.map((msg) => (
        <View
          key={msg.id}
          style={[styles.bubble, msg.sender_role === 'stylist' ? styles.luke : styles.client]}
        >
          <Text style={styles.role}>{msg.sender_role}</Text>
          <Text style={styles.body}>{msg.body}</Text>
        </View>
      ))}
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Reply…"
        multiline
        style={styles.input}
        placeholderTextColor={theme.muted}
      />
      <NativeButton title="Send" onPress={() => void send()} />
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20 },
  heading: { fontWeight: '600', marginBottom: 12, color: theme.ink },
  bubble: { padding: 12, borderRadius: theme.radii.lg, marginBottom: 8 },
  luke: { backgroundColor: theme.accentSoft, alignSelf: 'flex-end', maxWidth: '90%' },
  client: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    maxWidth: '90%',
  },
  role: { fontSize: 10, textTransform: 'uppercase', color: theme.muted },
  body: { marginTop: 4, color: theme.ink },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    padding: 12,
    minHeight: 80,
    marginVertical: 12,
    color: theme.ink,
    backgroundColor: theme.surface,
  },
  status: { color: theme.danger, marginTop: 8 },
});
