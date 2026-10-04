import { useState } from 'react';
import { useRouter } from 'expo-router';
import { createSupabaseMobileClient } from '@template/api/mobile';
import { firstZodIssueMessage, getErrorMessage, loginSchema } from '@template/validation';

export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(firstZodIssueMessage(validation.error));
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseMobileClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authError.message);
      router.replace('/(app)/(tabs)/home');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin,
  };
}
