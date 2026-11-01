/** Shared plans / memberships UX copy (web + mobile). */

export const MYSTIC_PLANS_PAGE = {
  eyebrow: 'Plans',
  title: 'Memberships & packages',
  description:
    'House-call blowouts only — pick monthly Glow or Luxe, or prepaid packs. Credits apply automatically the next time you book.',
  returningCreditsTitle: 'Your blowout credits',
  returningCreditsHint: 'Pick a plan below to add more, or book now and we will use credits first.',
  bookCta: 'Book a blowout',
} as const;

export const MYSTIC_PLANS_TRUST = [
  'Credits at checkout',
  'No travel or evening fees on plan blowouts',
  'Cancel membership anytime',
] as const;

export const MYSTIC_PLANS_MEMBERSHIP_SECTION = {
  eyebrow: 'Monthly memberships',
  title: 'Glow & Luxe',
  description:
    'Recurring visits each month — travel and evening fees waived when you book on plan.',
} as const;

export const MYSTIC_PLANS_PACKAGES_SECTION = {
  eyebrow: 'Prepaid packages',
  title: 'Try Luke or gift credits',
  description: 'Pay once — use your visits within six months. Same fee waivers when you book.',
} as const;

export const MYSTIC_PLANS_REFERRAL_FOOTNOTE =
  'Refer a friend — both earn rewards after a first completed visit.';

export const MYSTIC_PLANS_SECTION_IDS = {
  memberships: 'monthly-memberships',
  packages: 'blowout-packages',
} as const;

export const MYSTIC_PLANS_CHOOSER = {
  title: 'Not sure which to pick?',
  membership: {
    kicker: 'Every month',
    title: 'Membership',
    hint: 'Glow (2 blowouts/mo) or Luxe (4/mo) — credits refresh automatically; cancel anytime.',
    cta: 'Compare memberships',
  },
  package: {
    kicker: 'Pay once',
    title: 'Blowout package',
    hint: 'Try Luke or gift credits — 4, 6, or 10 blowouts to use within six months.',
    cta: 'See packages',
  },
} as const;

export const MYSTIC_PLANS_ACCOUNT_NUDGE = {
  title: 'Save on every house-call blowout',
  body: 'Memberships and prepaid packages waive travel and evening fees.',
  cta: 'Browse plans',
} as const;

export function membershipSubscribeLabel(planName: string): string {
  return `Subscribe — ${planName}`;
}

/** Row heading — avoids repeating “blowout” beside the button. */
export function packageRowTitle(visitCount: number): string {
  return `${visitCount}-visit pack`;
}

export function packageBuyLabel(_blowoutCount?: number): string {
  return 'Buy package';
}

export function packageBuyAriaLabel(blowoutCount: number, priceLabel: string): string {
  return `Buy ${blowoutCount}-visit prepaid package, ${priceLabel}`;
}
