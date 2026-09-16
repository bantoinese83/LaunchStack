'use client';

import { useEffect } from 'react';
import { EmptyState, Button } from '@template/ui';
import { analytics } from '@template/analytics';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
    analytics.track({ name: 'page_error', properties: { message: error.message } });
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <EmptyState
        title="Something went wrong!"
        description="An unexpected error occurred while loading this page."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </div>
  );
}
