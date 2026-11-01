import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { partitionStudioBoardAppointments } from '@template/mystic';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { NativeSalonLoader } from '../mystic/NativeSalonLoader';
import { NativeStudioOps, type StudioAppointment, type StudioClientRow } from './NativeStudioOps';

type Props = {
  appointments: StudioAppointment[];
  clientsById: Record<string, StudioClientRow>;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onChanged: () => void;
  /** Parent owns empty-week copy (Road day brief) — render nothing when quiet. */
  hideWhenEmpty?: boolean;
};

export function NativeStudioBoard({
  appointments,
  clientsById,
  loading,
  error,
  onRefresh,
  onChanged,
  hideWhenEmpty = false,
}: Props) {
  const { today, upcoming } = useMemo(
    () => partitionStudioBoardAppointments(appointments),
    [appointments]
  );

  if (error) {
    return (
      <View style={styles.banner}>
        <Text style={styles.errorTitle}>Could not load the board</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <Text style={styles.errorHint}>
          Ensure the web app is running and EXPO_PUBLIC_APP_URL matches (simulator: localhost:3000;
          device: your Mac&apos;s LAN IP).
        </Text>
        <NativeButton title="Try again" onPress={onRefresh} style={styles.retryBtn} />
      </View>
    );
  }

  if (loading && appointments.length === 0) {
    return <NativeSalonLoader copyKey="board" style={{ marginVertical: 8 }} />;
  }

  const hasAny = today.length > 0 || upcoming.length > 0;
  if (!hasAny) {
    return hideWhenEmpty ? null : (
      <Text style={styles.mutedEmpty}>No stops this week — pull to refresh.</Text>
    );
  }

  return (
    <View style={styles.sections}>
      {today.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Today · {today.length}</Text>
          <NativeStudioOps appointments={today} clientsById={clientsById} onChanged={onChanged} />
        </View>
      ) : null}

      {upcoming.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Coming up · {upcoming.length}</Text>
          <NativeStudioOps
            appointments={upcoming}
            clientsById={clientsById}
            onChanged={onChanged}
            hideGlobalEta={today.length > 0}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sections: { gap: 20 },
  section: { gap: 8 },
  sectionLabel: { ...monoLabel, color: theme.plum, fontSize: 11 },
  mutedEmpty: { fontSize: 13, color: theme.muted, paddingVertical: 8 },
  loadingCard: {
    paddingVertical: 20,
    paddingHorizontal: 4,
    gap: 10,
  },
  loadingBar: {
    height: 10,
    borderRadius: 6,
    backgroundColor: theme.line,
    opacity: 0.7,
  },
  loadingBarShort: { width: '55%' },
  loading: { color: theme.muted, fontSize: 13, marginTop: 4 },
  banner: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
    gap: 8,
  },
  errorTitle: { fontWeight: '600', color: theme.ink },
  errorBody: { fontSize: 14, color: theme.danger },
  errorHint: { fontSize: 12, color: theme.muted, lineHeight: 18 },
  retryBtn: { marginTop: 8, alignSelf: 'stretch' },
});
