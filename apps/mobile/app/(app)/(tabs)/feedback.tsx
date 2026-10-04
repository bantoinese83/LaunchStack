import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FeedbackService, WorkspaceService } from '@template/api';
import { createSupabaseMobileClient } from '@template/api/mobile';
import type { FeedbackCategory, FeedbackPost, Workspace } from '@template/types';
import {
  NativeButton,
  NativeCard,
  NativeInput,
  displayTitle,
  monoLabel,
  theme,
} from '@template/mobile-ui';

export default function MobileFeedbackScreen() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createSupabaseMobileClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const workspaces = await new WorkspaceService(supabase).getUserWorkspaces(user.id);
    const selected = workspaces[0] ?? null;
    setWorkspace(selected);
    if (!selected) return;
    const feedback = await new FeedbackService(supabase).getWorkspaceFeedback(selected.id);
    setPosts(feedback);
  };

  useEffect(() => {
    void load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load feedback'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!workspace) return;
    setError(null);
    const supabase = createSupabaseMobileClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const category: FeedbackCategory = 'feature';
    await new FeedbackService(supabase).createFeedbackPost(
      workspace.id,
      user.id,
      title,
      description,
      category
    );
    setTitle('');
    setDescription('');
    await load();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Roadmap</Text>
      <Text style={styles.heading}>Feedback</Text>
      {loading ? <ActivityIndicator color={theme.accent} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <NativeCard style={styles.card}>
        <NativeInput label="Title" value={title} onChangeText={setTitle} />
        <NativeInput label="Description" value={description} onChangeText={setDescription} />
        <NativeButton title="Submit idea" onPress={() => void submit()} />
      </NativeCard>
      {posts.map((post) => (
        <NativeCard key={post.id} style={styles.card}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postBody}>{post.description}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{post.status}</Text>
            <Text style={styles.metaText}>{post.upvotes_count} votes</Text>
          </View>
        </NativeCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: 40 },
  kicker: { ...monoLabel, color: theme.accent, marginBottom: 8 },
  heading: { ...displayTitle, color: theme.ink, marginBottom: 16 },
  error: { color: theme.accent, marginBottom: 12 },
  card: { marginBottom: 12 },
  postTitle: { color: theme.ink, fontWeight: '600', fontSize: 16 },
  postBody: { color: theme.muted, marginTop: 6 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaText: { ...monoLabel, color: theme.muted },
});
