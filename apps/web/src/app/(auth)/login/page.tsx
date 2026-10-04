'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Alert, BrandMark, Button, Card, Input } from '@template/ui';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useLogin } from './useLogin';
import { OAuthButtons } from '../components/OAuthButtons';

function LoginForm() {
  const { t } = useI18n();
  const {
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
  } = useLogin();

  return (
    <Card className="w-full p-8">
      <div className="mb-8 text-center">
        <BrandMark className="mx-auto mb-4" />
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink">
          {t.welcomeBack}
        </h1>
        <p className="mt-1.5 text-sm text-muted">Sign in to your LaunchStack workspace</p>
      </div>

      {error && (
        <Alert className="mb-6" variant="error">
          {error}
        </Alert>
      )}
      {message && (
        <Alert className="mb-6" variant="success">
          {message}
        </Alert>
      )}

      {!needsMfa ? <OAuthButtons next={next} /> : null}

      <form onSubmit={handleLogin} className="space-y-5">
        {needsMfa ? (
          useRecovery ? (
            <Input
              id="recovery"
              label="Recovery code"
              autoComplete="one-time-code"
              placeholder="ABCD123456"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              required
            />
          ) : (
            <Input
              id="mfa"
              label="Authenticator code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
            />
          )
        ) : (
          <>
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
          </>
        )}

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          {needsMfa ? 'Verify and continue' : t.signIn}
        </Button>
      </form>

      {needsMfa ? (
        <button
          type="button"
          className="mt-4 w-full text-center text-xs font-semibold text-accent"
          onClick={() => setUseRecovery((value) => !value)}
        >
          {useRecovery ? 'Use authenticator code' : t.recoveryCode}
        </button>
      ) : (
        <div className="mt-4 grid gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void sendMagicLink()}
          >
            {t.magicLink}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => void signInWithPasskey()}
          >
            {t.passkey}
          </Button>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        <Link href="/forgot-password" className="font-semibold text-accent hover:text-accent-hover">
          {t.forgotPassword}
        </Link>
      </p>

      <p className="mt-3 text-center text-xs text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-accent hover:text-accent-hover">
          {t.createAccount}
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
