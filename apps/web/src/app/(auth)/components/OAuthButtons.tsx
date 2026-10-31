'use client';

import { useState } from 'react';
import { Button } from '@template/ui';
import { getErrorMessage } from '@template/validation';
import { startOAuth } from '@/lib/auth/oauth';

export function OAuthButtons({ next = '/account' }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        isLoading={pending}
        onClick={async () => {
          setError(null);
          setPending(true);
          try {
            await startOAuth('google', next);
          } catch (err) {
            setError(getErrorMessage(err, 'OAuth sign-in failed'));
            setPending(false);
          }
        }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.2 1.2-1.5 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"
          />
        </svg>
        Continue with Google
      </Button>
      {error ? (
        <p className="text-center text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div
        className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted"
        role="separator"
        aria-label="Or sign in with email"
      >
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
