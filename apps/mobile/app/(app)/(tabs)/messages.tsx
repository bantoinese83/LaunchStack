import React, { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MYSTIC_DEFAULT_WORKSPACE_ID } from '@template/mystic';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { NativeButton, displayTitle, monoLabel, theme } from '@template/mobile-ui';
import { NativeEmptyState } from '../../../components/mystic/NativeEmptyState';
import { fetchMessageThread, sendClientMessage } from '../../../lib/mysticApi';

type Message = {
  id: string;
  body: string;
  sender_role: string;
};

export default function MessagesTab() {
  const [body, setBody] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createSupabaseMobileClient();
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) return;
    const data = await fetchMessageThread(MYSTIC_DEFAULT_WORKSPACE_ID, userId);
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function send() {
    try {
      const data = await sendClientMessage(body, MYSTIC_DEFAULT_WORKSPACE_ID);
      if (data.error) setStatus(data.error);
      else {
        setStatus('Sent');
        setBody('');
        void load();
      }
    } catch {
      setStatus('Sign in and set EXPO_PUBLIC_APP_URL');
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Messages</Text>
      <Text style={styles.heading}>Chat with Luke</Text>
      {messages.length === 0 ? <NativeEmptyState variant="messages" compact /> : null}
      {messages.map((msg) => (
        <View
          key={msg.id}
          style={[
            styles.bubble,
            msg.sender_role === 'stylist' ? styles.bubbleLuke : styles.bubbleClient,
          ]}
        >
          <Text style={styles.role}>{msg.sender_role}</Text>
          <Text style={styles.body}>{msg.body}</Text>
        </View>
      ))}
      <View style={[styles.inputWrap, Platform.OS === 'android' && styles.inputAndroid]}>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Hey Luke…"
          multiline
          style={styles.input}
          placeholderTextColor={theme.muted}
        />
      </View>
      <NativeButton title="Send" onPress={send} />
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20 },
  kicker: { ...monoLabel, color: theme.plum },
  heading: { ...displayTitle, color: theme.ink, marginBottom: 12 },
  bubble: { padding: 12, borderRadius: theme.radii.md, marginBottom: 8 },
  bubbleLuke: { backgroundColor: theme.accentSoft },
  bubbleClient: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line },
  role: { fontSize: 10, textTransform: 'uppercase', color: theme.muted },
  body: { marginTop: 4, color: theme.ink },
  inputWrap: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    padding: 12,
    marginVertical: 16,
  },
  inputAndroid: { borderRadius: theme.radii.md },
  input: { minHeight: 100, color: theme.ink, textAlignVertical: 'top' },
  status: { marginTop: 12, color: theme.muted, fontSize: 13 },
});
