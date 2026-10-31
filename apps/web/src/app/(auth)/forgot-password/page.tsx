'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Input } from '@template/ui';
import { MysticAuthLogo } from '@/components/mystic/MysticAuthLogo';
import { MysticAuthCard } from '@/components/mystic/MysticAuthCard';
import { firstZodIssueMessage, forgotPasswordSchema, getErrorMessage } from '@template/validation';
import { getAuthCallbackUrl, getBrowserSupabaseClient } from '@/lib/supabase/browser-session';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(firstZodIssueMessage(validation.error));
      return;
    }
    setIsLoading(true);
    try {
      const supabase = getBrowserSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthCallbackUrl('/reset-password'),
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send reset email'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MysticAuthCard>
      <div className="mb-8 text-center">
        <MysticAuthLogo />
        <h1 className="type-display-md text-ink">Reset your password</h1>
        <p className="mt-1.5 text-sm text-muted">
          We will email a recovery link if that account exists.
        </p>
      </div>

      {error && (
        <Alert className="mb-6" variant="error">
          {error}
        </Alert>
      )}
      {sent && (
        <Alert className="mb-6" variant="success">
          Check your inbox for a password reset link.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Send reset link
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-muted">
        <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">
          Back to sign in
        </Link>
      </p>
    </MysticAuthCard>
  );
}
