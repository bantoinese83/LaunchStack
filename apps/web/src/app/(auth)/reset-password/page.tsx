'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Input } from '@template/ui';
import { MysticAuthLogo } from '@/components/mystic/MysticAuthLogo';
import { MysticAuthCard } from '@/components/mystic/MysticAuthCard';
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
      router.push('/account');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MysticAuthCard>
      <div className="mb-8 text-center">
        <MysticAuthLogo />
        <h1 className="type-display-md text-ink">Choose a new password</h1>
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
    </MysticAuthCard>
  );
}
