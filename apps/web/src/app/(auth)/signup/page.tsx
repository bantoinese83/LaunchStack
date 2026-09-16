'use client';

import React from 'react';
import Link from 'next/link';
import { Alert, BrandMark, Button, Card, Input } from '@template/ui';
import { useSignup } from './useSignup';

export default function SignupPage() {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleSignup,
  } = useSignup();

  return (
    <Card className="w-full max-w-md p-8 animate-[rise_400ms_ease-out]">
      <div className="mb-8 text-center">
        <BrandMark className="mx-auto mb-4" />
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Create an account
        </h1>
        <p className="mt-1.5 text-sm text-muted">Start building with LaunchStack</p>
      </div>

      {error && (
        <Alert className="mb-6" variant="error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        <Input
          id="fullName"
          label="Full Name"
          autoComplete="name"
          placeholder="Alex Founder"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

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
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          helperText="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Create Account & Continue
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
