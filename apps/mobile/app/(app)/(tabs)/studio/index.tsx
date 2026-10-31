import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { studioWeekBoardRangeIso } from '@template/mystic';
import { theme } from '@template/mobile-ui';
import { NativeScreenHeader } from '../../../../components/mystic/NativeScreenHeader';
import { NativeStudioBoard } from '../../../../components/studio/NativeStudioBoard';
import { NativeStudioTodayMap } from '../../../../components/studio/NativeStudioTodayMap';
import {
  type StudioAppointment,
  type StudioClientRow,
} from '../../../../components/studio/NativeStudioOps';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import { MYSTIC_TAB_BAR_SCROLL_PADDING } from '../../../../components/navigation/mysticTabBarIcon';
import { fetchStudioAppointments, fetchStudioClients } from '../../../../lib/studioApi';

export default function StudioHomeScreen() {
  const router = useRouter();
  const { workspaceId } = useStudioAccess();
  const [appointments, setAppointments] = useState<StudioAppointment[]>([]);
  const [clientsById, setClientsById] = useState<Record<string, StudioClientRow>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: { pull?: boolean }) => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }
      if (opts?.pull) setRefreshing(true);
      else setLoading(true);

      const { from, to } = studioWeekBoardRangeIso();
      try {
        const [apptData, clientData] = await Promise.all([
          fetchStudioAppointments(workspaceId, from, to),
          fetchStudioClients(workspaceId),
        ]);

        if (!apptData.ok) {
          setError(
            apptData.error ??
              (apptData.status === 403
                ? 'Studio access denied — add Luke as workspace admin.'
                : `Could not load appointments (${apptData.status})`)
          );
          setAppointments([]);
        } else {
          setError(null);
          setAppointments((apptData.appointments ?? []) as StudioAppointment[]);
        }

        const map: Record<string, StudioClientRow> = {};
        for (const c of (clientData.clients ?? []) as StudioClientRow[]) {
          map[c.user_id] = c;
        }
        setClientsById(map);
      } catch {
        setError('Network error — is the web API running?');
        setAppointments([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [workspaceId]
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void load({ pull: true })}
          tintColor={theme.accent}
        />
      }
    >
      <NativeScreenHeader
        kicker="Studio · Today"
        title="House calls"
        lede="This week — en route, door timer, complete, or no-show."
      />

      {workspaceId ? (
        <NativeStudioTodayMap
          workspaceId={workspaceId}
          appointments={appointments}
          clientsById={clientsById}
        />
      ) : null}

      <NativeStudioBoard
        appointments={appointments}
        clientsById={clientsById}
        loading={loading}
        error={error}
        onRefresh={() => void load()}
        onChanged={() => void load({ pull: true })}
      />

      <View style={styles.links}>
        <LinkRow
          label="Calendar & reschedule"
          onPress={() => router.push('/(app)/(tabs)/studio/calendar')}
        />
        <LinkRow
          label="Client list & messages"
          onPress={() => router.push('/(app)/(tabs)/studio/clients')}
        />
        <LinkRow
          label="Referrals by month"
          onPress={() => router.push('/(app)/(tabs)/studio/referrals')}
        />
        <LinkRow
          label="Blocked dates"
          onPress={() => router.push('/(app)/(tabs)/studio/blocked')}
        />
        <LinkRow
          label="Blasts (all segments)"
          onPress={() => router.push('/(app)/(tabs)/studio/blasts')}
        />
        <LinkRow
          label="Deposits & surcharges"
          onPress={() => router.push('/(app)/(tabs)/studio/settings')}
        />
        <LinkRow
          label="Analytics & winter buffer"
          onPress={() => router.push('/(app)/(tabs)/studio/more')}
        />
      </View>
    </ScrollView>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.link}>
      <Text style={styles.linkText}>{label}</Text>
      <Text style={styles.chevron}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: MYSTIC_TAB_BAR_SCROLL_PADDING + 24 },
  links: { marginTop: 28, gap: 0 },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
  linkText: { fontWeight: '500', color: theme.ink, flex: 1 },
  chevron: { color: theme.muted, marginLeft: 8 },
});
