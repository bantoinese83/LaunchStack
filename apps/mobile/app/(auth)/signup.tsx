import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { firstZodIssueMessage, getErrorMessage, signupSchema } from '@template/validation';
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

export default function MobileSignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    setError(null);
    const validation = signupSchema.safeParse({ fullName, email, password });
    if (!validation.success) {
      setError(firstZodIssueMessage(validation.error));
      return;
    }
    setIsLoading(true);
    try {
      const supabase = createSupabaseMobileClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (authError) throw new Error(authError.message);
      router.replace('/(app)/(tabs)/home');
    } catch (err) {
      setError(getErrorMessage(err, 'Sign up failed'));
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
        <Text style={styles.title}>Create an account</Text>
        {error ? <NativeAlert message={error} /> : null}
        <NativeInput label="Full name" value={fullName} onChangeText={setFullName} />
        <NativeInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <NativeInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <NativeButton title="Create account" onPress={handleSignup} isLoading={isLoading} />
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
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
  link: { color: theme.accent, marginTop: 16, fontSize: 13 },
});
