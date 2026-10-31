import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import {
  formatVisitWhen,
  getServiceById,
  visitStatusLabel,
  type ServiceId,
} from '@template/mystic';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { NativeEmptyState } from '../mystic/NativeEmptyState';
import { shareStylistLocation, studioPost } from '../../lib/studioApi';

export type StudioAppointment = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  client_user_id: string;
};

export function NativeStudioOps({
  appointments,
  onChanged,
}: {
  appointments: StudioAppointment[];
  onChanged: () => void;
}) {
  const [eta, setEta] = useState('20');
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function readCoords() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  }

  async function enRoute(id: string) {
    setBusyId(id);
    setMessage(null);
    const coords = await readCoords();
    const body: Record<string, unknown> = {
      appointmentId: id,
      etaMinutes: Number(eta) || 20,
    };
    if (coords) {
      body.latitude = coords.latitude;
      body.longitude = coords.longitude;
    }
    const result = (await studioPost('/api/mystic/appointments/en-route', body)) as {
      ok: boolean;
      error?: string;
    };
    setBusyId(null);
    if (!result.ok) {
      setMessage(result.error ?? 'Failed');
      return;
    }
    setMessage(
      coords ? 'On the way + live map shared' : 'On the way (enable location to share map)'
    );
    onChanged();
  }

  async function shareLive(id: string) {
    setBusyId(id);
    const coords = await readCoords();
    if (!coords) {
      setBusyId(null);
      setMessage('Allow location to share live map');
      return;
    }
    const result = await shareStylistLocation(id, coords.latitude, coords.longitude);
    setBusyId(null);
    setMessage(result.ok ? 'Location updated' : (result.error ?? 'Update failed'));
    onChanged();
  }

  async function run(id: string, path: string, body: Record<string, unknown>, success: string) {
    setBusyId(id);
    setMessage(null);
    const result = (await studioPost(path, body)) as { ok: boolean; error?: string };
    setBusyId(null);
    if (!result.ok) {
      setMessage(result.error ?? 'Action failed');
      return;
    }
    setMessage(success);
    onChanged();
  }

  if (appointments.length === 0) {
    return <NativeEmptyState variant="studio-ops" compact />;
  }

  return (
    <View style={styles.wrap}>
      {message ? <Text style={styles.status}>{message}</Text> : null}
      <Text style={styles.label}>ETA (minutes)</Text>
      <TextInput value={eta} onChangeText={setEta} keyboardType="number-pad" style={styles.input} />
      {appointments.map((row) => {
        let serviceName = row.service_id.replace(/_/g, ' ');
        try {
          serviceName = getServiceById(row.service_id as ServiceId).name;
        } catch {
          /* keep id */
        }
        const isEnRoute = row.status === 'stylist_en_route';
        return (
          <View key={row.id} style={styles.card}>
            <Text style={styles.title}>{serviceName}</Text>
            <Text style={styles.meta}>
              {formatVisitWhen(row.starts_at)} · {visitStatusLabel(row.status)}
            </Text>
            <View style={styles.actions}>
              <NativeButton
                title="On the way"
                onPress={() => void enRoute(row.id)}
                isLoading={busyId === row.id}
                style={styles.actionBtn}
              />
              <NativeButton
                title={isEnRoute ? 'Update live map' : 'Live map (after on the way)'}
                variant="outline"
                disabled={!isEnRoute}
                onPress={() => void shareLive(row.id)}
                isLoading={busyId === row.id}
                style={styles.actionBtn}
              />
              <NativeButton
                title="Door timer"
                variant="secondary"
                onPress={() =>
                  void run(
                    row.id,
                    '/api/mystic/appointments/door-timer',
                    { appointmentId: row.id },
                    'Door timer started'
                  )
                }
                isLoading={busyId === row.id}
                style={styles.actionBtn}
              />
              <NativeButton
                title="Complete"
                variant="outline"
                onPress={() =>
                  void run(
                    row.id,
                    '/api/mystic/appointments/complete',
                    { appointmentId: row.id },
                    'Visit complete'
                  )
                }
                isLoading={busyId === row.id}
                style={styles.actionBtn}
              />
              <NativeButton
                title="No-show"
                variant="danger"
                onPress={() =>
                  void run(
                    row.id,
                    '/api/mystic/appointments/no-show',
                    { appointmentId: row.id },
                    'No-show recorded'
                  )
                }
                isLoading={busyId === row.id}
                style={styles.actionBtn}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  empty: { color: theme.muted, fontSize: 14 },
  status: { color: theme.chalk, fontSize: 13 },
  label: { ...monoLabel, color: theme.muted, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    padding: 12,
    marginBottom: 8,
    color: theme.ink,
    backgroundColor: theme.surface,
  },
  card: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    padding: 14,
    backgroundColor: theme.surface,
  },
  title: { fontWeight: '600', color: theme.ink, textTransform: 'capitalize' },
  meta: { marginTop: 4, fontSize: 13, color: theme.muted },
  actions: { marginTop: 12, gap: 8 },
  actionBtn: { width: '100%' },
});
