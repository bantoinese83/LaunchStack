import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { partitionStudioBoardAppointments } from '@template/mystic';
import { monoLabel, theme } from '@template/mobile-ui';
import { NativeEmptyState } from '../mystic/NativeEmptyState';
import { NativeStudioOps, type StudioAppointment, type StudioClientRow } from './NativeStudioOps';

type Props = {
  appointments: StudioAppointment[];
  clientsById: Record<string, StudioClientRow>;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onChanged: () => void;
};

export function NativeStudioBoard({
  appointments,
  clientsById,
  loading,
  error,
  onRefresh,
  onChanged,
}: Props) {
  const router = useRouter();
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
        <Pressable onPress={onRefresh} style={styles.retry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (loading && appointments.length === 0) {
    return <Text style={styles.loading}>Loading house calls…</Text>;
  }

  const hasAny = today.length > 0 || upcoming.length > 0;

  if (!hasAny) {
    return (
      <View>
        <NativeEmptyState variant="studio-ops" compact />
        <Pressable
          onPress={() => router.push('/(app)/(tabs)/studio/calendar')}
          style={styles.calendarLink}
        >
          <Text style={styles.calendarLinkText}>Open calendar (7-day view)</Text>
        </Pressable>
        <Pressable onPress={onRefresh} style={styles.retryOutline}>
          <Text style={styles.retryOutlineText}>Refresh board</Text>
        </Pressable>
      </View>
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
  loading: { color: theme.muted, fontSize: 14, marginBottom: 12 },
  banner: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
    gap: 8,
  },
  errorTitle: { fontWeight: '600', color: theme.ink },
  errorBody: { fontSize: 14, color: theme.danger },
  errorHint: { fontSize: 12, color: theme.muted, lineHeight: 18 },
  retry: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.accent,
  },
  retryText: { color: theme.paper, fontWeight: '600', fontSize: 14 },
  retryOutline: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryOutlineText: { color: theme.accent, fontWeight: '600', fontSize: 14 },
  calendarLink: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  calendarLinkText: {
    color: theme.accent,
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
