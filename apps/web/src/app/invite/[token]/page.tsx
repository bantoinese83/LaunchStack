'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, BrandMark, Button, Card } from '@template/ui';
import { getErrorMessage } from '@template/validation';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { readApiError } from '@/lib/api/read-api-error';
import { requireBrowserSession } from '@/lib/supabase/browser-session';

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const session = await requireBrowserSession();
      if (!session) {
        router.push(`/login?next=/invite/${token}`);
        return;
      }
      const response = await authorizedFetch('/api/invites/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        throw new Error(await readApiError(response, 'Could not accept invite'));
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not accept invite'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <Card className="w-full max-w-md p-8">
        <BrandMark className="mx-auto mb-4" />
        <h1 className="text-center font-display text-2xl font-medium text-ink">Join workspace</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Accept this invitation with the email address it was sent to.
        </p>
        {error && (
          <Alert className="mt-6" variant="error">
            {error}
          </Alert>
        )}
        <Button
          className="mt-6 w-full"
          variant="primary"
          isLoading={isLoading}
          onClick={() => void handleAccept()}
        >
          Accept invitation
        </Button>
        <p className="mt-4 text-center text-xs text-muted">
          <Link href={`/login?next=/invite/${token}`} className="font-semibold text-accent">
            Sign in first
          </Link>
        </p>
      </Card>
    </div>
  );
}
