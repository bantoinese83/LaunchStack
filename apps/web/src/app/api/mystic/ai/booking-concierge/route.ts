import { NextResponse } from 'next/server';
import { MYSTIC_SERVICES } from '@template/mystic';
import { firstZodIssueMessage } from '@template/validation';
import { z } from 'zod';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { mysticAiConfigured, mysticGenerateJson } from '@/lib/mystic/ai/client';
import { enforceAiCooldown } from '@/lib/mystic/ai/cooldown';
import { mysticAiBrandSystem, formatServiceMenuCompact } from '@/lib/mystic/ai/prompts';
import { bookingConciergeSchema } from '@/lib/mystic/ai/schemas';

const bodySchema = z.object({
  prompt: z.string().min(4).max(500),
});

export async function POST(req: Request) {
  try {
    if (!mysticAiConfigured()) {
      return NextResponse.json({ error: 'AI assist is not configured' }, { status: 503 });
    }

    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const cooldown = await enforceAiCooldown(auth.user.id, 'booking-concierge');
    if (!cooldown.ok) return cooldown.response;

    const { data, model } = await mysticGenerateJson({
      system: mysticAiBrandSystem(
        'You are the Mystic booking concierge. Match clients to the best house-call service and coach them through booking.'
      ),
      prompt: `Client request:
"""${parsed.data.prompt.trim()}"""

Menu (ids must match exactly):
${formatServiceMenuCompact()}

Choose the best serviceId. Explain why in plain language (reason).
Add a practical tip (inspo, timing, clean/dry hair, chair).
If another service is a close runner-up, include it in alternatives (max 2).
Set confidence high only when the ask clearly maps to one service; medium for reasonable fits; low if you need more info — then set clarifyingQuestion.
Only suggest tags from: silent, open_to_chat, running_late, need_sink_wash — and only when the client clearly implies them (e.g. wants quiet, may be late, needs a sink wash).

Return JSON matching the schema.`,
      schema: bookingConciergeSchema,
      maxOutputTokens: 700,
      temperature: 0.35,
    });

    const service = MYSTIC_SERVICES.find((s) => s.id === data.serviceId)!;
    const alternatives = (data.alternatives ?? []).map((alt) => {
      const s = MYSTIC_SERVICES.find((x) => x.id === alt.serviceId);
      return {
        ...alt,
        serviceName: s?.name ?? alt.serviceId,
        priceCents: s?.priceCents,
        durationMinutes: s?.durationMinutes,
      };
    });

    return NextResponse.json({
      ...data,
      alternatives,
      serviceName: service.name,
      priceCents: service.priceCents,
      durationMinutes: service.durationMinutes,
      model,
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.ai.bookingConcierge');
  }
}
