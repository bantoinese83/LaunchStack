import type { ServiceId } from './catalog';
import { getServiceById } from './catalog';
import { formatStudioHourLabel } from './availability';

/** Studio timezone — Mystic runs Chicago house calls. */
export const MYSTIC_STUDIO_TIME_ZONE = 'America/Chicago';

/**
 * Hour of day (0–23) for an instant in a given timezone.
 *
 * `Date#getHours()` reads the *runtime* timezone: the visitor's browser on the
 * client, UTC on Vercel. The same booking therefore priced differently on each
 * side of checkout and the server rejected it as "Quote expired". Always price
 * against the studio's timezone instead.
 */
export function zonedHour(at: Date, timeZone: string = MYSTIC_STUDIO_TIME_ZONE): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(at);
    const hour = Number.parseInt(parts.find((p) => p.type === 'hour')?.value ?? '', 10);
    // Some ICU builds emit "24" for midnight under hour12:false.
    if (Number.isFinite(hour)) return hour % 24;
  } catch {
    /* unknown timezone — fall through to the runtime hour */
  }
  return at.getHours();
}

/** Defaults from discovery — override via admin settings when wired to Supabase. */
export const DEFAULT_SURCHARGE_RULES = {
  eveningStartHour: 20,
  eveningSurchargeCents: 2500,
  includedMiles: 5,
  perMileAfterIncludedCents: 500,
  defaultTravelBufferMinutes: 30,
  winterTravelBufferMinutes: 45,
  lateGraceMinutes: 15,
  maxInspoPhotos: 4,
} as const;

export type SurchargeRules = {
  eveningStartHour: number;
  eveningSurchargeCents: number;
  includedMiles: number;
  perMileAfterIncludedCents: number;
  defaultTravelBufferMinutes: number;
  winterTravelBufferMinutes: number;
};

export type StudioSettingsSurchargeSource = {
  evening_surcharge_cents?: number | null;
  included_miles?: number | null;
  per_mile_surcharge_cents?: number | null;
};

export function studioSettingsToSurchargeRules(
  settings?: StudioSettingsSurchargeSource | null
): SurchargeRules {
  return {
    eveningStartHour: DEFAULT_SURCHARGE_RULES.eveningStartHour,
    eveningSurchargeCents:
      settings?.evening_surcharge_cents ?? DEFAULT_SURCHARGE_RULES.eveningSurchargeCents,
    includedMiles: Number(settings?.included_miles ?? DEFAULT_SURCHARGE_RULES.includedMiles),
    perMileAfterIncludedCents:
      settings?.per_mile_surcharge_cents ?? DEFAULT_SURCHARGE_RULES.perMileAfterIncludedCents,
    defaultTravelBufferMinutes: DEFAULT_SURCHARGE_RULES.defaultTravelBufferMinutes,
    winterTravelBufferMinutes: DEFAULT_SURCHARGE_RULES.winterTravelBufferMinutes,
  };
}

export type ClientEntitlement = 'none' | 'membership' | 'package';

export type SurchargeLine = {
  code: 'evening' | 'distance';
  label: string;
  amountCents: number;
};

export type BookingQuoteInput = {
  serviceId: ServiceId;
  scheduledAt: Date;
  distanceMiles: number;
  entitlement: ClientEntitlement;
  tipCents?: number;
  winterBufferMode?: boolean;
  rules?: SurchargeRules;
  /** Override the studio timezone (tests / multi-market). */
  timeZone?: string;
};

export type BookingQuote = {
  baseCents: number;
  surcharges: SurchargeLine[];
  tipCents: number;
  totalCents: number;
  durationMinutes: number;
  travelBufferMinutes: number;
};

export function computeBookingQuote(input: BookingQuoteInput): BookingQuote {
  const rules = input.rules ?? studioSettingsToSurchargeRules();
  const service = getServiceById(input.serviceId);
  const surcharges: SurchargeLine[] = [];
  const exempt = input.entitlement === 'membership' || input.entitlement === 'package';

  if (!exempt && zonedHour(input.scheduledAt, input.timeZone) >= rules.eveningStartHour) {
    surcharges.push({
      code: 'evening',
      label: `After ${formatStudioHourLabel(rules.eveningStartHour)} house call`,
      amountCents: rules.eveningSurchargeCents,
    });
  }

  if (!exempt && input.distanceMiles > rules.includedMiles) {
    const extraMiles = input.distanceMiles - rules.includedMiles;
    const amountCents = Math.round(extraMiles * rules.perMileAfterIncludedCents);
    surcharges.push({
      code: 'distance',
      label: `Travel (${extraMiles.toFixed(1)} mi beyond ${rules.includedMiles} mi)`,
      amountCents,
    });
  }

  const tipCents = input.tipCents ?? 0;
  const surchargeTotal = surcharges.reduce((sum, line) => sum + line.amountCents, 0);
  const travelBufferMinutes = input.winterBufferMode
    ? rules.winterTravelBufferMinutes
    : rules.defaultTravelBufferMinutes;

  return {
    baseCents: service.priceCents,
    surcharges,
    tipCents,
    totalCents: service.priceCents + surchargeTotal + tipCents,
    durationMinutes: service.durationMinutes,
    travelBufferMinutes,
  };
}
