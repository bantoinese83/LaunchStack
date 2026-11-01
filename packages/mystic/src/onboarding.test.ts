import { describe, expect, it } from 'vitest';
import {
  MYSTIC_CLIENT_ONBOARDING,
  MYSTIC_ONBOARDING_STEPS,
  isOnboardingProfileComplete,
  mysticOnboardingStepIndex,
  needsClientOnboarding,
  nextOnboardingStepAfterIntro,
  resolveInitialOnboardingStep,
} from './onboarding';

describe('needsClientOnboarding', () => {
  it('requires welcome until completed timestamp exists', () => {
    expect(needsClientOnboarding(null)).toBe(true);
    expect(needsClientOnboarding(undefined)).toBe(true);
    expect(needsClientOnboarding('2026-11-01T12:00:00.000Z')).toBe(false);
  });
});

describe('MYSTIC_CLIENT_ONBOARDING', () => {
  it('defines shared welcome copy', () => {
    expect(MYSTIC_CLIENT_ONBOARDING.completeCta).toMatch(/book/i);
  });
});

describe('MYSTIC_ONBOARDING_STEPS', () => {
  it('orders intro → profile → visit', () => {
    expect(MYSTIC_ONBOARDING_STEPS).toEqual(['intro', 'profile', 'visit']);
    expect(mysticOnboardingStepIndex('visit')).toBe(2);
  });
});

describe('onboarding profile shortcuts', () => {
  it('detects complete contact info', () => {
    expect(isOnboardingProfileComplete('Sam', '3125550100')).toBe(true);
    expect(isOnboardingProfileComplete('S', '3125550100')).toBe(false);
  });

  it('starts on visit when profile is prefilled', () => {
    expect(resolveInitialOnboardingStep('Samara Lee', '312-555-0100')).toBe('visit');
    expect(resolveInitialOnboardingStep('', '')).toBe('intro');
    expect(nextOnboardingStepAfterIntro(true)).toBe('visit');
    expect(nextOnboardingStepAfterIntro(false)).toBe('profile');
  });
});
