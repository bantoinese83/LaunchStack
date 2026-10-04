'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabaseClient } from '@/lib/supabase/browser-session';
import { firstZodIssueMessage, getErrorMessage, signupSchema } from '@template/validation';
import { analytics } from '@template/analytics';

export function useSignup() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = signupSchema.safeParse({ fullName, email, password });
    if (!validation.success) {
      setError(firstZodIssueMessage(validation.error));
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getBrowserSupabaseClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (data.user) {
        analytics.track(
          {
            name: 'signup_completed',
            properties: { user_id: data.user.id, email },
          },
          data.user.id
        );
        const accessToken = data.session?.access_token;
        if (accessToken) {
          void fetch('/api/email/welcome', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ to: email, name: fullName }),
          }).catch((err) => console.error('[welcome email]', err));
        }
      }

      if (!data.session) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }

      router.push('/onboarding');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to sign up'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleSignup,
  };
}
