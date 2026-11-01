import type { SupabaseClient } from '@supabase/supabase-js';
import { MysticAppointmentService } from '@template/api';
import {
  computeBookingQuote,
  getServiceWithOverrides,
  computePromoDiscountCents,
  isPromotionValid,
  normalizePromoCode,
  houseCallDistanceOutOfAreaMessage,
  isWithinHouseCallServiceArea,
  type ServiceId,
} from '@template/mystic';
import type { mysticCreateAppointmentSchema } from '@template/validation';
import type { z } from 'zod';
import { assertEntitlementForBooking } from '@/lib/mystic/entitlement';
import { loadStudioSurchargeRules } from '@/lib/mystic/studio-surcharge-rules';
import {
  loadStudioSettingsExtended,
  studioMenuOverrides,
} from '@/lib/mystic/studio-booking-config';
import { geocodeHouseCallAddress } from '@/lib/mystic/geocode';

export type MysticCreateAppointmentInput = z.infer<typeof mysticCreateAppointmentSchema>;

export async function prepareBookingCheckout(
  admin: SupabaseClient,
  clientUserId: string,
  parsed: MysticCreateAppointmentInput,
  options?: { skipPolicies?: boolean }
): Promise<
  | { ok: false; status: number; error: string }
  | {
      ok: true;
      service: ReturnType<typeof getServiceWithOverrides>;
      distanceMiles: number;
      serverQuote: ReturnType<typeof computeBookingQuote>;
      expectedQuoteCents: number;
      totalCents: number;
      depositCents: number;
      promoCode: string | null;
      discountCents: number;
    }
> {
  if (!options?.skipPolicies && !parsed.policiesAccepted) {
    return { ok: false, status: 400, error: 'Policies must be accepted' };
  }

  await new MysticAppointmentService(admin).cancelStalePending(parsed.workspaceId, 90);

  const settings = await loadStudioSettingsExtended(admin, parsed.workspaceId);
  const menuOverrides = studioMenuOverrides(settings);
  const depositCents = settings?.deposit_cents ?? 2500;

  const entitlementCheck = await assertEntitlementForBooking(admin, {
    workspaceId: parsed.workspaceId,
    userId: clientUserId,
    entitlement: parsed.entitlement,
    serviceId: parsed.serviceId,
  });
  if (!entitlementCheck.ok) {
    return { ok: false, status: 400, error: entitlementCheck.error };
  }

  const service = getServiceWithOverrides(parsed.serviceId, menuOverrides);
  let distanceMiles = parsed.distanceMiles;
  try {
    const geo = await geocodeHouseCallAddress(parsed.address);
    distanceMiles = geo.distanceMiles;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not verify address';
    if (!isWithinHouseCallServiceArea(distanceMiles)) {
      return {
        ok: false,
        status: 400,
        error: isWithinHouseCallServiceArea(parsed.distanceMiles)
          ? message
          : houseCallDistanceOutOfAreaMessage(parsed.distanceMiles),
      };
    }
    if (/outside our Chicago house-call area/i.test(message)) {
      return { ok: false, status: 400, error: message };
    }
  }

  if (!isWithinHouseCallServiceArea(distanceMiles)) {
    return {
      ok: false,
      status: 400,
      error: houseCallDistanceOutOfAreaMessage(distanceMiles),
    };
  }

  let discountCents = 0;
  let promoCode: string | null = null;
  if (parsed.promoCode?.trim()) {
    const code = normalizePromoCode(parsed.promoCode);
    const { data: promo } = await admin
      .from('mystic_promotions')
      .select('*')
      .eq('workspace_id', parsed.workspaceId)
      .eq('code', code)
      .maybeSingle();
    if (!promo || !isPromotionValid(promo)) {
      return { ok: false, status: 400, error: 'Promo code is invalid or expired' };
    }
    promoCode = code;
    const preTipBase = service.priceCents;
    const surchargeRules = await loadStudioSurchargeRules(admin, parsed.workspaceId);
    const draft = computeBookingQuote({
      serviceId: parsed.serviceId,
      scheduledAt: new Date(parsed.scheduledAt),
      distanceMiles,
      entitlement: parsed.entitlement,
      rules: surchargeRules,
      basePriceCents: service.priceCents,
    });
    const preTip = preTipBase + draft.surcharges.reduce((s, l) => s + l.amountCents, 0);
    discountCents = computePromoDiscountCents(preTip, promo);
  }

  const surchargeRules = await loadStudioSurchargeRules(admin, parsed.workspaceId);
  const quoteWithDiscount = computeBookingQuote({
    serviceId: parsed.serviceId as ServiceId,
    scheduledAt: new Date(parsed.scheduledAt),
    distanceMiles,
    entitlement: parsed.entitlement,
    tipCents: parsed.tipCents ?? 0,
    rules: surchargeRules,
    basePriceCents: service.priceCents,
    discountCents,
  });

  const usesCredit = parsed.entitlement !== 'none' && parsed.serviceId === 'blowout';
  const expectedQuoteCents = usesCredit ? 0 : quoteWithDiscount.totalCents - (parsed.tipCents ?? 0);
  if (Math.abs(parsed.quoteCents - expectedQuoteCents) > 1) {
    return { ok: false, status: 400, error: 'Quote expired — refresh and try again' };
  }

  const totalCents = expectedQuoteCents + (parsed.tipCents ?? 0);

  return {
    ok: true,
    service,
    distanceMiles,
    serverQuote: quoteWithDiscount,
    expectedQuoteCents,
    totalCents,
    depositCents,
    promoCode,
    discountCents,
  };
}
