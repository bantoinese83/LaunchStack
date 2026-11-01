import { HOUSE_CALL_POLICIES } from './policies';

export const MYSTIC_CLIENT_ONBOARDING = {
  kicker: 'Welcome',
  title: 'House calls, made simple',
  lede: 'Book Luke at your door in Chicago — a quick setup helps your first visit go smoothly.',
  phoneHint: 'Used for on-the-way and arrival texts. We never spam.',
  smsLabel: 'SMS appointment updates',
  policiesIntro: 'Before your first visit',
  completeCta: 'Continue to book',
  skipCta: 'Skip for now',
  bookCta: 'Book a house call',
} as const;

/** Policy bullets shown once at onboarding (matches checkout rules). */
export const MYSTIC_ONBOARDING_POLICY_SNIPPETS = HOUSE_CALL_POLICIES.map((p) => ({
  id: p.id,
  title: p.title,
  body: p.body,
}));

export function needsClientOnboarding(onboardingCompletedAt: string | null | undefined): boolean {
  return !onboardingCompletedAt;
}
