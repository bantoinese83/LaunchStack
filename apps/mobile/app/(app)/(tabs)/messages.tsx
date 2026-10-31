import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CLIENT_MESSAGE_QUICK_REPLIES,
  MYSTIC_DEFAULT_WORKSPACE_ID,
  MYSTIC_STYLIST,
  formatMessageTimestamp,
  messageSenderLabel,
  mysticStylistPortraitUrl,
} from '@template/mystic';
import { useRouter } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { NativeButton, theme } from '@template/mobile-ui';
import { NativeEmptyState } from '../../../components/mystic/NativeEmptyState';
import { NativeScreenHeader } from '../../../components/mystic/NativeScreenHeader';
import { nativeScreenStyles } from '../../../components/mystic/nativeScreenStyles';
import { fetchClientProfile, fetchMessageThread, sendClientMessage } from '../../../lib/mysticApi';
import { NativeUserAvatar } from '../../../components/mystic/NativeUserAvatar';

type Message = {
  id: string;
  body: string;
  sender_role: string;
  created_at: string;
};

const POLL_MS = 18_000;
const lukePortraitUrl = mysticStylistPortraitUrl(process.env.EXPO_PUBLIC_APP_URL);
const KEYBOARD_OFFSET = Platform.OS === 'ios' ? 92 : 0;

