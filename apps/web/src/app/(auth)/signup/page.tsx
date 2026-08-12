'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@template/ui';
import { createSupabaseBrowserClient } from '@template/api';
import { signupSchema } from '@template/validation';
import { analytics } from '@template/analytics';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = signupSchema.safeParse({ fullName, email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
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
          { name: 'signup_completed', properties: { user_id: data.user.id, email } },
          data.user.id
        );
        // Server route owns Brevo — client never sees BREVO_API_KEY
        void fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: email, name: fullName }),
        }).catch((err) => console.error('[welcome email]', err));
      }

      router.push('/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper atlas-grain p-6">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-sm bg-ink font-display text-lg font-bold text-paper">
            LS
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-muted">Start building with LaunchStack</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-danger text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="fullName"
            label="Full Name"
            placeholder="Alex Founder"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Create Account & Continue
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
