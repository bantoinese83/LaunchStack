import { describe, expect, it } from 'vitest';
import { MYSTIC_CLIENT_ONBOARDING, needsClientOnboarding } from './onboarding';

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
