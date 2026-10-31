import { NextResponse } from 'next/server';
import { MYSTIC_PACKAGES } from '@template/mystic';
import { firstZodIssueMessage, mysticPackageCheckoutSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { getStripeClient } from '@/lib/stripe';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticPackageCheckoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const pack = MYSTIC_PACKAGES.find((p) => p.id === parsed.data.packageId);
    if (!pack) {
      return NextResponse.json({ error: 'Unknown package' }, { status: 400 });
    }

    const priceId = process.env[`STRIPE_PRICE_MYSTIC_${pack.id.toUpperCase()}`];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL not configured' }, { status: 500 });
    }

    const stripe = getStripeClient({ allowDevMock: true });
    const workspaceId = getMysticWorkspaceId();

    if (!priceId) {
      return NextResponse.json(
        { error: `Set STRIPE_PRICE_MYSTIC_${pack.id.toUpperCase()} in env` },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: auth.user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/memberships/success?package=${pack.id}`,
      cancel_url: `${appUrl}/memberships`,
      metadata: {
        mystic_kind: 'package',
        package_id: pack.id,
        workspace_id: workspaceId,
        client_user_id: auth.user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.checkout.package');
  }
}
