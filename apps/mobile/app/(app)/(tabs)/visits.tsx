import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatUsd, getServiceById, type ServiceId } from '@template/mystic';
import { displayTitle, monoLabel, theme } from '@template/mobile-ui';
import { fetchMyAppointments } from '../../../lib/mysticApi';

type Appointment = {
  id: string;
  starts_at: string;
  service_id: string;
  status: string;
  quote_cents: number;
  eta_minutes: number | null;
};

const STATUS_LABEL: Record<string, string> = {
  stylist_en_route: 'Luke is on the way',
  door_timer_active: 'Door timer active',
  confirmed: 'Confirmed',
};

export default function VisitsTab() {
  const [rows, setRows] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchMyAppointments()
      .then((data) => {
        if (data.error) setError(data.error);
        else setRows(data.appointments ?? []);
      })
      .catch(() => setError('Sign in to see visits'));
  }, []);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Visits</Text>
      <Text style={styles.heading}>Your appointments</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {rows.map((visit) => {
        let name = visit.service_id;
        try {
          name = getServiceById(visit.service_id as ServiceId).name;
        } catch {
          /* keep id */
        }
        return (
          <View
            key={visit.id}
            style={[styles.card, Platform.OS === 'android' && styles.cardAndroid]}
          >
            <Text style={styles.when}>{new Date(visit.starts_at).toLocaleString()}</Text>
            <Text style={styles.service}>{name}</Text>
            <Text style={styles.status}>
              {STATUS_LABEL[visit.status] ?? visit.status}
              {visit.eta_minutes ? ` · ~${visit.eta_minutes} min` : ''}
            </Text>
            <Text style={styles.price}>{formatUsd(visit.quote_cents)}</Text>
          </View>
        );
      })}
      {rows.length === 0 && !error ? (
        <Text style={styles.empty}>No upcoming visits. Book from the Book tab.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20 },
  kicker: { ...monoLabel, color: theme.accent },
  heading: { ...displayTitle, color: theme.ink, marginBottom: 16 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: theme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.line,
    marginBottom: 12,
  },
  cardAndroid: { borderRadius: theme.radii.md, elevation: 1 },
  when: { fontWeight: '600', color: theme.ink },
  service: { marginTop: 4, color: theme.muted },
  status: { marginTop: 8, fontSize: 12, color: theme.chalk },
  price: { marginTop: 4, fontWeight: '600' },
  empty: { color: theme.muted },
  error: { color: theme.danger, marginBottom: 12 },
});
