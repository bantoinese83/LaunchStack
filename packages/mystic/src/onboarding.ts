import { HOUSE_CALL_POLICIES } from './policies';
import { stripUsPhoneDigits } from './phone';

export const MYSTIC_ONBOARDING_STEPS = ['intro', 'profile', 'visit'] as const;
export type MysticOnboardingStep = (typeof MYSTIC_ONBOARDING_STEPS)[number];

export function mysticOnboardingStepIndex(step: MysticOnboardingStep): number {
  return MYSTIC_ONBOARDING_STEPS.indexOf(step);
}

export const MYSTIC_ONBOARDING_STEP_LABEL: Record<MysticOnboardingStep, string> = {
  intro: 'Welcome',
  profile: 'You',
  visit: 'Visit',
};

export const MYSTIC_ONBOARDING_STEP_HINT: Record<MysticOnboardingStep, string> = {
  intro: 'House-call blowouts in Chicago',
  profile: 'How Luke reaches you',
  visit: 'What to have ready at home',
};

export const MYSTIC_ONBOARDING_VALUE_PROPS = [
  {
    id: 'door',
    title: 'Luke comes to you',
    body: 'Book a blowout at home — pro kit, setup, and finish included.',
  },
  {
    id: 'text',
    title: 'Text when it matters',
    body: 'On-the-way and arrival texts so you’re never guessing.',
  },
  {
    id: 'credits',
    title: 'Plans apply at checkout',
    body: 'Membership and package credits show up automatically when you book.',
  },
] as const;

export const MYSTIC_CLIENT_ONBOARDING = {
  kicker: 'Welcome',
  title: 'House calls, made simple',
  lede: 'Two quick steps — then you’re ready to book Luke at your door.',
  introTitle: 'You’re in the right place',
  introLede: 'Mystic is built for busy Chicago schedules: book once, Luke handles the rest.',
  profileTitle: 'Your contact info',
  profileLede: 'We only use this for confirmations and house-call texts — never spam.',
  visitTitle: 'Before Luke arrives',
  visitLede: 'A quick read so your first visit feels effortless.',
  profileOnFileHint: 'Contact info on file — use Back to edit name or mobile.',
  visitPlansNudge: 'Blowouts every month?',
  phoneHint: 'Used for on-the-way and arrival texts. We never spam.',
  smsLabel: 'Text me appointment updates (on the way, arrival, confirmations)',
  policiesIntro: 'House-call checklist',
  completeCta: 'Continue to book',
  finishCta: 'Finish setup',
  continueCta: 'Continue',
  backCta: 'Back',
  skipCta: 'Set up later',
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

/** Brief success beat before routing to book (web + mobile). */
export const MYSTIC_ONBOARDING_CELEBRATION_MS = 1500;

export function isOnboardingProfileComplete(fullName: string, phone: string): boolean {
  return fullName.trim().length >= 2 && stripUsPhoneDigits(phone).length >= 10;
}

/** First screen after profile fetch — skip intro/profile when contact info is already saved. */
export function resolveInitialOnboardingStep(
  fullName: string,
  phone: string
): MysticOnboardingStep {
  return isOnboardingProfileComplete(fullName, phone) ? 'visit' : 'intro';
}

/** After the welcome step — jump to policies when name + phone are already valid. */
export function nextOnboardingStepAfterIntro(profileComplete: boolean): MysticOnboardingStep {
  return profileComplete ? 'visit' : 'profile';
}
