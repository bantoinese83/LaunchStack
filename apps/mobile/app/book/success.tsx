import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MYSTIC_SERVICES,
  formatVisitWhen,
  getCelebrationContent,
  type ServiceId,
} from '@template/mystic';
import { NativeButton, theme } from '@template/mobile-ui';
import { NativeCelebrationBurst } from '../../components/mystic/NativeCelebrationBurst';
import { NativeScreenShell } from '../../components/mystic/NativeScreenShell';
import { fetchMyAppointments } from '../../lib/mysticApi';
import { lukeCutoutSource } from '../../lib/lukeAssets';
import { clearReferralAttribution } from '../../lib/referral-storage';

export default function BookSuccessDeepLink() {
  const router = useRouter();
  const params = useLocalSearchParams<{ appointment_id?: string }>();
  const appointmentId = params.appointment_id?.toString();
  const copy = getCelebrationContent('booking');
  const [celebrate] = useState(true);
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    void clearReferralAttribution();
  }, []);

  useEffect(() => {
    if (!appointmentId) return;
    void fetchMyAppointments().then((data) => {
      const rows = (data.appointments ?? []) as {
        id: string;
        service_id: string;
        starts_at: string;
      }[];
      const row = rows.find((a) => a.id === appointmentId);
      if (!row) return;
      const name =
        MYSTIC_SERVICES.find((s) => s.id === (row.service_id as ServiceId))?.name ?? 'House call';
      setDetail(`${name} · ${formatVisitWhen(row.starts_at)}`);
    });
  }, [appointmentId]);

  const subtitle = useMemo(() => detail ?? copy.body, [detail, copy.body]);

  return (
    <NativeScreenShell>
      <NativeCelebrationBurst fire={celebrate} />
      <View style={styles.center}>
        <Image source={lukeCutoutSource} style={styles.lukeCutout} accessibilityLabel="Luke" />
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.body}>{subtitle}</Text>
        <NativeButton
          title="View my visits"
          onPress={() => router.replace('/(app)/(tabs)/visits')}
          style={styles.cta}
        />
        <NativeButton
          title="Book another"
          variant="outline"
          onPress={() => router.replace('/(app)/(tabs)/book')}
          style={styles.ctaSecondary}
        />
      </View>
    </NativeScreenShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 48 },
  lukeCutout: {
    width: 200,
    height: 260,
    alignSelf: 'center',
    marginBottom: 8,
    resizeMode: 'contain',
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: theme.success,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.ink,
    textAlign: 'center',
    marginTop: 8,
  },
  body: { fontSize: 15, lineHeight: 22, color: theme.muted, textAlign: 'center', marginTop: 12 },
  cta: { marginTop: 28 },
  ctaSecondary: { marginTop: 10 },
});
