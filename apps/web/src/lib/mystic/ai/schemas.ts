import { APPOINTMENT_TAG_IDS, SERVICE_IDS } from '@template/mystic';
import { z } from 'zod';

export const stopBriefSchema = z.object({
  headline: z.string().min(2).max(90),
  bullets: z.array(z.string().min(2).max(160)).min(2).max(6),
  bring: z.string().min(2).max(140).optional(),
  vibe: z.string().min(2).max(100).optional(),
  /** SMS-ready first line Luke can send / say on arrival. */
  opener: z.string().min(4).max(140).optional(),
  /** Risks / logistics to watch (parking, gate, wet hair, timing). */
  watchouts: z.array(z.string().min(2).max(140)).max(4).optional(),
  /** Kit pieces beyond the usual that matter for this stop. */
  kit: z.array(z.string().min(2).max(80)).max(5).optional(),
});

export type StopBrief = z.infer<typeof stopBriefSchema>;

export const messageSuggestSchema = z.object({
  replies: z.array(z.string().min(2).max(160)).min(3).max(5),
  /** One-line read of what the client needs right now. */
  situation: z.string().min(4).max(160).optional(),
});

export type MessageSuggest = z.infer<typeof messageSuggestSchema>;

const serviceIdSchema = z.enum(SERVICE_IDS);

export const bookingConciergeSchema = z.object({
  serviceId: serviceIdSchema,
  reason: z.string().min(12).max(280),
  tip: z.string().min(4).max(200).optional(),
  confidence: z.enum(['high', 'medium', 'low']).default('medium'),
  clarifyingQuestion: z.string().min(8).max(180).optional(),
  alternatives: z
    .array(
      z.object({
        serviceId: serviceIdSchema,
        why: z.string().min(8).max(160),
      })
    )
    .max(2)
    .optional(),
  suggestedTags: z.array(z.enum(APPOINTMENT_TAG_IDS)).max(3).optional(),
});

export type BookingConcierge = z.infer<typeof bookingConciergeSchema>;
