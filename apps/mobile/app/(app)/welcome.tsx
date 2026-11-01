import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  MYSTIC_CLIENT_ONBOARDING,
  MYSTIC_PLANS_ACCOUNT_NUDGE,
  MYSTIC_ONBOARDING_POLICY_SNIPPETS,
  MYSTIC_ONBOARDING_STEPS,
  MYSTIC_ONBOARDING_CELEBRATION_MS,
  MYSTIC_ONBOARDING_VALUE_PROPS,
  formatUsPhoneInput,
  getCelebrationContent,
  mysticOnboardingStepIndex,
  nextOnboardingStepAfterIntro,
  resolveInitialOnboardingStep,
  stripUsPhoneDigits,
  type MysticOnboardingStep,
} from '@template/mystic';
import { NativeButton, displayTitle, monoLabel, roadTrip, theme } from '@template/mobile-ui';
import { NativeCelebrationBurst } from '../../components/mystic/NativeCelebrationBurst';
import { NativeOnboardingFrame } from '../../components/mystic/NativeOnboardingFrame';
import { NativeOnboardingProgress } from '../../components/mystic/NativeOnboardingProgress';
import { NativeSalonLoader } from '../../components/mystic/NativeSalonLoader';
import { NativeStylistChip } from '../../components/mystic/NativeStylistChip';
import { CLIENT_HOME } from '../../lib/clientLanding';
import { hapticSuccess } from '../../lib/haptics';
import { fetchClientProfile, submitClientOnboarding } from '../../lib/mysticApi';

const VALUE_ICONS: Record<
  (typeof MYSTIC_ONBOARDING_VALUE_PROPS)[number]['id'],
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  door: 'home-account',
  text: 'message-text-outline',
  credits: 'ticket-percent-outline',
};

