'use client';

import React from 'react';
import Link from 'next/link';
import { Alert, BrandMark, Button, Card, Input } from '@template/ui';
import { useLogin } from './useLogin';

export default function LoginPage() {
  const { email, setEmail, password, setPassword, error, isLoading, handleLogin } = useLogin();

  return (
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

      <form onSubmit={handleLogin} className="space-y-5">
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
  );
}
