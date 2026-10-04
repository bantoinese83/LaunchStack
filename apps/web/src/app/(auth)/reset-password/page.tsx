'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, BrandMark, Button, Card, Input } from '@template/ui';
import { getErrorMessage } from '@template/validation';
import { getBrowserSupabaseClient } from '@/lib/supabase/browser-session';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setIsLoading(true);
    try {
      const supabase = getBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full p-8">
      <div className="mb-8 text-center">
        <BrandMark className="mx-auto mb-4" />
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink">
          Choose a new password
        </h1>
      </div>

      {error && (
        <Alert className="mb-6" variant="error">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Update password
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-muted">
        <Link href="/login" className="font-semibold text-accent hover:text-accent-hover">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