export default function WelcomeScreen() {
  const router = useRouter();
  const [step, setStep] = useState<MysticOnboardingStep>('intro');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingSms, setMarketingSms] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrationCopy = useMemo(() => getCelebrationContent('onboarding'), []);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  useEffect(() => {
    void fetchClientProfile()
      .then((data) => {
        const p = data.profile;
        const name = p?.full_name?.trim() ?? '';
        const mobile = p?.phone ? formatUsPhoneInput(p.phone) : '';
        if (name) setFullName(name);
        if (mobile) setPhone(mobile);
        if (typeof p?.marketing_sms === 'boolean') setMarketingSms(p.marketing_sms);
        setStep(resolveInitialOnboardingStep(name, mobile));
      })
      .finally(() => setLoading(false));
  }, []);

  const stepIndex = mysticOnboardingStepIndex(step);
  const phoneDigits = stripUsPhoneDigits(phone);
  const profileValid = fullName.trim().length >= 2 && phoneDigits.length >= 10;

  function goNext() {
    setError(null);
    if (step === 'intro') {
      setStep(nextOnboardingStepAfterIntro(profileValid));
      return;
    }
    if (step === 'profile') {
      if (!profileValid) {
        setError('Add your name and a 10-digit mobile number.');
        return;
      }
      setStep('visit');
    }
  }

  function goBack() {
    setError(null);
    const prev = MYSTIC_ONBOARDING_STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  }

  async function finish(action: 'complete' | 'skip') {
    setBusy(true);
    setError(null);
    const result = await submitClientOnboarding(
      action === 'skip'
        ? { action: 'skip' }
        : {
            action: 'complete',
            fullName: fullName.trim(),
            phone: phoneDigits,
            marketingSms,
          }
    );
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong');
      return;
    }
    if (action === 'skip') {
      router.replace(CLIENT_HOME);
      return;
    }
    setCelebrating(true);
    setBurstKey((k) => k + 1);
    hapticSuccess();
    redirectTimer.current = setTimeout(() => {
      router.replace(CLIENT_HOME);
    }, MYSTIC_ONBOARDING_CELEBRATION_MS);
  }

  if (loading) {
    return <NativeSalonLoader copyKey="welcome" fill />;
  }

  const continueDisabled =
    celebrating ||
    busy ||
    (step === 'profile' && !profileValid) ||
    (step === 'visit' && !profileValid);

  const continueLabel =
    step === 'visit' ? MYSTIC_CLIENT_ONBOARDING.completeCta : MYSTIC_CLIENT_ONBOARDING.continueCta;

  return (
    <NativeOnboardingFrame
      header={
        celebrating ? (
          <View style={styles.headerRow}>
            <NativeOnboardingProgress step="visit" />
          </View>
        ) : (
          <View style={styles.headerRow}>
            {step === 'intro' ? (
              <Pressable
                onPress={() => void finish('skip')}
                disabled={busy}
                hitSlop={12}
                style={styles.skipPress}
                accessibilityRole="button"
                accessibilityLabel={MYSTIC_CLIENT_ONBOARDING.skipCta}
              >
                <Text style={styles.skipLink}>{MYSTIC_CLIENT_ONBOARDING.skipCta}</Text>
              </Pressable>
            ) : (
              <View style={styles.skipSpacer} />
            )}
            <NativeOnboardingProgress step={step} />
          </View>
        )
      }
      footer={
        celebrating ? (
          <Text style={styles.redirectHint} accessibilityLiveRegion="polite">
            Opening book…
          </Text>
        ) : (
          <View style={styles.footerInner}>
            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}
            <View style={styles.footerButtons}>
              {stepIndex > 0 ? (
                <NativeButton
                  title={MYSTIC_CLIENT_ONBOARDING.backCta}
                  variant="secondary"
                  onPress={goBack}
                  disabled={busy}
                  style={styles.footerHalf}
                />
              ) : null}
              <NativeButton
                title={continueLabel}
                onPress={() => (step === 'visit' ? void finish('complete') : goNext())}
                disabled={continueDisabled}
                isLoading={busy && step === 'visit'}
                style={stepIndex > 0 ? styles.footerHalf : styles.footerFull}
              />
            </View>
          </View>
        )
      }
    >
      {celebrating ? (
        <View style={styles.celebrationBlock} accessibilityRole="alert">
          <NativeCelebrationBurst fire={celebrating} burstKey={burstKey} />
          <Text style={styles.celebrationEyebrow}>{celebrationCopy.eyebrow}</Text>
          <Text style={styles.celebrationTitle}>{celebrationCopy.title}</Text>
          <Text style={styles.celebrationBody}>{celebrationCopy.body}</Text>
        </View>
      ) : null}

      {!celebrating && step === 'intro' ? (
        <View style={styles.stepBlock}>
          <Text style={styles.kicker}>{MYSTIC_CLIENT_ONBOARDING.kicker}</Text>
          <Text style={styles.title}>{MYSTIC_CLIENT_ONBOARDING.introTitle}</Text>
          <Text style={styles.lede}>{MYSTIC_CLIENT_ONBOARDING.introLede}</Text>
          <NativeStylistChip size={40} style={styles.stylist} />
          <View style={styles.valueList}>
            {MYSTIC_ONBOARDING_VALUE_PROPS.map((item) => (
              <View key={item.id} style={styles.valueRow}>
                <View style={styles.valueIconWrap}>
                  <MaterialCommunityIcons
                    name={VALUE_ICONS[item.id]}
                    size={22}
                    color={theme.plum}
                  />
                </View>
                <View style={styles.valueCopy}>
                  <Text style={styles.valueTitle}>{item.title}</Text>
                  <Text style={styles.valueBody}>{item.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {!celebrating && step === 'profile' ? (
        <View style={styles.stepBlock}>
          <Text style={styles.sectionTitle}>{MYSTIC_CLIENT_ONBOARDING.profileTitle}</Text>
          <Text style={styles.sectionLede}>{MYSTIC_CLIENT_ONBOARDING.profileLede}</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              autoComplete="name"
              placeholder="Your name"
              placeholderTextColor={theme.muted}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Mobile</Text>
            <TextInput
              value={phone}
              onChangeText={(v) => setPhone(formatUsPhoneInput(v))}
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="312-555-0100"
              placeholderTextColor={theme.muted}
              autoComplete="tel"
            />
            <Text style={styles.hint}>{MYSTIC_CLIENT_ONBOARDING.phoneHint}</Text>
          </View>
          <View style={styles.switchRow}>
            <Switch
              value={marketingSms}
              onValueChange={setMarketingSms}
              trackColor={{ true: theme.accent, false: theme.line }}
            />
            <Text style={styles.switchLabel}>{MYSTIC_CLIENT_ONBOARDING.smsLabel}</Text>
          </View>
        </View>
      ) : null}

      {!celebrating && step === 'visit' ? (
        <View style={styles.stepBlock}>
          <Text style={styles.sectionTitle}>{MYSTIC_CLIENT_ONBOARDING.visitTitle}</Text>
          <Text style={styles.sectionLede}>{MYSTIC_CLIENT_ONBOARDING.visitLede}</Text>
          {profileValid ? (
            <Text style={styles.prefillNote}>{MYSTIC_CLIENT_ONBOARDING.profileOnFileHint}</Text>
          ) : null}
          <View style={styles.policyList}>
            {MYSTIC_ONBOARDING_POLICY_SNIPPETS.map((policy, index) => (
              <View key={policy.id} style={[styles.policyRow, index > 0 && styles.policyRowBorder]}>
                <Text style={styles.policyTitle}>{policy.title}</Text>
                <Text style={styles.policyBody}>{policy.body}</Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => router.push('/(app)/(tabs)/membership')}
            style={styles.plansNudge}
            accessibilityRole="link"
          >
            <Text style={styles.plansNudgeText}>
              {MYSTIC_CLIENT_ONBOARDING.visitPlansNudge}{' '}
              <Text style={styles.plansNudgeLink}>{MYSTIC_PLANS_ACCOUNT_NUDGE.cta} →</Text>
            </Text>
          </Pressable>
        </View>
      ) : null}
    </NativeOnboardingFrame>
  );
}

const styles = StyleSheet.create({
  headerRow: { gap: 2 },
  skipPress: { alignSelf: 'flex-end', marginBottom: 2 },
  skipLink: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.muted,
  },
  skipSpacer: { height: 22 },
  footerInner: { gap: 10 },
  footerButtons: { flexDirection: 'row', gap: 10 },
  footerHalf: { flex: 1 },
  footerFull: { flex: 1 },
  stepBlock: { paddingBottom: 8 },
  kicker: { ...monoLabel, color: theme.plum, marginBottom: 4 },
  title: { ...displayTitle, color: theme.ink, fontSize: 28, lineHeight: 34 },
  lede: { ...roadTrip.lede, color: theme.muted, marginTop: 8 },
  stylist: { marginTop: 16, marginBottom: 20 },
  valueList: { gap: 12 },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.surface,
  },
  valueIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueCopy: { flex: 1 },
  valueTitle: { fontSize: 15, fontWeight: '600', color: theme.ink },
  valueBody: { marginTop: 4, fontSize: 13, lineHeight: 18, color: theme.muted },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: theme.ink, lineHeight: 28 },
  sectionLede: { marginTop: 8, fontSize: 14, lineHeight: 20, color: theme.muted },
  field: { marginTop: 20 },
  label: { ...monoLabel, color: theme.plum, marginBottom: 6 },
  input: {
    ...roadTrip.flatInput,
    fontSize: 16,
  },
  hint: { marginTop: 6, fontSize: 12, lineHeight: 17, color: theme.muted },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  switchLabel: { flex: 1, fontSize: 13, lineHeight: 18, color: theme.ink },
  policyList: {
    marginTop: 16,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },
  policyRow: { paddingVertical: 14, paddingHorizontal: 14 },
  policyRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
  },
  policyTitle: { fontSize: 14, fontWeight: '600', color: theme.ink },
  policyBody: { marginTop: 4, fontSize: 13, lineHeight: 19, color: theme.muted },
  error: { color: theme.danger, fontSize: 13, textAlign: 'center' },
  prefillNote: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: theme.plum,
    backgroundColor: theme.goldSoft,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.radii.md,
  },
  celebrationBlock: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 8,
  },
  celebrationEyebrow: { ...monoLabel, color: theme.plum, marginTop: 8 },
  celebrationTitle: {
    ...displayTitle,
    marginTop: 8,
    fontSize: 26,
    textAlign: 'center',
    color: theme.ink,
  },
  celebrationBody: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: theme.muted,
    maxWidth: 320,
  },
  redirectHint: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: theme.muted,
    paddingVertical: 4,
  },
  plansNudge: { marginTop: 16, paddingVertical: 4 },
  plansNudgeText: { textAlign: 'center', fontSize: 14, lineHeight: 20, color: theme.muted },
  plansNudgeLink: { fontWeight: '600', color: theme.accent },
});
