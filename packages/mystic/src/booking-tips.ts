import type { BookingQuote } from './pricing';

/** Quick-pick tip percentages (0 = no tip). */
export const BOOKING_TIP_PERCENT_PRESETS = [0, 18, 20, 25] as const;

export type BookingTipPresetPercent = (typeof BOOKING_TIP_PERCENT_PRESETS)[number];

export type BookingTipChoice =
  | { kind: 'preset'; percent: BookingTipPresetPercent }
  | { kind: 'customPercent'; percent: number }
  | { kind: 'customAmount'; amountCents: number };

export function bookingSubtotalBeforeTip(
  quote: Pick<BookingQuote, 'baseCents' | 'surcharges'>
): number {
  const surchargeTotal = quote.surcharges.reduce((sum, line) => sum + line.amountCents, 0);
  return quote.baseCents + surchargeTotal;
}

export function tipCentsFromPercent(subtotalCents: number, percent: number): number {
  if (!Number.isFinite(percent) || percent <= 0 || subtotalCents <= 0) return 0;
  return Math.round(subtotalCents * (percent / 100));
}

/** Parse a custom dollar tip field (e.g. "12", "12.50", "$15"). */
export function parseCustomTipDollarsToCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, '').trim();
  if (!cleaned) return null;
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

/** Parse a custom percent field (e.g. "22", "22%"). */
export function parseCustomTipPercent(input: string): number | null {
  const cleaned = input.replace(/%/g, '').trim();
  if (!cleaned) return null;
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0 || value > 100) return null;
  return value;
}

export function resolveBookingTipCents(subtotalCents: number, choice: BookingTipChoice): number {
  switch (choice.kind) {
    case 'preset':
    case 'customPercent':
      return tipCentsFromPercent(subtotalCents, choice.percent);
    case 'customAmount':
      return Math.max(0, Math.min(50_000, choice.amountCents));
    default:
      return 0;
  }
}

export function formatTipPresetLabel(percent: number, subtotalCents: number): string {
  if (percent === 0) return 'No tip';
  const cents = tipCentsFromPercent(subtotalCents, percent);
  return cents > 0 ? `${percent}% · ${formatUsdShort(cents)}` : `${percent}%`;
}

function formatUsdShort(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function buildTipChoiceFromUi(input: {
  preset: 'none' | 'cash' | 18 | 20 | 25 | 'custom';
  customPercent: string;
  customDollars: string;
}): BookingTipChoice {
  if (input.preset === 'none' || input.preset === 'cash') return { kind: 'preset', percent: 0 };
  if (input.preset === 18 || input.preset === 20 || input.preset === 25) {
    return { kind: 'preset', percent: input.preset };
  }
  const dollars = parseCustomTipDollarsToCents(input.customDollars);
  if (dollars != null && input.customDollars.trim()) {
    return { kind: 'customAmount', amountCents: dollars };
  }
  const pct = parseCustomTipPercent(input.customPercent);
  if (pct != null) return { kind: 'customPercent', percent: pct };
  return { kind: 'preset', percent: 0 };
}
