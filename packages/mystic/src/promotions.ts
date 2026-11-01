export type MysticPromotionRow = {
  id: string;
  workspace_id: string;
  code: string;
  label: string;
  percent_off: number | null;
  amount_off_cents: number | null;
  active: boolean;
  expires_at: string | null;
};

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function computePromoDiscountCents(
  subtotalCents: number,
  promo: Pick<MysticPromotionRow, 'percent_off' | 'amount_off_cents'>
): number {
  if (subtotalCents <= 0) return 0;
  if (promo.percent_off != null) {
    return Math.min(subtotalCents, Math.round((subtotalCents * promo.percent_off) / 100));
  }
  if (promo.amount_off_cents != null) {
    return Math.min(subtotalCents, promo.amount_off_cents);
  }
  return 0;
}

export function isPromotionValid(promo: MysticPromotionRow, now = new Date()): boolean {
  if (!promo.active) return false;
  if (promo.expires_at && new Date(promo.expires_at).getTime() <= now.getTime()) return false;
  return true;
}
