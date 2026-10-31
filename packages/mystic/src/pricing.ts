import type { ServiceId } from './catalog';
import { getServiceById } from './catalog';

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

  if (!exempt && input.scheduledAt.getHours() >= rules.eveningStartHour) {
    surcharges.push({
      code: 'evening',
      label: `After ${rules.eveningStartHour}:00 house call`,
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
