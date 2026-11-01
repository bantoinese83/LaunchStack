import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  buildStudioRoadBrief,
  partitionStudioBoardAppointments,
  studioWeekBoardRangeIso,
} from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';
import { NativeStudioBoard } from '../../../../components/studio/NativeStudioBoard';
import { NativeQuietBoard } from '../../../../components/studio/NativeQuietBoard';
import { NativeStudioRoadBrief } from '../../../../components/studio/NativeStudioRoadBrief';
import { NativeStudioTodayMap } from '../../../../components/studio/NativeStudioTodayMap';
import {
  type StudioAppointment,
  type StudioClientRow,
} from '../../../../components/studio/NativeStudioOps';
import { NativeSalonLoader } from '../../../../components/mystic/NativeSalonLoader';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import { MYSTIC_TAB_BAR_SCROLL_PADDING } from '../../../../components/navigation/mysticTabBarIcon';
import { fetchStudioAppointments, fetchStudioClients } from '../../../../lib/studioApi';

export default function StudioHomeScreen() {
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

  const { today, upcoming } = useMemo(
    () => partitionStudioBoardAppointments(appointments),
    [appointments]
  );
  const hasBoard = today.length > 0 || upcoming.length > 0;

  const brief = useMemo(() => {
    const names: Record<string, string | null | undefined> = {};
    for (const [id, row] of Object.entries(clientsById)) {
      names[id] = row.full_name;
    }
    return buildStudioRoadBrief(appointments, names);
  }, [appointments, clientsById]);

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
      <NativeStudioRoadBrief brief={brief} />

      {workspaceId && hasBoard ? (
        <NativeStudioTodayMap
          workspaceId={workspaceId}
          appointments={appointments}
          clientsById={clientsById}
        />
      ) : null}

      <View style={styles.boardBlock}>
        {loading && !hasBoard && !error ? (
          <NativeSalonLoader copyKey="board" style={{ paddingVertical: 16 }} />
        ) : null}

        {error ? (
          <NativeStudioBoard
            appointments={appointments}
            clientsById={clientsById}
            loading={loading}
            error={error}
            onRefresh={() => void load()}
            onChanged={() => void load({ pull: true })}
          />
        ) : null}

        {hasBoard ? (
          <>
            <Text style={styles.boardKicker}>Stops</Text>
            <NativeStudioBoard
              appointments={appointments}
              clientsById={clientsById}
              loading={loading}
              error={null}
              onRefresh={() => void load()}
              onChanged={() => void load({ pull: true })}
            />
          </>
        ) : null}

        {!loading && !error && !hasBoard ? <NativeQuietBoard /> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: MYSTIC_TAB_BAR_SCROLL_PADDING + 24 },
  boardBlock: { marginTop: 8, gap: 10 },
  boardKicker: { ...monoLabel, color: theme.plum, fontSize: 10, marginTop: 8 },
  loadingPad: { paddingVertical: 28, alignItems: 'center' },
});
