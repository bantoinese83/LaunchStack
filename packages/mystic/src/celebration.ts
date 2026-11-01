import { MYSTIC_MEMBERSHIPS, MYSTIC_PACKAGES, type MembershipId, type PackageId } from './catalog';

export type MysticCelebrationKind = 'booking' | 'membership' | 'package' | 'onboarding';

export type MysticCelebrationContent = {
  eyebrow: string;
  title: string;
  body: string;
};

export function getCelebrationContent(
  kind: MysticCelebrationKind,
  productId?: string
): MysticCelebrationContent {
  if (kind === 'onboarding') {
    return {
      eyebrow: 'All set',
      title: 'Ready to book',
      body: 'Your profile is saved — pick a time and Luke comes to you.',
    };
  }
  if (kind === 'booking') {
    return {
      eyebrow: 'Confirmed',
      title: "You're on the books",
      body: 'Luke will see you soon — check SMS for on-the-way and arrival updates.',
    };
  }
  if (kind === 'membership') {
    const plan = MYSTIC_MEMBERSHIPS.find((m) => m.id === (productId as MembershipId));
    return {
      eyebrow: 'Active',
      title: plan ? `Welcome to ${plan.name}` : 'Membership active',
      body: 'Your blowout credits apply automatically the next time you book.',
    };
  }
  const pack = MYSTIC_PACKAGES.find((p) => p.id === (productId as PackageId));
  return {
    eyebrow: 'Active',
    title: pack ? `${pack.blowoutCount} blowouts added` : 'Package active',
    body: 'Credits apply on your next blowout booking — travel and evening fees waived.',
  };
}
