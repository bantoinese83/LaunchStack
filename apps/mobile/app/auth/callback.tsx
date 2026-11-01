import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { getErrorMessage } from '@template/validation';
import { NativeButton, displayTitle, theme } from '@template/mobile-ui';
import { NativeSalonLoader } from '../../components/mystic/NativeSalonLoader';
import { createSessionFromUrl } from '../../lib/auth/sessionFromUrl';

/** Deep link target: mystichair://auth/callback (OAuth + magic links). */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const url = Linking.useURL();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    void createSessionFromUrl(url)
      .then(async () => {
        if (cancelled) return;
        const { resolveMobileAppLanding } = await import('../../lib/clientLanding');
        const landing = await resolveMobileAppLanding();
        router.replace(landing);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not complete sign-in'));
      });

    return () => {
      cancelled = true;
    };
  }, [url, router]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Sign-in failed</Text>
        <Text style={styles.message}>{error}</Text>
        <NativeButton title="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <NativeSalonLoader copyKey="signIn" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.paper,
  },
  title: { ...displayTitle, color: theme.ink, marginBottom: 8 },
  message: { color: theme.muted, textAlign: 'center', marginTop: 12, marginBottom: 20 },
});
