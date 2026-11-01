import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  NativeAlert,
  NativeAuthLogo,
  NativeButton,
  NativeInput,
  handTitle,
  theme,
} from '@template/mobile-ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { captureReferralFromParam } from '../../lib/referral-storage';
import { mysticLogoLight } from '../../constants/branding';
import { AuthScreenFrame } from '../../components/auth/AuthScreenFrame';
import { OAuthButtons } from '../../components/auth/OAuthButtons';
import { useLogin } from '../../hooks/useLogin';

export default function MobileLoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ref?: string }>();

  useEffect(() => {
    if (params.ref) void captureReferralFromParam(params.ref);
  }, [params.ref]);

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
    <AuthScreenFrame>
      <View style={styles.authHeader}>
        <NativeAuthLogo source={mysticLogoLight} />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to book and manage your visits</Text>
      </View>

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
    </AuthScreenFrame>
  );
}

const styles = StyleSheet.create({
  authHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...handTitle,
    fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
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
    color: theme.plum,
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
