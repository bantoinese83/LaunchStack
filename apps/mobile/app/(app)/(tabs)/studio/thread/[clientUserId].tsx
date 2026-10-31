import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NativeButton, theme } from '@template/mobile-ui';
import { NativeUserAvatar } from '../../../../../components/mystic/NativeUserAvatar';
import { MYSTIC_STYLIST, messageSenderLabel, mysticStylistPortraitUrl } from '@template/mystic';
import { useStudioAccess } from '../../../../../hooks/useStudioAccess';
import { fetchStudioThread, sendStudioMessage } from '../../../../../lib/studioApi';

type Message = { id: string; body: string; sender_role: string };

const lukePortraitUrl = mysticStylistPortraitUrl(process.env.EXPO_PUBLIC_APP_URL);

export default function StudioThreadScreen() {
  const { clientUserId, clientName, clientAvatarUrl } = useLocalSearchParams<{
    clientUserId: string;
    clientName?: string;
    clientAvatarUrl?: string;
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
      {clientName ? (
        <View style={styles.headingRow}>
          <NativeUserAvatar url={clientAvatarUrl || null} name={clientName} size={36} />
          <Text style={styles.heading}>{clientName}</Text>
        </View>
      ) : null}
      {messages.map((msg) => {
        const isStylist = msg.sender_role === 'stylist';
        const avatarUrl = isStylist ? lukePortraitUrl : clientAvatarUrl || null;
        const avatarName = isStylist ? MYSTIC_STYLIST.name : (clientName ?? 'Client');
        return (
          <View
            key={msg.id}
            style={[styles.msgRow, isStylist ? styles.msgRowStylist : styles.msgRowClient]}
          >
            <NativeUserAvatar url={avatarUrl} name={avatarName} size={28} />
            <View style={[styles.bubble, isStylist ? styles.luke : styles.client]}>
              <Text style={styles.role}>{messageSenderLabel(msg.sender_role, 'studio')}</Text>
              <Text style={styles.body}>{msg.body}</Text>
            </View>
          </View>
        );
      })}
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
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  heading: { fontWeight: '600', color: theme.ink, flex: 1 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  msgRowStylist: { flexDirection: 'row-reverse' },
  msgRowClient: { flexDirection: 'row' },
  bubble: { padding: 12, borderRadius: theme.radii.lg, maxWidth: '82%' },
  luke: { backgroundColor: theme.accentSoft },
  client: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
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
