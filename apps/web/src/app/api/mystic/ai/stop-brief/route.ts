import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@template/api';
import {
  formatAddressLine,
  formatAppointmentTagLabels,
  getServiceById,
  type ServiceId,
} from '@template/mystic';
import { firstZodIssueMessage, mysticWorkspaceIdSchema } from '@template/validation';
import { z } from 'zod';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';
import { mysticAiConfigured, mysticGenerateJson } from '@/lib/mystic/ai/client';
import { enforceAiCooldown, readAiCache, writeAiCache } from '@/lib/mystic/ai/cooldown';
import { mysticAiBrandSystem } from '@/lib/mystic/ai/prompts';
import { stopBriefSchema } from '@/lib/mystic/ai/schemas';
import { requireStudioManager } from '@/lib/mystic/studio-auth';

const bodySchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  appointmentId: z.guid(),
  force: z.boolean().optional(),
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

    const forbidden = await requireStudioManager(auth.user, parsed.data.workspaceId);
    if (forbidden) return forbidden;

    const cacheKey = `mystic:ai:stop-brief:v2:${parsed.data.appointmentId}`;
    if (!parsed.data.force) {
      const cached = await readAiCache<{ brief: z.infer<typeof stopBriefSchema>; model: string }>(
        cacheKey
      );
      if (cached) {
        return NextResponse.json({ ...cached, cached: true });
      }
    }

    const cooldown = await enforceAiCooldown(auth.user.id, 'stop-brief');
    if (!cooldown.ok) return cooldown.response;

    const admin = createSupabaseAdminClient();
    const { data: appt, error } = await admin
      .from('mystic_appointments')
      .select(
        'id, service_id, status, starts_at, address, tags, client_notes, client_user_id, workspace_id'
      )
      .eq('id', parsed.data.appointmentId)
      .eq('workspace_id', parsed.data.workspaceId)
      .maybeSingle();
    if (error) throw error;
    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const [
      { data: profile },
      { data: mysticProfile },
      { count: inspoCount },
      { data: priorVisits },
      { data: recentMsgs },
    ] = await Promise.all([
      admin.from('profiles').select('full_name, email').eq('id', appt.client_user_id).maybeSingle(),
      admin
        .from('mystic_client_profiles')
        .select('phone, referral_code')
        .eq('user_id', appt.client_user_id)
        .maybeSingle(),
      admin
        .from('mystic_appointment_photos')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_id', appt.id),
      admin
        .from('mystic_appointments')
        .select('service_id, status, starts_at, client_notes')
        .eq('workspace_id', parsed.data.workspaceId)
        .eq('client_user_id', appt.client_user_id)
        .neq('id', appt.id)
        .order('starts_at', { ascending: false })
        .limit(4),
      admin
        .from('mystic_messages')
        .select('sender_role, body, created_at')
        .eq('workspace_id', parsed.data.workspaceId)
        .eq('client_user_id', appt.client_user_id)
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

    let serviceName = String(appt.service_id);
    let durationMinutes: number | null = null;
    try {
      const service = getServiceById(appt.service_id as ServiceId);
      serviceName = service.name;
      durationMinutes = service.durationMinutes;
    } catch {
      /* keep id */
    }

    const clientName = profile?.full_name?.trim() || profile?.email?.split('@')[0] || 'Client';
    const addressLine = formatAddressLine(appt.address as Record<string, unknown>);
    const tagLabels = formatAppointmentTagLabels((appt.tags as string[] | null) ?? []);
    const prior = (priorVisits ?? [])
      .map((v) => {
        let name = String(v.service_id);
        try {
          name = getServiceById(v.service_id as ServiceId).name;
        } catch {
          /* keep */
        }
        return `${v.starts_at?.slice(0, 10) ?? '?'} · ${name} · ${v.status}${
          v.client_notes ? ` · notes: ${String(v.client_notes).slice(0, 80)}` : ''
        }`;
      })
      .join('\n');
    const thread = [...(recentMsgs ?? [])]
      .reverse()
      .map((m) => `${m.sender_role}: ${String(m.body).slice(0, 140)}`)
      .join('\n');

    const { data: brief, model } = await mysticGenerateJson({
      system: mysticAiBrandSystem(
        'You are Luke’s road-trip stop brief writer. Produce actionable pre-arrival briefs he can skim in under 20 seconds.'
      ),
      prompt: `Build a pre-stop brief for Luke.

Client: ${clientName}
Service: ${serviceName}${durationMinutes ? ` (${durationMinutes} min)` : ''}
Status: ${appt.status}
When: ${appt.starts_at}
Address: ${addressLine || 'not set — flag this'}
Tags: ${tagLabels.join(', ') || 'none'}
Client booking notes: ${String(appt.client_notes ?? '').trim() || 'none'}
Phone on file: ${mysticProfile?.phone ? 'yes' : 'no — may need to confirm contact'}
Inspo photos uploaded: ${inspoCount ?? 0}
Prior visits:
${prior || '(first visit or no history)'}
Recent thread:
${thread || '(no messages)'}

Write:
- headline: who + what + vibe in one line
- bullets: 2–6 concrete actions (access, timing, hair state, inspo, parking)
- bring / kit: tools or products that matter beyond the standard kit
- vibe: short mood note
- opener: one warm SMS/door line Luke can use
- watchouts: logistics risks only if relevant

Be specific to THIS stop. Do not invent gate codes or parking details that are not in the notes.`,
      schema: stopBriefSchema,
      maxOutputTokens: 900,
      temperature: 0.35,
    });

    const payload = { brief, model };
    await writeAiCache(cacheKey, payload, 900);
    return NextResponse.json({ ...payload, cached: false });
  } catch (err) {
    return routeErrorResponse(err, 'mystic.ai.stopBrief');
  }
}
