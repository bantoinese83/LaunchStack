import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';
import {
  NativeAlert,
  NativeAuthLogo,
  NativeButton,
  NativeCard,
  NativeInput,
  NativeScreen,
  displayTitle,
  theme,
} from '@template/mobile-ui';
import { useRouter } from 'expo-router';
import { mysticLogoLight } from '../../constants/branding';
import { useLogin } from './useLogin';
import { OAuthButtons } from './components/OAuthButtons';

export default function MobileLoginScreen() {
  const router = useRouter();
  const {
    email,
    setEmail,
    password,
    setPassword,
    mfaCode,
    setMfaCode,
    recoveryCode,
    setRecoveryCode,
    needsMfa,
    useRecovery,
    setUseRecovery,
    error,
    message,
    isLoading,
    handleLogin,
    sendMagicLink,
    signInWithPasskey,
    redirectAfterAuth,
  } = useLogin();

  return (
    <NativeScreen background="shell" style={styles.container}>
      <StatusBar style="light" />
      <NativeCard style={styles.card}>
        <NativeAuthLogo source={mysticLogoLight} />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to book and manage your visits</Text>

        {error ? <NativeAlert message={error} /> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}

        {!needsMfa ? <OAuthButtons onSuccess={redirectAfterAuth} /> : null}

        {needsMfa ? (
          useRecovery ? (
            <NativeInput
              label="Recovery code"
              value={recoveryCode}
              onChangeText={setRecoveryCode}
              placeholder="ABCD123456"
              autoCapitalize="characters"
            />
          ) : (
            <NativeInput
              label="Authenticator code"
              value={mfaCode}
              onChangeText={setMfaCode}
              placeholder="123456"
              keyboardType="number-pad"
            />
          )
        ) : (
          <>
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
          </>
        )}

        <NativeButton
          title={needsMfa ? 'Verify and continue' : 'Sign in'}
          onPress={handleLogin}
          isLoading={isLoading}
          style={styles.btn}
        />

        {needsMfa ? (
          <Pressable onPress={() => setUseRecovery((v) => !v)}>
            <Text style={styles.link}>
              {useRecovery ? 'Use authenticator code' : 'Use a recovery code'}
            </Text>
          </Pressable>
        ) : (
          <>
            <NativeButton
              title="Email me a magic link"
              variant="outline"
              onPress={() => void sendMagicLink()}
              style={styles.secondaryBtn}
            />
            <Pressable onPress={() => void signInWithPasskey()}>
              <Text style={styles.passkey}>Continue with a passkey</Text>
            </Pressable>
          </>
        )}

        <Pressable onPress={() => router.push('/(auth)/forgot')}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.link}>Don&apos;t have an account? Create an account</Text>
        </Pressable>
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
  title: {
    ...displayTitle,
    color: theme.ink,
    marginTop: 4,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 6,
    textAlign: 'center',
  },
  success: {
    color: theme.accent,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  btn: {
    marginTop: 8,
    width: '100%',
  },
  secondaryBtn: {
    marginTop: 10,
    width: '100%',
  },
  link: {
    color: theme.accent,
    marginTop: 12,
    fontSize: 13,
    textAlign: 'center',
  },
  passkey: {
    color: theme.muted,
    marginTop: 10,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});
