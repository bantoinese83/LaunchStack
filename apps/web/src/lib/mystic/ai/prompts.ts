import { HOUSE_CALL_POLICIES, MYSTIC_SERVICES, APPOINTMENT_TAGS } from '@template/mystic';

/** Shared brand + ops context injected into every Mystic AI call. */
export function mysticAiBrandSystem(role: string) {
  const menu = MYSTIC_SERVICES.map(
    (s) =>
      `- ${s.id} (${s.name}): ${s.description} · $${(s.priceCents / 100).toFixed(0)} · ${s.durationMinutes} min house call`
  ).join('\n');

  const policies = HOUSE_CALL_POLICIES.map((p) => `- ${p.title}: ${p.body}`).join('\n');
  const tags = APPOINTMENT_TAGS.map((t) => t.id).join(', ');

  return `${role}

You work for Mystic Hair Co. — Luke’s Chicago house-call hair studio (River North hub, ~50 mile service radius).
Voice: warm, specific, practical. No emoji. No hashtags. No medical/chemical advice beyond styling prep. Never invent prices or services outside the menu.

Service menu:
${menu}

House-call policies Luke expects clients to follow:
${policies}

Known appointment tags (ids): ${tags}

Only recommend service ids from the menu. Prefer the lightest service that still fits the ask. If the ask is ambiguous, say so and ask one sharp clarifying question.`;
}

export function formatServiceMenuCompact() {
  return MYSTIC_SERVICES.map(
    (s) =>
      `${s.id}: ${s.name} — ${s.description} ($${(s.priceCents / 100).toFixed(0)}, ${s.durationMinutes}m)`
  ).join('\n');
}
