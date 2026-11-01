import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  MYSTIC_ACCOUNT_PAGE,
  MYSTIC_PLANS_ACCOUNT_NUDGE,
  formatUsPhoneInput,
  stripUsPhoneDigits,
} from '@template/mystic';
import { NativeButton, monoLabel, roadTrip, theme } from '@template/mobile-ui';
import { NativeProfileAvatar } from '../../../components/mystic/NativeProfileAvatar';
import { NativeSalonLoader } from '../../../components/mystic/NativeSalonLoader';
import { NativeScreenHeader } from '../../../components/mystic/NativeScreenHeader';
import { NativeScreenShell } from '../../../components/mystic/NativeScreenShell';
import { useStudioAccess } from '../../../hooks/useStudioAccess';
import { hapticSuccess } from '../../../lib/haptics';
import { NativeReferralShareCard } from '../../../components/mystic/NativeReferralShareCard';
import { fetchClientProfile, fetchMyCredits, saveClientProfile } from '../../../lib/mysticApi';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  birthday: string;
  marketingSms: boolean;
  marketingEmail: boolean;
};

export default function AccountTab() {
  const router = useRouter();
  const { isManager, loading: studioAccessLoading } = useStudioAccess();
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    birthday: '',
    marketingSms: true,
    marketingEmail: true,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCopy, setReferralCopy] = useState<string | null>(null);
  const [referralThreshold, setReferralThreshold] = useState(5);
  const [referralTowardNext, setReferralTowardNext] = useState(0);
  const [creditsSummary, setCreditsSummary] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    setLoadError(null);
    try {
      const supabase = createSupabaseMobileClient();
      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user;
      if (!user) {
        setLoadError('Sign in to view your profile');
        return;
      }
      const data = await fetchClientProfile();
      if (data.error) {
        setLoadError(data.error);
        return;
      }
      const p = data.profile;
      setForm({
        fullName: p?.full_name?.trim() || '',
        email: p?.email?.trim() || user.email || '',
        phone: p?.phone ? formatUsPhoneInput(p.phone) : '',
        birthday: p?.birthday ?? '',
        marketingSms: p?.marketing_sms ?? true,
        marketingEmail: p?.marketing_email ?? true,
      });
      setReferralCode(p?.referral_code ?? null);
      setReferralCopy(data.referralProgress?.copy ?? null);
      setReferralThreshold(data.referralProgress?.threshold ?? 5);
      setReferralTowardNext(data.referralProgress?.towardNext ?? 0);
      setAvatarUrl(p?.avatar_url ?? null);

      const credits = await fetchMyCredits();
      const rows = credits.credits ?? [];
      if (rows.length) {
        const total = rows.reduce(
          (sum: number, c: { blowouts_remaining: number }) => sum + c.blowouts_remaining,
          0
        );
        setCreditsSummary(
          total > 0 ? `${total} blowout credit${total === 1 ? '' : 's'} active` : null
        );
      } else {
        setCreditsSummary(null);
      }
    } catch {
      setLoadError('Set EXPO_PUBLIC_APP_URL and sign in');
    } finally {
      if (!opts?.silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const phoneDigits = stripUsPhoneDigits(form.phone);
  const profileIncomplete = useMemo(
    () => !loading && (!form.fullName.trim() || phoneDigits.length < 10),
    [form.fullName, loading, phoneDigits.length]
  );

  async function saveProfile() {
    setSaving(true);
    setStatus(null);
    try {
      const result = await saveClientProfile({
        fullName: form.fullName.trim() || 'Client',
        email: form.email.trim(),
        phone: stripUsPhoneDigits(form.phone),
        birthday: form.birthday || undefined,
        marketingSms: form.marketingSms,
        marketingEmail: form.marketingEmail,
      });
      if (!result.ok) {
        setStatus({ kind: 'error', text: result.error ?? 'Could not save' });
        setSavedFlash(false);
        return;
      }
      setStatus({ kind: 'ok', text: 'Profile updated' });
      hapticSuccess();
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 4000);
      if (result.profile?.referral_code) setReferralCode(result.profile.referral_code);
      if (result.profile?.phone) {
        setForm((prev) => ({
          ...prev,
          phone: formatUsPhoneInput(result.profile!.phone!),
        }));
      }
    } catch {
      setStatus({ kind: 'error', text: 'Could not save — check connection' });
    } finally {
      setSaving(false);
    }
  }

  const signOut = async () => {
    const supabase = createSupabaseMobileClient();
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return <NativeSalonLoader copyKey="profile" fill />;
  }

  if (loadError) {
    return (
      <NativeScreenShell>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{loadError}</Text>
          <NativeButton title="Try again" onPress={() => void load()} style={styles.retryBtn} />
        </View>
      </NativeScreenShell>
    );
  }

  return (
    <NativeScreenShell
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load({ silent: true });
          }}
          tintColor={theme.plum}
        />
      }
    >
      <NativeScreenHeader
        kicker={MYSTIC_ACCOUNT_PAGE.eyebrow}
        title={MYSTIC_ACCOUNT_PAGE.title}
        lede={MYSTIC_ACCOUNT_PAGE.lede}
      />

      {profileIncomplete ? (
        <View style={styles.incompleteBanner} accessibilityRole="summary">
          <Text style={styles.incompleteText}>{MYSTIC_ACCOUNT_PAGE.incompleteHint}</Text>
        </View>
      ) : null}

      {referralCode ? (
        <NativeReferralShareCard
          referralCode={referralCode}
          progressCopy={referralCopy}
          threshold={referralThreshold}
          towardNext={referralTowardNext}
        />
      ) : null}
      {creditsSummary ? (
        <View style={styles.creditsCard}>
          <Text style={styles.credits}>{creditsSummary}</Text>
        </View>
      ) : (
        <Pressable
          style={styles.plansNudge}
          onPress={() => router.push('/(app)/(tabs)/membership')}
          accessibilityRole="button"
        >
          <Text style={styles.plansNudgeTitle}>{MYSTIC_PLANS_ACCOUNT_NUDGE.title}</Text>
          <Text style={styles.plansNudgeBody}>{MYSTIC_PLANS_ACCOUNT_NUDGE.body}</Text>
          <Text style={styles.plansNudgeCta}>{MYSTIC_PLANS_ACCOUNT_NUDGE.cta} →</Text>
        </Pressable>
      )}

      <View style={styles.avatarCard}>
        <NativeProfileAvatar
          avatarUrl={avatarUrl}
          name={form.fullName}
          diceBearDefaultSeed={form.fullName || form.email}
          onUploaded={setAvatarUrl}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Full name *</Text>
        <TextInput
          value={form.fullName}
          onChangeText={(fullName) => setForm({ ...form, fullName })}
          placeholder="Your name"
          style={styles.input}
          placeholderTextColor={theme.muted}
          autoComplete="name"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          value={form.email}
          onChangeText={(email) => setForm({ ...form, email })}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor={theme.muted}
          autoComplete="email"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Mobile * (SMS updates)</Text>
        <TextInput
          value={form.phone}
          onChangeText={(phone) => setForm({ ...form, phone: formatUsPhoneInput(phone) })}
          keyboardType="phone-pad"
          placeholder="312-555-0100"
          style={styles.input}
          placeholderTextColor={theme.muted}
          autoComplete="tel"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Birthday (optional)</Text>
        <TextInput
          value={form.birthday}
          onChangeText={(birthday) => setForm({ ...form, birthday })}
          placeholder="YYYY-MM-DD"
          style={styles.input}
          placeholderTextColor={theme.muted}
        />
      </View>

      <View style={styles.notifBox}>
        <Text style={styles.notifTitle}>Notifications</Text>
        <View style={styles.switchRow}>
          <Switch
            value={form.marketingSms}
            onValueChange={(marketingSms) => setForm({ ...form, marketingSms })}
            trackColor={{ true: theme.accent, false: theme.line }}
          />
          <Text style={styles.switchLabel}>
            Text me appointment updates (on the way, arrival, confirmations).
          </Text>
        </View>
        <View style={styles.switchRow}>
          <Switch
            value={form.marketingEmail}
            onValueChange={(marketingEmail) => setForm({ ...form, marketingEmail })}
            trackColor={{ true: theme.accent, false: theme.line }}
          />
          <Text style={styles.switchLabel}>Email me offers & reminders</Text>
        </View>
      </View>

      <NativeButton title="Save profile" onPress={() => void saveProfile()} isLoading={saving} />
      {savedFlash && status?.kind === 'ok' ? (
        <View style={styles.savedBanner} accessibilityRole="alert">
          <MaterialCommunityIcons name="check-circle" size={22} color={theme.accent} />
          <Text style={styles.savedBannerText}>{status.text}</Text>
        </View>
      ) : status?.kind === 'error' ? (
        <Text style={[styles.status, styles.statusError]} accessibilityRole="alert">
          {status.text}
        </Text>
      ) : null}

      <Text style={styles.shortcutsTitle}>Shortcuts</Text>
      <View style={styles.shortcuts}>
        <Pressable
          style={styles.shortcutRow}
          onPress={() => router.push('/(app)/(tabs)/visits')}
          accessibilityRole="button"
        >
          <Text style={styles.link}>My visits</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.muted} />
        </Pressable>
        <Pressable
          style={styles.shortcutRow}
          onPress={() => router.push('/(app)/(tabs)/messages')}
          accessibilityRole="button"
        >
          <Text style={styles.link}>Messages</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.muted} />
        </Pressable>
        <Pressable
          style={styles.shortcutRow}
          onPress={() => router.push('/(app)/(tabs)/book')}
          accessibilityRole="button"
        >
          <Text style={styles.link}>Book again</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.muted} />
        </Pressable>
        <Pressable
          style={styles.shortcutRow}
          onPress={() => router.push('/(app)/(tabs)/membership')}
          accessibilityRole="button"
        >
          <Text style={styles.link}>Plans & packages</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.muted} />
        </Pressable>
        {!studioAccessLoading && isManager ? (
          <Pressable
            style={styles.shortcutRow}
            onPress={() => router.push('/(app)/(tabs)/studio')}
            accessibilityRole="button"
          >
            <Text style={styles.link}>Open Studio</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.muted} />
          </Pressable>
        ) : null}
      </View>

      <NativeButton
        title="Sign out"
        variant="outline"
        onPress={() => void signOut()}
        style={styles.signOut}
      />
    </NativeScreenShell>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    marginTop: 24,
    padding: 20,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.surface,
    alignItems: 'center',
  },
  errorText: { color: theme.danger, fontSize: 14, textAlign: 'center' },
  retryBtn: { marginTop: 16, alignSelf: 'stretch' },
  incompleteBanner: {
    marginBottom: 16,
    padding: 12,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.goldSoft,
    borderWidth: 1,
    borderColor: theme.gold,
  },
  incompleteText: { fontSize: 13, lineHeight: 18, color: theme.ink },
  avatarCard: {
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.surface,
  },
  creditsCard: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.surface,
  },
  credits: {
    color: theme.chalk,
    fontSize: 13,
    fontWeight: '600',
  },
  plansNudge: {
    marginBottom: 16,
    padding: 14,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
  },
  plansNudgeTitle: { fontSize: 15, fontWeight: '600', color: theme.ink },
  plansNudgeBody: { marginTop: 6, fontSize: 13, lineHeight: 18, color: theme.muted },
  plansNudgeCta: {
    ...monoLabel,
    marginTop: 10,
    fontSize: 11,
    color: theme.accent,
    fontWeight: '600',
  },
  field: { marginBottom: 16 },
  label: { ...monoLabel, color: theme.plum, marginBottom: 6 },
  input: {
    ...roadTrip.flatInput,
    fontSize: 16,
  },
  notifBox: {
    ...roadTrip.section,
    paddingHorizontal: 0,
    marginBottom: 20,
    gap: 12,
  },
  notifTitle: { fontWeight: '600', color: theme.ink, marginBottom: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchLabel: { flex: 1, fontSize: 13, color: theme.ink, lineHeight: 18 },
  status: { marginTop: 12, color: theme.chalk, fontSize: 13 },
  statusError: { color: theme.danger },
  savedBanner: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.accentSoft,
    borderWidth: 1,
    borderColor: theme.accent,
  },
  savedBannerText: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.ink },
  shortcutsTitle: {
    ...monoLabel,
    marginTop: 28,
    marginBottom: 8,
    fontSize: 10,
    color: theme.muted,
  },
  shortcuts: {
    ...roadTrip.section,
    paddingHorizontal: 0,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
  link: { color: theme.plum, fontWeight: '600', fontSize: 14 },
  signOut: { marginTop: 24 },
});
