'use client';

import { useRouter } from 'next/navigation';
import { EmptyState, Button } from '@template/ui';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist."
        action={<Button onClick={() => router.push('/')}>Return Home</Button>}
      />
    </div>
  );
}
