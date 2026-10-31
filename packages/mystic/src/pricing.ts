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
  const service = getServiceById(input.serviceId);
  const surcharges: SurchargeLine[] = [];
  const exempt = input.entitlement === 'membership' || input.entitlement === 'package';

  if (!exempt && input.scheduledAt.getHours() >= DEFAULT_SURCHARGE_RULES.eveningStartHour) {
    surcharges.push({
      code: 'evening',
      label: 'After 8:00 PM house call',
      amountCents: DEFAULT_SURCHARGE_RULES.eveningSurchargeCents,
    });
  }

  if (!exempt && input.distanceMiles > DEFAULT_SURCHARGE_RULES.includedMiles) {
    const extraMiles = input.distanceMiles - DEFAULT_SURCHARGE_RULES.includedMiles;
    const amountCents = Math.round(extraMiles * DEFAULT_SURCHARGE_RULES.perMileAfterIncludedCents);
    surcharges.push({
      code: 'distance',
      label: `Travel (${extraMiles.toFixed(1)} mi beyond ${DEFAULT_SURCHARGE_RULES.includedMiles} mi)`,
      amountCents,
    });
  }

  const tipCents = input.tipCents ?? 0;
  const surchargeTotal = surcharges.reduce((sum, line) => sum + line.amountCents, 0);
  const travelBufferMinutes = input.winterBufferMode
    ? DEFAULT_SURCHARGE_RULES.winterTravelBufferMinutes
    : DEFAULT_SURCHARGE_RULES.defaultTravelBufferMinutes;

  return {
    baseCents: service.priceCents,
    surcharges,
    tipCents,
    totalCents: service.priceCents + surchargeTotal + tipCents,
    durationMinutes: service.durationMinutes,
    travelBufferMinutes,
  };
}
