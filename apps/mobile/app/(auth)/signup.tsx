import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { firstZodIssueMessage, getErrorMessage, signupSchema } from '@template/validation';
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
import { OAuthButtons } from '../../components/auth/OAuthButtons';

export default function MobileSignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const goToApp = () => router.replace('/(app)/(tabs)/book');

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
      goToApp();
    } catch (err) {
      setError(getErrorMessage(err, 'Sign up failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthScreenFrame>
      <View style={styles.authHeader}>
        <NativeAuthLogo source={mysticLogoLight} />
        <Text style={styles.title}>Create an account</Text>
        <Text style={styles.subtitle}>Book house-call blowouts and manage your plan</Text>
      </View>

      {error ? <NativeAlert message={error} /> : null}

      <OAuthButtons onSuccess={goToApp} />

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
    </AuthScreenFrame>
  );
}

const styles = StyleSheet.create({
  authHeader: { width: '100%', alignItems: 'center', marginBottom: 8 },
  title: { ...displayTitle, color: theme.ink, textAlign: 'center' },
  subtitle: {
    color: theme.muted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  link: { color: theme.plum, marginTop: 16, fontSize: 13, textAlign: 'center' },
});
