import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeButton, NativeCard, NativeInput, theme } from '@template/mobile-ui';
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
    <View style={styles.container}>
      <NativeCard style={styles.card}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>LS</Text>
        </View>
        <Text style={styles.title}>LaunchStack</Text>
        <Text style={styles.subtitle}>Sign in to your workspace</Text>

        {error && <Text style={styles.errorBanner}>{error}</Text>}

        <NativeInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="alex@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <NativeInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <NativeButton
          title="Sign In"
          onPress={handleLogin}
          isLoading={isLoading}
          style={styles.btn}
        />
      </NativeCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.paper,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: {
    color: theme.paper,
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    color: theme.ink,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    marginBottom: 20,
    marginTop: 4,
  },
  errorBanner: {
    color: theme.danger,
    backgroundColor: '#FEF3F2',
    borderColor: '#FECDCA',
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    width: '100%',
    textAlign: 'center',
    fontSize: 12,
  },
  btn: {
    marginTop: 12,
    width: '100%',
  },
});
