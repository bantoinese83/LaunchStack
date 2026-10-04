'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getErrorMessage, firstZodIssueMessage, loginSchema } from '@template/validation';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { getAuthCallbackUrl, getBrowserSupabaseClient } from '@/lib/supabase/browser-session';

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState<string | null>(searchParams.get('error'));
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectAfterAuth = () => {
    const destination = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
    router.push(destination as Parameters<typeof router.push>[0]);
    router.refresh();
  };

  const verifyMfa = async () => {
    const supabase = getBrowserSupabaseClient();
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const supabase = getBrowserSupabaseClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

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
      const supabase = getBrowserSupabaseClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: getAuthCallbackUrl(next) },
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
    setIsLoading(true);
    try {
      const supabase = getBrowserSupabaseClient();
      const mfa = supabase.auth.mfa as typeof supabase.auth.mfa & {
        challengeAndVerify?: (args: { factorId: string }) => Promise<{ error: Error | null }>;
      };
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;
      const webauthn = (factors as typeof factors & { webauthn?: Array<{ id: string }> })
        .webauthn?.[0];
      if (!webauthn || !mfa.challengeAndVerify) {
        throw new Error(
          'Passkey sign-in needs an enrolled passkey. Enable WebAuthn in Supabase Auth, then add a passkey in Settings.'
        );
      }
      const { error: verifyError } = await mfa.challengeAndVerify({ factorId: webauthn.id });
      if (verifyError) throw verifyError;
      redirectAfterAuth();
    } catch (err) {
      setError(getErrorMessage(err, 'Passkey sign-in is not available yet'));
    } finally {
      setIsLoading(false);
    }
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
    next,
    error,
    message,
    isLoading,
    handleLogin,
    sendMagicLink,
    signInWithPasskey,
  };
}
