import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { computePromoDiscountCents, isPromotionValid, normalizePromoCode } from '@template/mystic';
import { routeErrorResponse } from '@/lib/api/route-auth';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const subtotalCents = Number.parseInt(url.searchParams.get('subtotalCents') ?? '', 10);
    const workspaceId = url.searchParams.get('workspaceId') ?? getMysticWorkspaceId();

    if (!code?.trim() || !Number.isFinite(subtotalCents) || subtotalCents < 0) {
      return NextResponse.json({ error: 'code and subtotalCents required' }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const normalized = normalizePromoCode(code);
    const { data: promo } = await admin
      .from('mystic_promotions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('code', normalized)
      .maybeSingle();

    if (!promo || !isPromotionValid(promo)) {
      return NextResponse.json({ valid: false, discountCents: 0 });
    }

    const discountCents = computePromoDiscountCents(subtotalCents, promo);
    return NextResponse.json({ valid: true, discountCents, code: normalized });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.promo.preview');
  }
}
