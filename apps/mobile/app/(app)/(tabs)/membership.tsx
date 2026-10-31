import React, { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { MYSTIC_MEMBERSHIPS, MYSTIC_PACKAGES, formatUsd } from '@template/mystic';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { NativeScreenHeader } from '../../../components/mystic/NativeScreenHeader';
import { NativeScreenShell } from '../../../components/mystic/NativeScreenShell';
import { startMembershipCheckout, startPackageCheckout } from '../../../lib/mysticApi';

export default function MembershipTab() {
  const [status, setStatus] = useState<string | null>(null);

  async function subscribe(id: string) {
    try {
      const data = await startMembershipCheckout(id);
      if (data.url) await Linking.openURL(data.url);
      else setStatus(data.error ?? 'Checkout unavailable');
    } catch {
      setStatus('Sign in on web or configure EXPO_PUBLIC_APP_URL');
    }
  }

  async function buyPackage(id: string) {
    try {
      const data = await startPackageCheckout(id);
      if (data.url) await Linking.openURL(data.url);
      else setStatus(data.error ?? 'Checkout unavailable');
    } catch {
      setStatus('Sign in and set EXPO_PUBLIC_APP_URL');
    }
  }

  return (
    <NativeScreenShell>
      <NativeScreenHeader
        kicker="Plans"
        title="Memberships & packages"
        lede="Monthly Glow & Luxe and prepaid blowout packs — credits apply at checkout."
      />
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
      {MYSTIC_MEMBERSHIPS.map((plan) => (
        <NativeButton
          key={`btn-${plan.id}`}
          title={`Subscribe — ${plan.name}`}
          onPress={() => subscribe(plan.id)}
          style={styles.cta}
        />
      ))}
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </NativeScreenShell>
  );
}

const styles = StyleSheet.create({
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
  cta: { marginTop: 12 },
  status: { marginTop: 12, color: theme.muted, fontSize: 13 },
});
