import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MYSTIC_MEMBERSHIPS,
  MYSTIC_PACKAGES,
  MYSTIC_PLANS_CHOOSER,
  MYSTIC_PLANS_PAGE,
  MYSTIC_PLANS_TRUST,
  formatUsd,
  getCelebrationContent,
  membershipSubscribeLabel,
  packageBuyLabel,
  type MysticCelebrationKind,
} from '@template/mystic';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { MYSTIC_TAB_BAR_SCROLL_PADDING } from '../navigation/mysticTabBarIcon';
import { NativeCelebrationBurst } from '../mystic/NativeCelebrationBurst';
import { NativeScreenHeader } from '../mystic/NativeScreenHeader';
import { openStripeCheckoutSession } from '../../lib/openStripeCheckout';
import { fetchMyCredits, startMembershipCheckout, startPackageCheckout } from '../../lib/mysticApi';

export function NativePlansScreen() {
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
  const [creditTotal, setCreditTotal] = useState<number | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState<string | null>(null);

  const successKind = useMemo((): MysticCelebrationKind | null => {
    if (params.success !== '1') return null;
    if (params.kind === 'package') return 'package';
    if (params.kind === 'membership') return 'membership';
    return 'membership';
  }, [params.success, params.kind]);

  const celebration = successKind ? getCelebrationContent(successKind, params.id) : null;

  const loadCredits = useCallback(() => {
    void fetchMyCredits()
      .then((data) => {
        const list = (Array.isArray(data.credits) ? data.credits : []) as {
          blowouts_remaining?: number;
        }[];
        let sum = 0;
        for (const c of list) {
          if (typeof c.blowouts_remaining === 'number') sum += c.blowouts_remaining;
        }
        setCreditTotal(sum);
      })
      .catch(() => setCreditTotal(null));
  }, []);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  useEffect(() => {
    if (params.success === '1') {
      setCelebrate(true);
      setBurstKey((k) => k + 1);
      setStatus(null);
      loadCredits();
    } else if (params.canceled === '1') {
      setCelebrate(false);
      setStatus('Checkout canceled — no charge. Tap Subscribe or Buy when you are ready.');
    }
  }, [params.success, params.canceled, loadCredits]);

  const clearCelebrationParams = useCallback(() => {
    setCelebrate(false);
    router.replace('/(app)/(tabs)/membership');
  }, [router]);

  async function subscribe(id: string) {
    setCheckoutBusy(id);
    setStatus(null);
    try {
      const data = await startMembershipCheckout(id);
      if (!data.url) {
        setStatus(data.error ?? 'Checkout unavailable — sign in and try again.');
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
    } finally {
      setCheckoutBusy(null);
    }
  }

  async function buyPackage(id: string) {
    setCheckoutBusy(id);
    setStatus(null);
    try {
      const data = await startPackageCheckout(id);
      if (!data.url) {
        setStatus(data.error ?? 'Checkout unavailable — sign in and try again.');
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
    } finally {
      setCheckoutBusy(null);
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <NativeCelebrationBurst fire={celebrate} burstKey={burstKey} />
      <NativeScreenHeader
        kicker={MYSTIC_PLANS_PAGE.eyebrow}
        title={MYSTIC_PLANS_PAGE.title}
        lede={MYSTIC_PLANS_PAGE.description}
      />

      <View style={styles.trustRow}>
        {MYSTIC_PLANS_TRUST.map((line) => (
          <Text key={line} style={styles.trustItem}>
            {line}
          </Text>
        ))}
      </View>

      {creditTotal != null && creditTotal > 0 ? (
        <View style={styles.creditsCard}>
          <Text style={styles.creditsEyebrow}>{MYSTIC_PLANS_PAGE.returningCreditsTitle}</Text>
          <Text style={styles.creditsTitle}>
            {creditTotal} blowout credit{creditTotal === 1 ? '' : 's'} ready
          </Text>
          <Text style={styles.creditsHint}>{MYSTIC_PLANS_PAGE.returningCreditsHint}</Text>
          <NativeButton
            title={MYSTIC_PLANS_PAGE.bookCta}
            onPress={() => router.push('/(app)/(tabs)/book')}
            style={styles.creditsCta}
          />
        </View>
      ) : null}

      <Text style={styles.chooserTitle}>{MYSTIC_PLANS_CHOOSER.title}</Text>
      <View style={styles.chooserRow}>
        <View style={styles.chooserCard}>
          <Text style={styles.chooserCardTitle}>{MYSTIC_PLANS_CHOOSER.membership.title}</Text>
          <Text style={styles.chooserHint}>{MYSTIC_PLANS_CHOOSER.membership.hint}</Text>
        </View>
        <View style={styles.chooserCard}>
          <Text style={styles.chooserCardTitle}>{MYSTIC_PLANS_CHOOSER.package.title}</Text>
          <Text style={styles.chooserHint}>{MYSTIC_PLANS_CHOOSER.package.hint}</Text>
        </View>
      </View>

      {celebration ? (
        <View style={styles.successCard}>
          <Text style={styles.successEyebrow}>{celebration.eyebrow}</Text>
          <Text style={styles.successTitle}>{celebration.title}</Text>
          <Text style={styles.successBody}>{celebration.body}</Text>
          <NativeButton
            title={MYSTIC_PLANS_PAGE.bookCta}
            onPress={() => router.push('/(app)/(tabs)/book')}
          />
          <NativeButton
            title="Dismiss"
            variant="outline"
            onPress={clearCelebrationParams}
            style={styles.dismiss}
          />
        </View>
      ) : null}

      <Text style={styles.section}>Monthly memberships</Text>
      <Text style={styles.sectionHint}>
        Recurring clients — blowouts refresh every month; travel and evening fees waived.
      </Text>
      {MYSTIC_MEMBERSHIPS.map((plan) => (
        <View key={plan.id} style={[styles.card, Platform.OS === 'android' && styles.cardAndroid]}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.id === 'luxe' ? <Text style={styles.featuredBadge}>Most loved</Text> : null}
          <Text style={styles.price}>
            {formatUsd(plan.priceCentsMonthly)}
            <Text style={styles.per}>/mo</Text>
          </Text>
          <Text style={styles.detail}>
            {plan.blowoutsPerMonth} blowouts · extra {formatUsd(plan.extraBlowoutCents)} · house
            call only
          </Text>
          {plan.perks.map((perk) => (
            <Text key={perk} style={styles.perk}>
              ✦ {perk}
            </Text>
          ))}
          <NativeButton
            title={membershipSubscribeLabel(plan.name)}
            onPress={() => void subscribe(plan.id)}
            isLoading={checkoutBusy === plan.id}
            disabled={Boolean(checkoutBusy && checkoutBusy !== plan.id)}
            style={styles.cardCta}
          />
        </View>
      ))}

      <Text style={styles.section}>Blowout packages</Text>
      <Text style={styles.sectionHint}>
        New clients — prepaid blowouts within six months; same fee waivers when you book.
      </Text>
      {MYSTIC_PACKAGES.map((pack) => (
        <View key={pack.id} style={styles.packCard}>
          <View style={styles.packMain}>
            <Text style={styles.packTitle}>{pack.blowoutCount} blowouts</Text>
            <Text style={styles.packMeta}>
              {formatUsd(pack.pricePerBlowoutCents)} each · {pack.savingsLabel}
            </Text>
            <Text style={styles.packPrice}>{formatUsd(pack.priceCents)}</Text>
          </View>
          <NativeButton
            title={packageBuyLabel(pack.blowoutCount)}
            variant="secondary"
            onPress={() => void buyPackage(pack.id)}
            isLoading={checkoutBusy === pack.id}
            disabled={Boolean(checkoutBusy && checkoutBusy !== pack.id)}
          />
        </View>
      ))}

      {status ? (
        <Text style={styles.status} accessibilityRole="alert">
          {status}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  content: { padding: 20, paddingBottom: MYSTIC_TAB_BAR_SCROLL_PADDING + 24 },
  trustRow: { marginTop: 16, gap: 6 },
  trustItem: { ...monoLabel, fontSize: 10, color: theme.muted },
  creditsCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.goldSoft,
    borderWidth: 1,
    borderColor: theme.gold,
  },
  creditsEyebrow: { ...monoLabel, fontSize: 10, color: theme.plum },
  creditsTitle: { marginTop: 6, fontSize: 22, fontWeight: '600', color: theme.ink },
  creditsHint: { marginTop: 8, fontSize: 13, lineHeight: 18, color: theme.muted },
  creditsCta: { marginTop: 12 },
  chooserTitle: { ...monoLabel, marginTop: 20, color: theme.muted },
  chooserRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  chooserCard: {
    flex: 1,
    padding: 12,
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.surface,
  },
  chooserCardTitle: { fontSize: 13, fontWeight: '600', color: theme.ink },
  chooserHint: { marginTop: 6, fontSize: 11, lineHeight: 15, color: theme.muted },
  successCard: {
    marginTop: 16,
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
  section: { ...monoLabel, color: theme.muted, marginTop: 24, marginBottom: 4 },
  sectionHint: { fontSize: 13, lineHeight: 18, color: theme.muted, marginBottom: 12 },
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
  featuredBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    ...monoLabel,
    fontSize: 10,
    color: theme.plum,
    backgroundColor: theme.paper,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
    overflow: 'hidden',
  },
  price: { fontSize: 22, fontWeight: '600', marginTop: 6, color: theme.ink },
  per: { fontSize: 14, fontWeight: '400', color: theme.muted },
  detail: { marginTop: 6, color: theme.muted, fontSize: 13 },
  perk: { marginTop: 4, fontSize: 13, color: theme.ink },
  packCard: {
    marginBottom: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
    gap: 12,
  },
  packMain: { gap: 4 },
  packTitle: { fontSize: 18, fontWeight: '600', color: theme.ink },
  packMeta: { fontSize: 13, color: theme.muted },
  packPrice: { fontSize: 20, fontWeight: '600', color: theme.ink },
  cardCta: { marginTop: 14 },
  status: { marginTop: 16, color: theme.plum, fontSize: 14, lineHeight: 20 },
});
