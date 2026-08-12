'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@template/ui';
import { createSupabaseBrowserClient } from '@template/api';
import { signupSchema } from '@template/validation';
import { BrevoEmailService } from '@template/email';
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

      // Track analytics & send Brevo welcome email
      if (data.user) {
        analytics.track(
          { name: 'signup_completed', properties: { user_id: data.user.id, email } },
          data.user.id
        );
        const emailService = new BrevoEmailService();
        await emailService.sendWelcomeEmail(email, fullName);
      }

      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <Card className="w-full max-w-md p-8 border-slate-800">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-xl shadow-lg shadow-blue-500/20 mb-3">
            LS
          </div>
          <h1 className="text-2xl font-bold text-white">Create an Account</h1>
          <p className="text-slate-400 text-sm mt-1">Start building with LaunchStack monorepo</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-950/80 border border-red-800/60 p-3 text-xs text-red-300 text-center">
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

        <div className="mt-8 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-400 hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
