import { describe, expect, it } from 'vitest';
import { mysticClientOnboardingSchema, mysticCreateAppointmentSchema } from './mystic';

const validBase = {
  workspaceId: '33333333-3333-3333-3333-333333333333',
  serviceId: 'blowout' as const,
  scheduledAt: '2026-11-02T18:00:00.000Z',
  address: {
    line1: '123 Main St',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60601',
  },
  distanceMiles: 3,
  entitlement: 'none' as const,
  quoteCents: 4500,
  surchargeJson: [] as { code: string; label: string; amountCents: number }[],
  policiesAccepted: true,
};

describe('mysticCreateAppointmentSchema', () => {
  it('accepts referred-by name without referral code', () => {
    const parsed = mysticCreateAppointmentSchema.safeParse({
      ...validBase,
      referredByName: 'Jordan Lee',
    });
    expect(parsed.success).toBe(true);
  });

  it('still allows optional referral code for legacy clients', () => {
    const parsed = mysticCreateAppointmentSchema.safeParse({
      ...validBase,
      referralCode: 'MYSTIC123',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects checkout when policies are not accepted', () => {
    const parsed = mysticCreateAppointmentSchema.safeParse({
      ...validBase,
      policiesAccepted: false,
    });
    expect(parsed.success).toBe(false);
  });

  it('caps tip at $500', () => {
    const parsed = mysticCreateAppointmentSchema.safeParse({
      ...validBase,
      tipCents: 50_001,
    });
    expect(parsed.success).toBe(false);
  });
});

describe('mysticClientOnboardingSchema', () => {
  it('accepts skip', () => {
    expect(mysticClientOnboardingSchema.safeParse({ action: 'skip' }).success).toBe(true);
  });

  it('requires name and phone on complete', () => {
    const ok = mysticClientOnboardingSchema.safeParse({
      action: 'complete',
      fullName: 'Lauren Smith',
      phone: '3125550100',
      marketingSms: true,
    });
    expect(ok.success).toBe(true);

    const bad = mysticClientOnboardingSchema.safeParse({
      action: 'complete',
      fullName: 'L',
      phone: '123',
      marketingSms: false,
    });
    expect(bad.success).toBe(false);
  });
});
