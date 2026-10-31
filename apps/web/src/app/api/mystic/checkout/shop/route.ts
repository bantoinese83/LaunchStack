import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { MYSTIC_SHOP_ENABLED, getShopProductById, type ShopProductId } from '@template/mystic';
import { firstZodIssueMessage, mysticShopCheckoutSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { getStripeClient } from '@/lib/stripe';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    if (!MYSTIC_SHOP_ENABLED) {
      return NextResponse.json(
        { error: 'Shop coming soon — check back shortly.' },
        { status: 503 }
      );
    }

    const parsed = mysticShopCheckoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const product = getShopProductById(parsed.data.productId as ShopProductId);
    const amountCents = product.priceCents * parsed.data.quantity;
    const workspaceId = getMysticWorkspaceId();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL not configured' }, { status: 500 });
    }

    const admin = createSupabaseAdminClient();
    const { data: preorder, error: preErr } = await admin
      .from('mystic_preorders')
      .insert({
        workspace_id: workspaceId,
        user_id: auth.user.id,
        product_id: product.id,
        quantity: parsed.data.quantity,
        amount_cents: amountCents,
        status: 'pending',
      })
      .select('id')
      .single();
    if (preErr) throw preErr;

    const stripe = getStripeClient({ allowDevMock: true });
    if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production') {
      await admin.from('mystic_preorders').update({ status: 'paid' }).eq('id', preorder.id);
      return NextResponse.json({
        url: `${appUrl}/shop/success?preorder_id=${preorder.id}`,
        mock: true,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: auth.user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: product.priceCents,
            product_data: {
              name: `${product.name} — pre-order`,
              description: product.description,
            },
          },
          quantity: parsed.data.quantity,
        },
      ],
      success_url: `${appUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/shop`,
      metadata: {
        mystic_kind: 'preorder',
        preorder_id: preorder.id,
        workspace_id: workspaceId,
        product_id: product.id,
      },
    });

    await admin
      .from('mystic_preorders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', preorder.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.checkout.shop');
  }
}
