import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  MYSTIC_CLIENT_ONBOARDING,
  MYSTIC_ONBOARDING_POLICY_SNIPPETS,
  formatUsPhoneInput,
  stripUsPhoneDigits,
} from '@template/mystic';
import { NativeButton, displayTitle, monoLabel, roadTrip, theme } from '@template/mobile-ui';
import { NativeSalonLoader } from '../../components/mystic/NativeSalonLoader';
import { NativeScreenShell } from '../../components/mystic/NativeScreenShell';
import { CLIENT_HOME } from '../../lib/clientLanding';
import { fetchClientProfile, submitClientOnboarding } from '../../lib/mysticApi';

export default function WelcomeScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingSms, setMarketingSms] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchClientProfile()
      .then((data) => {
        const p = data.profile;
        if (p?.full_name) setFullName(p.full_name);
        if (p?.phone) setPhone(formatUsPhoneInput(p.phone));
        if (typeof p?.marketing_sms === 'boolean') setMarketingSms(p.marketing_sms);
      })
      .finally(() => setLoading(false));
  }, []);

  async function finish(action: 'complete' | 'skip') {
    setBusy(true);
    setError(null);
    const result = await submitClientOnboarding(
      action === 'skip'
        ? { action: 'skip' }
        : {
            action: 'complete',
            fullName: fullName.trim(),
            phone: stripUsPhoneDigits(phone),
            marketingSms,
          }
    );
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong');
      return;
    }
    router.replace(CLIENT_HOME);
  }

  if (loading) {
    return <NativeSalonLoader copyKey="welcome" fill />;
  }

  const canComplete =
    fullName.trim().length >= 2 && stripUsPhoneDigits(phone).length >= 10 && !busy;

  return (
    <NativeScreenShell>
      <Text style={styles.kicker}>{MYSTIC_CLIENT_ONBOARDING.kicker}</Text>
      <Text style={styles.title}>{MYSTIC_CLIENT_ONBOARDING.title}</Text>
      <Text style={styles.lede}>{MYSTIC_CLIENT_ONBOARDING.lede}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your details</Text>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          autoComplete="name"
          placeholderTextColor={theme.muted}
        />
        <Text style={styles.label}>Mobile</Text>
        <TextInput
          value={phone}
          onChangeText={(v) => setPhone(formatUsPhoneInput(v))}
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="312-555-0100"
          placeholderTextColor={theme.muted}
        />
        <Text style={styles.hint}>{MYSTIC_CLIENT_ONBOARDING.phoneHint}</Text>
        <View style={styles.row}>
          <Switch value={marketingSms} onValueChange={setMarketingSms} />
          <Text style={styles.switchLabel}>{MYSTIC_CLIENT_ONBOARDING.smsLabel}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{MYSTIC_CLIENT_ONBOARDING.policiesIntro}</Text>
        {MYSTIC_ONBOARDING_POLICY_SNIPPETS.map((policy) => (
          <View key={policy.id} style={styles.policyBlock}>
            <Text style={styles.policyTitle}>{policy.title}</Text>
            <Text style={styles.policyBody}>{policy.body}</Text>
          </View>
        ))}
      </View>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <NativeButton
        title={MYSTIC_CLIENT_ONBOARDING.completeCta}
        onPress={() => void finish('complete')}
        disabled={!canComplete}
      />
      <Pressable
        onPress={() => void finish('skip')}
        disabled={busy}
        style={styles.skipPress}
        accessibilityRole="button"
      >
        <Text style={styles.skipText}>{MYSTIC_CLIENT_ONBOARDING.skipCta}</Text>
      </Pressable>
    </NativeScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.paper,
  },
  kicker: { ...monoLabel, color: theme.plum, marginBottom: 4 },
  title: { ...displayTitle, color: theme.ink, fontSize: 28 },
  lede: { ...roadTrip, color: theme.muted, marginTop: 8, marginBottom: 20 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: theme.ink, marginBottom: 4 },
  label: { fontSize: 13, color: theme.muted },
  input: {
    backgroundColor: theme.paper,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.ink,
    fontSize: 16,
  },
  hint: { fontSize: 12, color: theme.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  switchLabel: { flex: 1, fontSize: 14, color: theme.ink },
  policyBlock: { marginTop: 8 },
  policyTitle: { fontSize: 14, fontWeight: '600', color: theme.ink },
  policyBody: { fontSize: 13, color: theme.muted, marginTop: 4, lineHeight: 19 },
  error: { color: theme.danger, fontSize: 14, marginBottom: 12 },
  skipPress: { alignItems: 'center', paddingVertical: 16 },
  skipText: { fontSize: 15, color: theme.muted, fontWeight: '500' },
});
