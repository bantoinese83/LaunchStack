import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { firstZodIssueMessage, forgotPasswordSchema, getErrorMessage } from '@template/validation';
import {
  NativeAlert,
  NativeAuthLogo,
  NativeButton,
  NativeInput,
  displayTitle,
  theme,
} from '@template/mobile-ui';
import { mysticLogoLight } from '../../constants/branding';
import { AuthScreenFrame } from '../../components/auth/AuthScreenFrame';

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
    <AuthScreenFrame>
      <View style={styles.authHeader}>
        <NativeAuthLogo source={mysticLogoLight} />
        <Text style={styles.title}>Reset password</Text>
      </View>
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
    </AuthScreenFrame>
  );
}

const styles = StyleSheet.create({
  authHeader: { width: '100%', alignItems: 'center', marginBottom: 12 },
  title: { ...displayTitle, color: theme.ink, textAlign: 'center' },
  success: { color: theme.muted, marginBottom: 12, textAlign: 'center' },
  link: { color: theme.plum, marginTop: 16, fontSize: 13, textAlign: 'center' },
});