export default function MessagesTab() {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [clientAvatarUrl, setClientAvatarUrl] = useState<string | null>(null);
  const [clientDisplayName, setClientDisplayName] = useState('You');
  const scrollRef = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    const supabase = createSupabaseMobileClient();
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;
    if (!userId) {
      setNeedsSignIn(true);
      setLoadError(null);
      setMessages([]);
      return;
    }
    setNeedsSignIn(false);
    void fetchClientProfile()
      .then((prof) => {
        const p = prof.profile;
        if (p) {
          setClientAvatarUrl(p.avatar_url ?? null);
          setClientDisplayName(p.full_name ?? p.email ?? 'You');
        }
      })
      .catch(() => {
        /* optional */
      });
    const data = await fetchMessageThread(MYSTIC_DEFAULT_WORKSPACE_ID, userId);
    if (data.status === 401) {
      setNeedsSignIn(true);
      setLoadError('Sign in to message Luke');
      return;
    }
    if (!data.ok) {
      setLoadError(data.error ?? 'Could not load messages');
      return;
    }
    setLoadError(null);
    setMessages((data.messages ?? []) as Message[]);
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void load();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [load]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  async function send() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setStatus(null);
    try {
      const data = await sendClientMessage(trimmed.slice(0, 4000), MYSTIC_DEFAULT_WORKSPACE_ID);
      if (data.status === 401) {
        setStatus('Sign in to send messages');
        return;
      }
      if (data.error || !data.ok) setStatus(data.error ?? 'Send failed');
      else {
        setStatus('Sent');
        setBody('');
        void load();
      }
    } catch {
      setStatus('Sign in and set EXPO_PUBLIC_APP_URL');
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={KEYBOARD_OFFSET}
    >
      <ScrollView
        ref={scrollRef}
        style={nativeScreenStyles.scroll}
        contentContainerStyle={[nativeScreenStyles.container, styles.scrollContent]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={nativeScreenStyles.stack}>
          <NativeScreenHeader kicker="Messages" title="Chat with Luke" />
          {needsSignIn ? (
            <View style={styles.signInBlock}>
              <Text style={styles.loadError}>Sign in to chat with Luke.</Text>
              <NativeButton title="Sign in" onPress={() => router.push('/(auth)/login')} />
            </View>
          ) : loadError ? (
            <Text style={styles.loadError}>{loadError}</Text>
          ) : null}
          {messages.length === 0 && !loadError && !needsSignIn ? (
            <NativeEmptyState
              variant="messages"
              compact
              action={
                <View style={styles.emptyStarters}>
                  {CLIENT_MESSAGE_QUICK_REPLIES.slice(0, 3).map((q) => (
                    <Pressable
                      key={q}
                      onPress={() => setBody(q)}
                      style={styles.emptyChip}
                      accessibilityRole="button"
                      accessibilityLabel={`Start with: ${q}`}
                    >
                      <Text style={styles.emptyChipText}>{q}</Text>
                    </Pressable>
                  ))}
                </View>
              }
            />
          ) : null}
          {messages.map((msg) => {
            const isSelf = msg.sender_role !== 'stylist';
            const avatarUrl = isSelf ? clientAvatarUrl : lukePortraitUrl;
            const avatarName = isSelf ? clientDisplayName : MYSTIC_STYLIST.name;
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isSelf ? styles.msgRowSelf : styles.msgRowLuke]}
              >
                <NativeUserAvatar url={avatarUrl} name={avatarName} size={28} />
                <View style={[styles.row, isSelf ? styles.rowSelf : styles.rowLuke]}>
                  <View style={[styles.bubble, isSelf ? styles.bubbleClient : styles.bubbleLuke]}>
                    <Text style={[styles.role, isSelf && styles.roleOnAccent]}>
                      {messageSenderLabel(msg.sender_role, 'client')}
                    </Text>
                    <Text style={[styles.body, isSelf && styles.bodyOnAccent]}>{msg.body}</Text>
                  </View>
                  <Text style={styles.time}>{formatMessageTimestamp(msg.created_at)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.composer}>
        <View style={styles.quickRow}>
          {CLIENT_MESSAGE_QUICK_REPLIES.map((q) => (
            <Pressable
              key={q}
              onPress={() => setBody((b) => (b ? `${b} ${q}` : q))}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{q}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.inputWrap, Platform.OS === 'android' && styles.inputAndroid]}>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Hey Luke…"
            multiline
            style={styles.input}
            placeholderTextColor={theme.muted}
            maxLength={4000}
          />
        </View>
        <NativeButton
          title={sending ? 'Sending…' : 'Send'}
          onPress={send}
          disabled={sending || !body.trim()}
        />
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.paper },
  scrollContent: { paddingBottom: 12 },
  composer: {
    borderTopWidth: 2,
    borderTopColor: theme.gold,
    backgroundColor: theme.paper,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
    maxWidth: '100%',
  },
  msgRowSelf: { flexDirection: 'row-reverse' },
  msgRowLuke: { flexDirection: 'row' },
  row: { maxWidth: '88%' },
  rowSelf: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  rowLuke: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { padding: 12, borderRadius: theme.radii.sm },
  bubbleLuke: { backgroundColor: theme.chalkSoft, borderLeftWidth: 3, borderLeftColor: theme.plum },
  bubbleClient: {
    backgroundColor: theme.accentSoft,
    borderLeftWidth: 3,
    borderLeftColor: theme.accent,
  },
  role: { fontSize: 10, textTransform: 'uppercase', color: theme.muted, marginBottom: 4 },
  roleOnAccent: { color: theme.plum },
  body: { color: theme.ink },
  bodyOnAccent: { color: theme.ink },
  time: { fontSize: 10, color: theme.muted, marginTop: 4 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.paper,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 11, color: theme.ink },
  inputWrap: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.paper,
    padding: 12,
    marginBottom: 10,
  },
  inputAndroid: { borderRadius: theme.radii.md },
  input: { minHeight: 72, maxHeight: 120, color: theme.ink, textAlignVertical: 'top' },
  status: { marginTop: 8, color: theme.muted, fontSize: 13 },
  loadError: { color: theme.plum, fontSize: 14, marginBottom: 12 },
  signInBlock: { gap: 12, marginBottom: 12 },
  emptyStarters: { width: '100%', gap: 8 },
  emptyChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    borderLeftWidth: 3,
    borderLeftColor: theme.plum,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: theme.radii.sm,
  },
  emptyChipText: { fontSize: 14, color: theme.ink, lineHeight: 20 },
});
