import { NextResponse } from 'next/server';
import { MYSTIC_MEMBERSHIPS } from '@template/mystic';
import { firstZodIssueMessage, mysticMembershipCheckoutSchema } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { getStripeClient } from '@/lib/stripe';
import { getMysticWorkspaceId } from '@/lib/mystic/config';

function getMysticMembership(id: string) {
  const plan = MYSTIC_MEMBERSHIPS.find((m) => m.id === id);
  if (!plan) throw new Error('Unknown membership');
  return plan;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = mysticMembershipCheckoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const plan = getMysticMembership(parsed.data.membershipId);
    const priceId = process.env[`STRIPE_PRICE_MYSTIC_${plan.id.toUpperCase()}`];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL not configured' }, { status: 500 });
    }

    const stripe = getStripeClient({ allowDevMock: true });
    const workspaceId = getMysticWorkspaceId();

    if (!priceId) {
      return NextResponse.json(
        {
          error: `Set STRIPE_PRICE_MYSTIC_${plan.id.toUpperCase()} in env for ${plan.name}`,
        },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: auth.user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/memberships/success?plan=${plan.id}`,
      cancel_url: `${appUrl}/memberships`,
      metadata: {
        mystic_kind: 'membership',
        membership_id: plan.id,
        workspace_id: workspaceId,
        client_user_id: auth.user.id,
      },
      subscription_data: {
        metadata: {
          mystic_kind: 'membership',
          membership_id: plan.id,
          workspace_id: workspaceId,
          client_user_id: auth.user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.checkout.membership');
  }
}
