'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Alert, BrandMark, Button, Card } from '@template/ui';
import { getErrorMessage } from '@template/validation';
import { getAuthCallbackUrl, getBrowserSupabaseClient } from '@/lib/supabase/browser-session';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resend = async () => {
    if (!email) {
      setError('Add ?email= to this URL or start from signup.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabaseClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: getAuthCallbackUrl('/onboarding') },
      });
      if (resendError) throw resendError;
      setMessage('Verification email sent again.');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not resend verification email'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full p-8">
      <div className="mb-8 text-center">
        <BrandMark className="mx-auto mb-4" />
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink">
          Verify your email
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {email
            ? `We sent a confirmation link to ${email}.`
            : 'Check your inbox for a confirmation link.'}
        </p>
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
      <Button
        variant="primary"
        className="w-full"
        isLoading={isLoading}
        onClick={() => void resend()}
      >
        Resend verification email
      </Button>
      <p className="mt-8 text-center text-xs text-muted">
        <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
