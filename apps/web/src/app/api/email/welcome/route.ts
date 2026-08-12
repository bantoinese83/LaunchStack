import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BrevoEmailService } from '@template/email';

const welcomeEmailSchema = z.object({
  to: z.string().email(),
  name: z.string().min(1).max(120),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = welcomeEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const emailService = new BrevoEmailService();
    const result = await emailService.sendWelcomeEmail(parsed.data.to, parsed.data.name);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[Welcome Email Route Error]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
