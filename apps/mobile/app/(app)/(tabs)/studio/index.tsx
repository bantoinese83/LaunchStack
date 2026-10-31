import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { displayTitle, monoLabel, theme } from '@template/mobile-ui';
import {
  NativeStudioOps,
  type StudioAppointment,
} from '../../../../components/studio/NativeStudioOps';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import { fetchStudioAppointments } from '../../../../lib/studioApi';

export default function StudioHomeScreen() {
  const router = useRouter();
  const { workspaceId } = useStudioAccess();
  const [appointments, setAppointments] = useState<StudioAppointment[]>([]);

  const load = useCallback(() => {
    if (!workspaceId) return;
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    void fetchStudioAppointments(workspaceId, from.toISOString(), to.toISOString()).then((data) => {
      setAppointments(data.appointments ?? []);
    });
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Today</Text>
      <Text style={styles.heading}>House calls</Text>
      <Text style={styles.sub}>En route, door timer, complete, or no-show.</Text>

      <NativeStudioOps appointments={appointments} onChanged={load} />

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
  container: { padding: 20, paddingBottom: 40 },
  kicker: { ...monoLabel, color: theme.accent },
  heading: { ...displayTitle, color: theme.ink, marginTop: 4 },
  sub: { color: theme.muted, fontSize: 14, marginBottom: 16 },
  links: { marginTop: 24, gap: 8 },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  linkText: { fontWeight: '500', color: theme.ink },
  chevron: { color: theme.muted },
});
