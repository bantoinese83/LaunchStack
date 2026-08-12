'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, BrandMark, Button, Card, Input } from '@template/ui';
import { createSupabaseBrowserClient } from '@template/api';
import { loginSchema } from '@template/validation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper atlas-grain p-6">
      <Card className="w-full max-w-md p-8 animate-[rise_400ms_ease-out]">
        <div className="mb-8 text-center">
          <BrandMark className="mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted">Sign in to your LaunchStack workspace</p>
        </div>

        {error && (
          <Alert className="mb-6" variant="error">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-accent hover:text-accent-hover">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
