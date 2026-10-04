import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { firstZodIssueMessage, forgotPasswordSchema, getErrorMessage } from '@template/validation';
import {
  NativeAlert,
  NativeBrandMark,
  NativeButton,
  NativeCard,
  NativeInput,
  NativeScreen,
  displayTitle,
  monoLabel,
  theme,
} from '@template/mobile-ui';

export default function MobileForgotScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    setError(null);
    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(firstZodIssueMessage(validation.error));
      return;
    }
    setIsLoading(true);
    try {
      const supabase = createSupabaseMobileClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      if (resetError) throw new Error(resetError.message);
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send reset email'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NativeScreen background="shell" style={styles.container}>
      <StatusBar style="light" />
      <NativeCard style={styles.card}>
        <NativeBrandMark />
        <Text style={styles.kicker}>LaunchStack</Text>
        <Text style={styles.title}>Reset password</Text>
        {error ? <NativeAlert message={error} /> : null}
        {sent ? <Text style={styles.success}>Check your inbox for a reset link.</Text> : null}
        <NativeInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <NativeButton title="Send reset link" onPress={handleReset} isLoading={isLoading} />
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.link}>Back to sign in</Text>
        </Pressable>
      </NativeCard>
    </NativeScreen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', padding: 20 },
  card: { width: '100%', alignItems: 'center' },
  kicker: { ...monoLabel, color: theme.accent, marginTop: 16 },
  title: { ...displayTitle, color: theme.ink, marginVertical: 8 },
  success: { color: theme.muted, marginBottom: 12 },
  link: { color: theme.accent, marginTop: 16, fontSize: 13 },
});
