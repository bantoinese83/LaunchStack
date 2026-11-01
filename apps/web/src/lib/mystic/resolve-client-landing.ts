import { needsClientOnboarding } from '@template/mystic';
import { fetchOnboardingCompletedAt } from '@/lib/mystic/client-onboarding-api';

export function sanitizeClientNext(next: string | null | undefined): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return '/account';
}

export async function resolveWebClientLanding(next?: string | null): Promise<string> {
  const completedAt = await fetchOnboardingCompletedAt();
  if (completedAt === undefined) {
    return sanitizeClientNext(next);
  }
  if (needsClientOnboarding(completedAt)) return '/welcome';
  return sanitizeClientNext(next);
}
