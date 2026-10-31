import { useState } from 'react';
import { useRouter } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { firstZodIssueMessage, getErrorMessage, loginSchema } from '@template/validation';
import { authorizedFetch } from '../../lib/auth/authorizedFetch';
import { getMobileAuthRedirectUri } from '../../lib/auth/oauth';
import { fetchStudioAccess } from '../../lib/studioApi';

const CLIENT_HOME = '/(app)/(tabs)/book' as const;
const STUDIO_HOME = '/(app)/(tabs)/studio' as const;

export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectAfterAuth = async () => {
    try {
      const access = await fetchStudioAccess();
      router.replace(access.allowed ? STUDIO_HOME : CLIENT_HOME);
    } catch {
      router.replace(CLIENT_HOME);
    }
  };

  const verifyMfa = async () => {
    const supabase = createSupabaseMobileClient();
    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) throw listError;
    const totp = factors.totp[0];
    if (!totp) throw new Error('No authenticator factor is enrolled');
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: totp.id,
    });
    if (challengeError) throw challengeError;
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totp.id,
      challengeId: challenge.id,
      code: mfaCode,
    });
    if (verifyError) throw verifyError;
  };

  const consumeRecovery = async () => {
    const response = await authorizedFetch('/api/security/recovery-codes/consume', {
      method: 'POST',
      body: JSON.stringify({ code: recoveryCode }),
    });
    if (!response.ok) {
      throw new Error('Invalid or used recovery code');
    }
  };

  const handleLogin = async () => {
    setError(null);
    setMessage(null);

    if (needsMfa) {
      setIsLoading(true);
      try {
        if (useRecovery) {
          await consumeRecovery();
        } else {
          await verifyMfa();
        }
        redirectAfterAuth();
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Invalid authenticator or recovery code'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(firstZodIssueMessage(validation.error));
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseMobileClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal.data?.nextLevel === 'aal2' && aal.data.nextLevel !== aal.data.currentLevel) {
        setNeedsMfa(true);
        return;
      }

      if (!data.session) {
        throw new Error('Sign-in did not return a session');
      }

      redirectAfterAuth();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to sign in'));
    } finally {
      setIsLoading(false);
    }
  };

  const sendMagicLink = async () => {
    setError(null);
    setMessage(null);
    if (!email) {
      setError('Enter your email to receive a magic link');
      return;
    }
    setIsLoading(true);
    try {
      const supabase = createSupabaseMobileClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: getMobileAuthRedirectUri() },
      });
      if (otpError) throw otpError;
      setMessage('Check your inbox for a sign-in link.');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send magic link'));
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPasskey = async () => {
    setError(null);
    setMessage(null);
    setError(
      'Passkey sign-in is supported on the web app. Use email, Google, or a magic link here.'
    );
  };

  return {
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
  };
}
