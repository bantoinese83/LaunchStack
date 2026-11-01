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

export const MYSTIC_PLANS_SECTION_IDS = {
  memberships: 'monthly-memberships',
  packages: 'blowout-packages',
} as const;

export const MYSTIC_PLANS_CHOOSER = {
  title: 'Not sure which to pick?',
  membership: {
    title: 'Monthly membership',
    hint: 'Best if you want blowouts every month — Glow (2/mo) or Luxe (4/mo).',
    cta: 'Compare memberships',
  },
  package: {
    title: 'Prepaid package',
    hint: 'Best to try Luke or gift yourself — 4, 6, or 10 blowouts, use within 6 months.',
    cta: 'See blowout packages',
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

export function packageBuyLabel(blowoutCount: number): string {
  return `Buy ${blowoutCount}-blowout package`;
}
