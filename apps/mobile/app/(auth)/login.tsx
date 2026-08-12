import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import {
  NativeAlert,
  NativeBrandMark,
  NativeButton,
  NativeCard,
  NativeInput,
  NativeScreen,
  theme,
} from '@template/mobile-ui';
import { createSupabaseBrowserClient } from '@template/api';
import { loginSchema } from '@template/validation';

export default function MobileLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authError.message);
      router.replace('/(app)/(tabs)/home');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NativeScreen style={styles.container}>
      <NativeCard style={styles.card}>
        <NativeBrandMark />
        <Text style={styles.title}>LaunchStack</Text>
        <Text style={styles.subtitle}>Sign in to your workspace</Text>

        {error ? <NativeAlert message={error} /> : null}

        <NativeInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="alex@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
        />

        <NativeInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          textContentType="password"
        />

        <NativeButton
          title="Sign In"
          onPress={handleLogin}
          isLoading={isLoading}
          style={styles.btn}
        />
      </NativeCard>
    </NativeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    alignItems: 'center',
  },
  title: {
    color: theme.ink,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 14,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    marginBottom: 22,
    marginTop: 6,
  },
  btn: {
    marginTop: 8,
    width: '100%',
  },
});
