import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';
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
import { useRouter } from 'expo-router';
import { useLogin } from './useLogin';

export default function MobileLoginScreen() {
  const router = useRouter();
  const { email, setEmail, password, setPassword, error, isLoading, handleLogin } = useLogin();

  return (
    <NativeScreen background="shell" style={styles.container}>
      <StatusBar style="light" />
      <NativeCard style={styles.card}>
        <NativeBrandMark />
        <Text style={styles.kicker}>LaunchStack</Text>
        <Text style={styles.title}>Welcome back</Text>
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
        <Text style={styles.link} onPress={() => router.push('/(auth)/forgot')}>
          Forgot password?
        </Text>
        <Text style={styles.link} onPress={() => router.push('/(auth)/signup')}>
          Create an account
        </Text>
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
    width: '100%',
    alignItems: 'center',
  },
  kicker: {
    ...monoLabel,
    color: theme.accent,
    marginTop: 16,
  },
  title: {
    ...displayTitle,
    color: theme.ink,
    marginTop: 6,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
    marginTop: 6,
    textAlign: 'center',
  },
  btn: {
    marginTop: 8,
    width: '100%',
  },
  link: {
    color: theme.accent,
    marginTop: 12,
    fontSize: 13,
  },
});
