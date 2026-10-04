import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BrevoEmailService } from '@template/email';
import { firstZodIssueMessage } from '@template/validation';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

const welcomeEmailSchema = z.object({
  to: z.string().email(),
  name: z.string().min(1).max(120),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;
    const user = auth.user;

    // ── 2. Validate payload ─────────────────────────────────────────────────
    const body = await req.json();
    const parsed = welcomeEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    // ── 3. Authorize: recipient must match the calling user's own email ──────
    // Prevents using this route as a spam relay for arbitrary addresses.
    if (parsed.data.to !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── 4. Send email ───────────────────────────────────────────────────────
    const emailService = new BrevoEmailService();
    const result = await emailService.sendWelcomeEmail(parsed.data.to, parsed.data.name);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (err) {
    return routeErrorResponse(err, '[Welcome Email Route Error]');
  }
}
