'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, BrandMark, Button, Card, Input } from '@template/ui';
import { firstZodIssueMessage, getErrorMessage, loginSchema } from '@template/validation';
import { getAdminBrowserClient } from '@/lib/supabase/browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(firstZodIssueMessage(validation.error));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getAdminBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to sign in'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-shell p-6">
      <Card className="w-full max-w-md p-8">
        <BrandMark className="mx-auto mb-4" />
        <h1 className="text-center font-display text-2xl font-medium text-ink">Admin sign in</h1>
        <p className="mt-2 text-center text-sm text-muted">Super-admin accounts only.</p>
        {error && (
          <Alert className="mt-6" variant="error">
            {error}
          </Alert>
        )}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
