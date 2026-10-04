'use client';

import { useState } from 'react';
import { Button } from '@template/ui';
import { getErrorMessage } from '@template/validation';
import { OAUTH_PROVIDERS, startOAuth } from '@/lib/auth/oauth';

const LABELS = {
  google: 'Continue with Google',
  github: 'Continue with GitHub',
} as const;

function ProviderIcon({ provider }: { provider: (typeof OAUTH_PROVIDERS)[number] }) {
  if (provider === 'google') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.2 1.2-1.5 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.28 0 .32.22.7.83.58C20.56 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z"
      />
    </svg>
  );
}

export function OAuthButtons({ next = '/dashboard' }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<(typeof OAUTH_PROVIDERS)[number] | null>(null);

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {OAUTH_PROVIDERS.map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            className="w-full gap-2"
            isLoading={pending === provider}
            onClick={async () => {
              setError(null);
              setPending(provider);
              try {
                await startOAuth(provider, next);
              } catch (err) {
                setError(getErrorMessage(err, 'OAuth sign-in failed'));
                setPending(null);
              }
            }}
          >
            <ProviderIcon provider={provider} />
            {LABELS[provider]}
          </Button>
        ))}
      </div>
      {error ? <p className="text-center text-xs text-danger">{error}</p> : null}
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
