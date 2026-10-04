import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FeedbackService, SubscriptionService, WorkspaceService } from '@template/api';
import { createSupabaseMobileClient } from '@template/api/mobile';
import type { Subscription, Workspace } from '@template/types';
import { NativeButton, NativeCard, displayTitle, monoLabel, theme } from '@template/mobile-ui';

export default function MobileHomeScreen() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const supabase = createSupabaseMobileClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/(auth)/login');
          return;
        }
        const workspaceService = new WorkspaceService(supabase);
        const userWorkspaces = await workspaceService.getUserWorkspaces(user.id);
        setWorkspaces(userWorkspaces);
        const selected = userWorkspaces[0] ?? null;
        if (!selected) {
          if (!cancelled) {
            setWorkspace(null);
            setLoading(false);
          }
          return;
        }
        if (cancelled) return;
        setWorkspace(selected);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load workspace');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!workspace) return;
    let cancelled = false;
    void (async () => {
      try {
        const supabase = createSupabaseMobileClient();
        const workspaceService = new WorkspaceService(supabase);
        const [members, feedback, sub] = await Promise.all([
          workspaceService.getWorkspaceMembers(workspace.id),
          new FeedbackService(supabase).getWorkspaceFeedback(workspace.id),
          new SubscriptionService(supabase).getWorkspaceSubscription(workspace.id),
        ]);
        if (cancelled) return;
        setMemberCount(members.length);
        setFeedbackCount(feedback.length);
        setSubscription(sub);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load workspace');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspace]);

  const handleSignOut = async () => {
    const supabase = createSupabaseMobileClient();
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Workspace</Text>
      <Text style={styles.heading}>{workspace?.name || 'Overview'}</Text>
      {workspaces.length > 1 ? (
        <View style={styles.switcher}>
          {workspaces.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setWorkspace(item)}
              style={[styles.chip, workspace?.id === item.id ? styles.chipActive : null]}
            >
              <Text style={styles.chipText}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <Text style={styles.lede}>
        {workspace
          ? `${workspace.slug} — live seats, roadmap, and billing from the same APIs as web.`
          : 'Sign in to a workspace to see live mobile data.'}
      </Text>

      {loading ? <ActivityIndicator color={theme.accent} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <NativeCard style={styles.metricCard}>
        <View style={styles.accentBar}>
          <View style={styles.accentBarTop} />
          <View style={styles.accentBarBottom} />
        </View>
        <Text style={styles.metricLabel}>Active Plan</Text>
        <Text style={styles.metricValue}>{subscription?.status || 'Not subscribed'}</Text>
        <Text style={styles.metricSub}>
          {subscription?.current_period_end
            ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
            : 'Checkout from the web dashboard'}
        </Text>
      </NativeCard>

      <NativeCard style={styles.metricCard}>
        <View style={styles.accentBar}>
          <View style={styles.accentBarTop} />
          <View style={styles.accentBarBottom} />
        </View>
        <Text style={styles.metricLabel}>Team Members</Text>
        <Text style={styles.metricValue}>{memberCount}</Text>
        <Text style={styles.metricSub}>Loaded from workspace_members</Text>
      </NativeCard>

      <NativeCard style={styles.metricCard}>
        <View style={styles.accentBar}>
          <View style={styles.accentBarTop} />
          <View style={styles.accentBarBottom} />
        </View>
        <Text style={styles.metricLabel}>Roadmap</Text>
        <Text style={styles.metricValue}>{feedbackCount} posts</Text>
        <Text style={styles.metricSub}>Live feedback_posts for this workspace</Text>
      </NativeCard>

      <NativeButton
        title="Sign out"
        variant="outline"
        onPress={handleSignOut}
        style={styles.signOut}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: theme.paper,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  kicker: {
    ...monoLabel,
    color: theme.accent,
    marginBottom: 8,
  },
  heading: {
    ...displayTitle,
    color: theme.ink,
  },
  lede: {
    color: theme.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 22,
    letterSpacing: -0.2,
  },
  error: {
    color: theme.accent,
    marginBottom: 12,
  },
  metricCard: {
    marginBottom: 12,
    overflow: 'hidden',
    paddingLeft: 18,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    overflow: 'hidden',
  },
  accentBarTop: {
    flex: 1,
    backgroundColor: theme.accent,
  },
  accentBarBottom: {
    flex: 1,
    backgroundColor: theme.chalk,
  },
  metricLabel: {
    ...monoLabel,
    color: theme.muted,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  metricValue: {
    color: theme.ink,
    fontSize: 24,
    fontWeight: '500',
    marginVertical: 6,
    letterSpacing: -0.4,
  },
  metricSub: {
    color: theme.chalk,
    fontSize: 12,
    fontWeight: '600',
  },
  signOut: {
    marginTop: 16,
  },
  switcher: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderColor: theme.line ?? '#e4e2dc',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: theme.shell,
  },
  chipText: {
    color: theme.ink,
    fontSize: 12,
  },
});
