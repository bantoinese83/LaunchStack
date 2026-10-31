import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { NativeButton, monoLabel, roadTrip, theme } from '@template/mobile-ui';
import { NativeProfileAvatar } from '../../../components/mystic/NativeProfileAvatar';
import { NativeScreenHeader } from '../../../components/mystic/NativeScreenHeader';
import { NativeScreenShell } from '../../../components/mystic/NativeScreenShell';
import { useStudioAccess } from '../../../hooks/useStudioAccess';
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
  const [referralCode, setReferralCode] = useState<string | null>(null);
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
        phone: p?.phone ?? '',
        birthday: p?.birthday ?? '',
        marketingSms: p?.marketing_sms ?? true,
        marketingEmail: p?.marketing_email ?? true,
      });
      setReferralCode(p?.referral_code ?? null);
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
        phone: form.phone.trim(),
        birthday: form.birthday || undefined,
        marketingSms: form.marketingSms,
        marketingEmail: form.marketingEmail,
      });
      if (!result.ok) {
        setStatus({ kind: 'error', text: result.error ?? 'Could not save' });
        return;
      }
      setStatus({ kind: 'ok', text: 'Profile saved' });
      if (result.profile?.referral_code) setReferralCode(result.profile.referral_code);
    } catch {
      setStatus({ kind: 'error', text: 'Could not save — check connection' });
    } finally {
      setSaving(false);
    }
  }

  async function shareReferral() {
    if (!referralCode) return;
    await Share.share({ message: referralCode });
  }

  const signOut = async () => {
    const supabase = createSupabaseMobileClient();
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <NativeScreenShell>
      <NativeScreenHeader
        kicker="Account"
        title="Your profile"
        lede="Phone and SMS preferences for en route, door timer, and booking updates."
      />

      {referralCode ? (
        <View style={styles.referralBox}>
          <Text style={styles.referralHint}>Your referral code</Text>
          <View style={styles.referralRow}>
            <Text style={styles.referralCode}>{referralCode}</Text>
            <Pressable onPress={() => void shareReferral()} style={styles.copyBtn}>
              <Text style={styles.copyText}>Share</Text>
            </Pressable>
          </View>
        </View>
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
          onChangeText={(phone) => setForm({ ...form, phone })}
          keyboardType="phone-pad"
          placeholder="3125550100"
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
      {status ? (
        <Text
          style={[styles.status, status.kind === 'error' && styles.statusError]}
          accessibilityRole="alert"
        >
          {status.text}
        </Text>
      ) : null}

      <View style={styles.links}>
        <Pressable style={styles.linkRow} onPress={() => router.push('/(app)/(tabs)/visits')}>
          <Text style={styles.link}>My visits</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => router.push('/(app)/(tabs)/book')}>
          <Text style={styles.link}>Book again</Text>
        </Pressable>
        <Pressable style={styles.linkRow} onPress={() => router.push('/(app)/(tabs)/shop')}>
          <Text style={styles.link}>Shop products</Text>
        </Pressable>
        {!studioAccessLoading && isManager ? (
          <Pressable style={styles.linkRow} onPress={() => router.push('/(app)/(tabs)/membership')}>
            <Text style={styles.link}>Membership & packages</Text>
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
    ...roadTrip.section,
    borderLeftWidth: 3,
    borderLeftColor: theme.gold,
    backgroundColor: theme.goldSoft,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  referralHint: { fontSize: 12, color: theme.muted },
  referralRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  referralCode: { fontSize: 18, fontWeight: '600', fontFamily: 'monospace', color: theme.ink },
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
