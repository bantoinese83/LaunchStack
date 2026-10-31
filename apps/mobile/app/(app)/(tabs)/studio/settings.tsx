import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatUsd } from '@template/mystic';
import { NativeButton, monoLabel, theme } from '@template/mobile-ui';
import { useStudioAccess } from '../../../../hooks/useStudioAccess';
import { fetchStudioSettings, patchStudioSettings } from '../../../../lib/studioApi';

function usd(cents: number) {
  return (cents / 100).toFixed(2);
}

function toCents(value: string) {
  const n = Number.parseFloat(value);
  return Number.isNaN(n) ? 0 : Math.round(n * 100);
}

export default function StudioSettingsScreen() {
  const { workspaceId } = useStudioAccess();
  const [deposit, setDeposit] = useState('25');
  const [evening, setEvening] = useState('25');
  const [perMile, setPerMile] = useState('5');
  const [includedMiles, setIncludedMiles] = useState('5');
  const [referralAfter, setReferralAfter] = useState('5');
  const [doorTimer, setDoorTimer] = useState('15');
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!workspaceId) return;
    void fetchStudioSettings(workspaceId).then((data) => {
      const s = data.settings;
      if (!s) return;
      setDeposit(usd(s.deposit_cents));
      setEvening(usd(s.evening_surcharge_cents));
      setPerMile(usd(s.per_mile_surcharge_cents));
      setIncludedMiles(String(s.included_miles));
      setReferralAfter(String(s.referral_reward_after));
      setDoorTimer(String(s.door_timer_minutes));
    });
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!workspaceId) return;
    const data = await patchStudioSettings(workspaceId, {
      depositCents: toCents(deposit),
      eveningSurchargeCents: toCents(evening),
      perMileSurchargeCents: toCents(perMile),
      includedMiles: Number.parseFloat(includedMiles) || 5,
      referralRewardAfter: Number.parseInt(referralAfter, 10) || 5,
      doorTimerMinutes: Number.parseInt(doorTimer, 10) || 15,
    });
    setMessage(data.error ? data.error : 'Saved');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.section}>Deposits & surcharges</Text>
      <Field label="Deposit (USD)" value={deposit} onChangeText={setDeposit} />
      <Field label="After 8pm fee (USD)" value={evening} onChangeText={setEvening} />
      <Field label="Miles included" value={includedMiles} onChangeText={setIncludedMiles} />
      <Field label="Per mile beyond (USD)" value={perMile} onChangeText={setPerMile} />
      <Field label="Door timer (min)" value={doorTimer} onChangeText={setDoorTimer} />
      <Field label="Referrals until reward" value={referralAfter} onChangeText={setReferralAfter} />
      <Text style={styles.hint}>Deposit preview: {formatUsd(toCents(deposit))}</Text>
      <NativeButton title="Save settings" onPress={() => void save()} style={styles.cta} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: 40 },
  section: { ...monoLabel, color: theme.accent, marginBottom: 12 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, color: theme.muted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.lg,
    padding: 12,
    color: theme.ink,
    backgroundColor: theme.surface,
  },
  hint: { fontSize: 12, color: theme.muted, marginTop: 4 },
  cta: { marginTop: 16 },
  message: { marginTop: 12, color: theme.chalk },
});
