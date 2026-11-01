/** Query param and storage key for friend invite attribution (web + mobile). */
export const MYSTIC_REFERRAL_QUERY_PARAM = 'ref' as const;
export const MYSTIC_REFERRAL_STORAGE_KEY = 'mystic_referral_code' as const;

export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const normalized = raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (normalized.length < 4 || normalized.length > 16) return null;
  return normalized;
}

/** Short public path encoded in QR codes (→ invite landing). */
export function buildReferralShortPath(code: string): string {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return '/book';
  return `/r/${encodeURIComponent(normalized)}`;
}

export function buildReferralBookPath(code: string): string {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return '/book';
  return `/book?${MYSTIC_REFERRAL_QUERY_PARAM}=${encodeURIComponent(normalized)}`;
}

export function buildReferralSignupPath(code: string): string {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return '/signup';
  return `/signup?${MYSTIC_REFERRAL_QUERY_PARAM}=${encodeURIComponent(normalized)}`;
}

export function buildReferralInviteUrl(siteOrigin: string, code: string): string {
  const origin = siteOrigin.replace(/\/$/, '');
  const normalized = normalizeReferralCode(code);
  if (!normalized) return `${origin}/book`;
  return `${origin}${buildReferralShortPath(normalized)}`;
}

/** Prefer stored referral code at checkout; fall back to free-text name. */
export function referralCodeForCheckout(
  referralCode: string | null | undefined,
  referredByName: string
): { referralCode?: string; referredByName?: string } {
  const normalized = normalizeReferralCode(referralCode);
  if (normalized) return { referralCode: normalized };
  const name = referredByName.trim();
  if (name.length >= 2) return { referredByName: name };
  return {};
}

export const MYSTIC_REFERRAL_SHARE = {
  inviteTitle: 'Invite friends',
  inviteBody: 'Scan or share your link — when friends book, you earn toward a free blowout.',
  codeLabel: 'Your code',
  linkLabel: 'Invite link',
  copyLink: 'Copy link',
  copyCode: 'Copy code',
  downloadQr: 'Download QR',
  printCard: 'Print card',
  appliedBadge: 'Friend referral applied',
  appliedHint: 'This booking counts toward their referral reward.',
} as const;
