import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatUsPhoneInput, stripUsPhoneDigits } from '@template/mystic';
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
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCopy, setReferralCopy] = useState<string | null>(null);
  const [referralThreshold, setReferralThreshold] = useState(5);
  const [referralTowardNext, setReferralTowardNext] = useState(0);
  const [creditsSummary, setCreditsSummary] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseMobileClient();
      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user;
      if (!user) {
        setLoading(false);
        return;
      }
      const data = await fetchClientProfile();
      if (data.error) {
        setStatus({ kind: 'error', text: data.error });
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
        if (total > 0) {
          setCreditsSummary(`${total} blowout credit${total === 1 ? '' : 's'} active`);
        }
      }
    } catch {
      setStatus({ kind: 'error', text: 'Set EXPO_PUBLIC_APP_URL and sign in' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
        return;
      }
      setStatus({ kind: 'ok', text: 'Profile updated' });
      hapticSuccess();
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 4000);
      if (result.profile?.referral_code) setReferralCode(result.profile.referral_code);
      if (result.profile?.phone) {
        setForm((prev) => ({ ...prev, phone: formatUsPhoneInput(result.profile!.phone!) }));
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

  return (
    <NativeScreenShell>
      <NativeScreenHeader kicker="Account" title="Your profile" />

      {referralCode ? (
        <NativeReferralShareCard
          referralCode={referralCode}
          progressCopy={referralCopy}
          threshold={referralThreshold}
          towardNext={referralTowardNext}
        />
      ) : null}
      {creditsSummary ? <Text style={styles.credits}>{creditsSummary}</Text> : null}

      <NativeProfileAvatar
        avatarUrl={avatarUrl}
        name={form.fullName}
        diceBearDefaultSeed={form.fullName || form.email}
        onUploaded={setAvatarUrl}
      />

      <View style={styles.field}>
        <Text style={styles.label}>Full name</Text>
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
        <Text style={styles.label}>Email</Text>
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
        <Text style={styles.label}>Mobile</Text>
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
          <Text style={styles.switchLabel}>SMS appointment updates</Text>
        </View>
        <View style={styles.switchRow}>
          <Switch
            value={form.marketingEmail}
            onValueChange={(marketingEmail) => setForm({ ...form, marketingEmail })}
            trackColor={{ true: theme.accent, false: theme.line }}
          />
          <Text style={styles.switchLabel}>Email offers & reminders</Text>
        </View>
      </View>

      <NativeButton title="Save profile" onPress={() => void saveProfile()} isLoading={saving} />
      {savedFlash && status?.kind === 'ok' ? (
        <View style={styles.savedBanner} accessibilityRole="alert">
          <MaterialCommunityIcons name="check-circle" size={22} color={theme.accent} />
          <Text style={styles.savedBannerText}>{status.text}</Text>
        </View>
      ) : status ? (
        <Text
          style={[styles.status, status.kind === 'error' && styles.statusError]}
          accessibilityRole="alert"
        >
          {status.text}
        </Text>
      ) : null}

      <View style={styles.links}>
        <Pressable style={styles.linkRow} onPress={() => router.push('/(app)/(tabs)/membership')}>
          <Text style={styles.link}>Plans & packages</Text>
        </Pressable>
        {!studioAccessLoading && isManager ? (
          <Pressable style={styles.linkRow} onPress={() => router.push('/(app)/(tabs)/studio')}>
            <Text style={styles.link}>Open Studio</Text>
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.paper,
  },
  referralBox: {
    backgroundColor: theme.goldSoft,
    borderRadius: theme.radii.md,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  referralHint: { fontSize: 12, color: theme.muted },
  referralRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  referralCode: { fontSize: 18, fontWeight: '600', fontFamily: 'monospace', color: theme.ink },
  referralProgress: { marginTop: 10, fontSize: 12, color: theme.muted, lineHeight: 18 },
  copyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.plum,
  },
  copyText: { fontSize: 12, color: theme.plum, fontWeight: '600' },
  credits: {
    marginBottom: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
    color: theme.chalk,
    fontSize: 13,
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
  links: {
    flexDirection: 'column',
    gap: 0,
    marginTop: 24,
    ...roadTrip.section,
    paddingHorizontal: 0,
  },
  linkRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
  link: { color: theme.plum, fontWeight: '600', fontSize: 14 },
  signOut: { marginTop: 24 },
});
