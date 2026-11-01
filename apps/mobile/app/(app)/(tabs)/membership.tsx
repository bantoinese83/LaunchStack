import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MYSTIC_MEMBERSHIPS,
  MYSTIC_PACKAGES,
  formatUsd,
  getCelebrationContent,
  type MysticCelebrationKind,
} from '@template/mystic';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { NativeCelebrationBurst } from '../../../components/mystic/NativeCelebrationBurst';
import { NativeScreenHeader } from '../../../components/mystic/NativeScreenHeader';
import { NativeScreenShell } from '../../../components/mystic/NativeScreenShell';
import { openStripeCheckoutSession } from '../../../lib/openStripeCheckout';
import { startMembershipCheckout, startPackageCheckout } from '../../../lib/mysticApi';

export default function MembershipTab() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    success?: string;
    canceled?: string;
    kind?: string;
    id?: string;
  }>();
  const [status, setStatus] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  const successKind = useMemo((): MysticCelebrationKind | null => {
    if (params.success !== '1') return null;
    if (params.kind === 'package') return 'package';
    if (params.kind === 'membership') return 'membership';
    return 'membership';
  }, [params.success, params.kind]);

  const celebration = successKind ? getCelebrationContent(successKind, params.id) : null;

  useEffect(() => {
    if (params.success === '1') {
      setCelebrate(true);
      setBurstKey((k) => k + 1);
      setStatus(null);
    } else if (params.canceled === '1') {
      setCelebrate(false);
      setStatus('Checkout canceled — no charge. Tap Subscribe or Buy when you are ready.');
    }
  }, [params.success, params.canceled]);

  const clearCelebrationParams = useCallback(() => {
    setCelebrate(false);
    router.replace('/(app)/(tabs)/membership');
  }, [router]);

  async function subscribe(id: string) {
    try {
      const data = await startMembershipCheckout(id);
      if (!data.url) {
        setStatus(data.error ?? 'Checkout unavailable');
        return;
      }
      const session = await openStripeCheckoutSession(data.url, 'mystichair://membership');
      if (session.ok && session.url.includes('success=1')) {
        router.replace({
          pathname: '/(app)/(tabs)/membership',
          params: { success: '1', kind: 'membership', id },
        });
      } else if (!session.ok && session.reason === 'cancel') {
        setStatus('Checkout canceled — no charge.');
      }
    } catch {
      setStatus('Sign in on web or configure EXPO_PUBLIC_APP_URL');
    }
  }

  async function buyPackage(id: string) {
    try {
      const data = await startPackageCheckout(id);
      if (!data.url) {
        setStatus(data.error ?? 'Checkout unavailable');
        return;
      }
      const session = await openStripeCheckoutSession(data.url, 'mystichair://membership');
      if (session.ok && session.url.includes('success=1')) {
        router.replace({
          pathname: '/(app)/(tabs)/membership',
          params: { success: '1', kind: 'package', id },
        });
      } else if (!session.ok && session.reason === 'cancel') {
        setStatus('Checkout canceled — no charge.');
      }
    } catch {
      setStatus('Sign in and set EXPO_PUBLIC_APP_URL');
    }
  }

  return (
    <NativeScreenShell>
      <NativeCelebrationBurst fire={celebrate} burstKey={burstKey} />
      <NativeScreenHeader
        kicker="Plans"
        title="Memberships & packages"
        lede="Monthly Glow & Luxe and prepaid blowout packs — credits apply at checkout."
      />
      {celebration ? (
        <View style={styles.successCard}>
          <Text style={styles.successEyebrow}>{celebration.eyebrow}</Text>
          <Text style={styles.successTitle}>{celebration.title}</Text>
          <Text style={styles.successBody}>{celebration.body}</Text>
          <NativeButton title="Book a blowout" onPress={() => router.push('/(app)/(tabs)/book')} />
          <NativeButton
            title="Dismiss"
            variant="outline"
            onPress={clearCelebrationParams}
            style={styles.dismiss}
          />
        </View>
      ) : null}
      {MYSTIC_MEMBERSHIPS.map((plan) => (
        <View key={plan.id} style={[styles.card, Platform.OS === 'android' && styles.cardAndroid]}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.price}>
            {formatUsd(plan.priceCentsMonthly)}
            <Text style={styles.per}>/mo</Text>
          </Text>
          <Text style={styles.detail}>
            {plan.blowoutsPerMonth} blowouts · extras {formatUsd(plan.extraBlowoutCents)}
          </Text>
          <NativeButton
            title={`Subscribe — ${plan.name}`}
            onPress={() => subscribe(plan.id)}
            style={styles.cardCta}
          />
        </View>
      ))}
      <Text style={styles.section}>Packages</Text>
      {MYSTIC_PACKAGES.map((pack) => (
        <View key={pack.id} style={styles.packRow}>
          <View>
            <Text style={styles.packTitle}>{pack.blowoutCount} blowouts</Text>
            <Text style={styles.packPrice}>{formatUsd(pack.priceCents)}</Text>
          </View>
          <NativeButton title="Buy" variant="outline" onPress={() => buyPackage(pack.id)} />
        </View>
      ))}
      {status ? (
        <Text style={styles.status} accessibilityRole="alert">
          {status}
        </Text>
      ) : null}
    </NativeScreenShell>
  );
}

const styles = StyleSheet.create({
  successCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.goldSoft,
    borderWidth: 1,
    borderColor: theme.gold,
  },
  successEyebrow: {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: theme.success,
  },
  successTitle: { fontSize: 22, fontWeight: '600', color: theme.ink, marginTop: 6 },
  successBody: { fontSize: 14, lineHeight: 20, color: theme.muted, marginTop: 8, marginBottom: 12 },
  dismiss: { marginTop: 8 },
  card: {
    backgroundColor: theme.accentSoft,
    borderRadius: theme.radii.lg,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.accent,
  },
  cardAndroid: { borderRadius: theme.radii.md },
  planName: { fontSize: 20, fontWeight: '600', color: theme.ink },
  price: { fontSize: 22, fontWeight: '600', marginTop: 6, color: theme.ink },
  per: { fontSize: 14, fontWeight: '400', color: theme.muted },
  detail: { marginTop: 6, color: theme.muted, fontSize: 13 },
  section: { ...monoLabel, color: theme.muted, marginTop: 20, marginBottom: 8 },
  packRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
  packTitle: { color: theme.ink },
  packPrice: { fontWeight: '600', color: theme.ink },
  cardCta: { marginTop: 14 },
  status: { marginTop: 12, color: theme.plum, fontSize: 14, lineHeight: 20 },
});
