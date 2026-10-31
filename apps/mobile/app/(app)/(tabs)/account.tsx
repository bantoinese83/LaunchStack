import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { NativeButton, displayTitle, monoLabel, theme } from '@template/mobile-ui';

const appUrl = Constants.expoConfig?.extra?.appUrl ?? process.env.EXPO_PUBLIC_APP_URL ?? '';

export default function AccountTab() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!appUrl) return;
    void (async () => {
      const supabase = createSupabaseMobileClient();
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      const res = await fetch(`${appUrl}/api/mystic/client-profile`, {
        headers: { Authorization: `Bearer ${session.session.access_token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json.profile?.phone) setPhone(json.profile.phone);
    })();
  }, []);

  const saveProfile = async () => {
    if (!appUrl) {
      setStatus('Set EXPO_PUBLIC_APP_URL');
      return;
    }
    const supabase = createSupabaseMobileClient();
    const { data: session } = await supabase.auth.getSession();
    const user = session.session?.user;
    if (!user) {
      setStatus('Sign in first');
      return;
    }
    const res = await fetch(`${appUrl}/api/mystic/client-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.session!.access_token}`,
      },
      body: JSON.stringify({
        fullName: fullName || user.email?.split('@')[0] || 'Client',
        email: user.email ?? '',
        phone,
        marketingSms: true,
        marketingEmail: true,
      }),
    });
    const data = await res.json();
    setStatus(res.ok ? 'Saved' : (data.error ?? 'Could not save'));
  };

  const signOut = async () => {
    const supabase = createSupabaseMobileClient();
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>Account</Text>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.lede}>Phone & SMS consent for house-call updates.</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Full name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your name"
          style={styles.input}
          placeholderTextColor={theme.muted}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Mobile</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+1…"
          style={styles.input}
          placeholderTextColor={theme.muted}
        />
      </View>
      <NativeButton title="Save profile" onPress={saveProfile} />
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <NativeButton title="Sign out" variant="outline" onPress={signOut} style={styles.signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: { padding: 20, paddingBottom: 40 },
  kicker: { ...monoLabel, color: theme.plum },
  heading: { ...displayTitle, color: theme.ink },
  lede: { color: theme.muted, marginVertical: 12, lineHeight: 22 },
  field: { marginBottom: 12 },
  label: { ...monoLabel, color: theme.muted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: theme.radii.md,
    padding: 12,
    color: theme.ink,
    backgroundColor: theme.surface,
  },
  status: { marginTop: 12, color: theme.muted, fontSize: 13 },
  signOut: { marginTop: 24 },
});
