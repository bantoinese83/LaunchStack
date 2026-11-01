'use client';

import React from 'react';
import Link from 'next/link';
import { Alert, Button, Input } from '@template/ui';
import { MysticAuthLogo } from '@/components/mystic/MysticAuthLogo';
import { MysticAuthCard } from '@/components/mystic/MysticAuthCard';
import { useSignup } from './useSignup';
import { OAuthButtons } from '../components/OAuthButtons';

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
    <MysticAuthCard>
      <div className="mb-8 text-center">
        <MysticAuthLogo />
        <h1 className="type-hand-lg text-ink">Create an account</h1>
        <p className="mt-1.5 text-sm text-muted">Book house-call blowouts and manage your plan</p>
      </div>

      {error && (
        <Alert className="mb-6" variant="error">
          {error}
        </Alert>
      )}

      <OAuthButtons next="/account" />

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
    </MysticAuthCard>
  );
}
