'use client';

import { useEffect } from 'react';
import { EmptyState, Button } from '@template/ui';
import { analytics } from '@template/analytics';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
    analytics.track({ name: 'app_error', properties: { message: error.message } });
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4">
          <EmptyState
            title="Something went wrong!"
            description="We've been notified and are looking into it."
            action={<Button onClick={reset}>Try again</Button>}
          />
        </div>
      </body>
    </html>
  );
}
