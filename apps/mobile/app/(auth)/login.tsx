import React from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  NativeAlert,
  NativeBrandMark,
  NativeButton,
  NativeCard,
  NativeInput,
  NativeScreen,
  theme,
} from '@template/mobile-ui';
import { useLogin } from './useLogin';

export default function MobileLoginScreen() {
  const { email, setEmail, password, setPassword, error, isLoading, handleLogin } = useLogin();

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
