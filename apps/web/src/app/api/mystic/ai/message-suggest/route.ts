import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import { getServiceById, STUDIO_MESSAGE_QUICK_REPLIES, type ServiceId } from '@template/mystic';
import {
  firstZodIssueMessage,
  mysticUserIdSchema,
  mysticWorkspaceIdSchema,
} from '@template/validation';
import { z } from 'zod';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { mysticAiConfigured, mysticGenerateJson } from '@/lib/mystic/ai/client';
import { enforceAiCooldown } from '@/lib/mystic/ai/cooldown';
import { mysticAiBrandSystem } from '@/lib/mystic/ai/prompts';
import { messageSuggestSchema } from '@/lib/mystic/ai/schemas';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

const bodySchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  clientUserId: mysticUserIdSchema,
  appointmentId: z.guid().optional(),
});

export async function POST(req: Request) {
  try {
    if (!mysticAiConfigured()) {
      return NextResponse.json({
        replies: [...STUDIO_MESSAGE_QUICK_REPLIES],
        fallback: true,
      });
    }

    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const cooldown = await enforceAiCooldown(auth.user.id, 'message-suggest');
    if (!cooldown.ok) return cooldown.response;

    const admin = createSupabaseAdminClient();
    const [{ data: profile }, { data: messages }, { data: appt }] = await Promise.all([
      admin.from('profiles').select('full_name').eq('id', parsed.data.clientUserId).maybeSingle(),
      admin
        .from('mystic_messages')
        .select('sender_role, body, created_at')
        .eq('workspace_id', parsed.data.workspaceId)
        .eq('client_user_id', parsed.data.clientUserId)
        .order('created_at', { ascending: false })
        .limit(16),
      parsed.data.appointmentId
        ? admin
            .from('mystic_appointments')
            .select('status, starts_at, service_id, client_notes, address')
            .eq('id', parsed.data.appointmentId)
            .maybeSingle()
        : admin
            .from('mystic_appointments')
            .select('status, starts_at, service_id, client_notes, address')
            .eq('workspace_id', parsed.data.workspaceId)
            .eq('client_user_id', parsed.data.clientUserId)
            .in('status', ['confirmed', 'stylist_en_route', 'door_timer_active', 'in_progress'])
            .order('starts_at', { ascending: true })
            .limit(1)
            .maybeSingle(),
    ]);

    const thread = [...(messages ?? [])]
      .reverse()
      .map((m) => `${m.sender_role}: ${String(m.body).slice(0, 200)}`)
      .join('\n');

    let serviceName = appt?.service_id ? String(appt.service_id) : 'unknown';
    if (appt?.service_id) {
      try {
        serviceName = getServiceById(appt.service_id as ServiceId).name;
      } catch {
        /* keep id */
      }
    }

    const lastClient = [...(messages ?? [])].find((m) => m.sender_role === 'client');

    const { data, model } = await mysticGenerateJson({
      system: mysticAiBrandSystem(
        'You draft short SMS-style replies for Luke (stylist). Sound like a real Chicago house-call stylist: warm, clear, specific to the thread.'
      ),
      prompt: `Suggest 3–5 tap-to-send replies Luke can use right now. Vary intent (answer their question, confirm logistics, ETA/status, soft close). Each under 160 chars.

Client: ${profile?.full_name?.trim() || 'Client'}
Visit status: ${appt?.status ?? 'no active visit'}
Service: ${serviceName}
When: ${appt?.starts_at ?? 'unknown'}
Visit notes: ${String(appt?.client_notes ?? '').trim() || 'none'}
Last client message: ${lastClient ? String(lastClient.body).slice(0, 200) : '(none)'}
Recent thread (oldest→newest):
${thread || '(empty — offer useful openers for a new conversation)'}

Also set situation to a one-line read of what they need.
JSON: { "replies": string[3-5], "situation"?: string }`,
      schema: messageSuggestSchema,
      maxOutputTokens: 600,
      temperature: 0.45,
    });

    return NextResponse.json({
      replies: data.replies,
      situation: data.situation ?? null,
      model,
      fallback: false,
    });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.ai.messageSuggest');
  }
}
