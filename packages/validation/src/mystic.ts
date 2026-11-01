import { z } from 'zod';
import {
  APPOINTMENT_TAG_IDS,
  MYSTIC_DEFAULT_WORKSPACE_ID,
  MYSTIC_INSPO_BATCH_MAX,
  MYSTIC_MAX_HOUSE_CALL_DISTANCE_MILES,
  houseCallDistanceOutOfAreaMessage,
  PACKAGE_IDS,
  MEMBERSHIP_IDS,
  SERVICE_IDS,
} from '@template/mystic';

const mysticDistanceMilesSchema = z
  .number()
  .min(0)
  .superRefine((value, ctx) => {
    if (value > MYSTIC_MAX_HOUSE_CALL_DISTANCE_MILES) {
      ctx.addIssue({
        code: 'too_big',
        maximum: MYSTIC_MAX_HOUSE_CALL_DISTANCE_MILES,
        type: 'number',
        inclusive: true,
        message: houseCallDistanceOutOfAreaMessage(value),
        origin: 'number',
        input: value,
      });
    }
  });

/**
 * Seed ids (workspace + auth users) are UUID-shaped but often not RFC-4122.
 * Zod 4 `z.uuid()` rejects them with "Invalid UUID" — use `z.guid()` for auth/user ids.
 */
export const mysticUserIdSchema = z.guid({ error: 'Invalid user id' });

/** Seed Mystic workspace id is not RFC-4122; accept it plus GUID / UUID strings. */
export const mysticWorkspaceIdSchema = z.union([
  z.literal(MYSTIC_DEFAULT_WORKSPACE_ID),
  z.guid({ error: 'Invalid workspace id' }),
]);

const uniqueTagsRefine = (tags: string[], ctx: z.RefinementCtx) => {
  if (new Set(tags).size !== tags.length) {
    ctx.addIssue({ code: 'custom', message: 'Duplicate appointment tags' });
  }
};

export const mysticAppointmentTagsSchema = z
  .array(z.enum(APPOINTMENT_TAG_IDS))
  .max(4)
  .superRefine(uniqueTagsRefine);

export const mysticAddressSchema = z.object({
  line1: z.string().min(3, 'Street address is required'),
  line2: z.string().max(500).optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'Use 2-letter state'),
  postalCode: z.string().min(5, 'ZIP code is required'),
  notes: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const mysticBookingDraftSchema = z.object({
  serviceId: z.enum(SERVICE_IDS),
  scheduledAt: z.iso.datetime({ message: 'Pick a date and time' }),
  address: mysticAddressSchema,
  inspoPhotoCount: z.number().int().min(0).max(4),
  referredByName: z.string().max(120).optional(),
  appointmentTags: mysticAppointmentTagsSchema,
  policiesAccepted: z.boolean().refine((value) => value, {
    message: 'Please accept house-call policies',
  }),
  tipCents: z.number().int().min(0).max(50000).optional(),
  distanceMiles: mysticDistanceMilesSchema,
});

export const mysticClientOnboardingSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('skip'),
  }),
  z.object({
    action: z.literal('complete'),
    fullName: z.string().min(2).max(80),
    phone: z
      .string()
      .min(10, 'Mobile number is required for SMS updates')
      .max(20, 'Phone number is too long'),
    marketingSms: z.boolean().default(true),
  }),
]);

export const mysticClientProfileSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.email(),
  phone: z
    .string()
    .min(10, 'Mobile number is required for SMS updates')
    .max(20, 'Phone number is too long'),
  birthday: z.string().optional(),
  marketingSms: z.boolean().default(true),
  marketingEmail: z.boolean().default(true),
});

export const mysticMembershipCheckoutSchema = z.object({
  membershipId: z.enum(MEMBERSHIP_IDS),
  useMobileReturnDeepLink: z.boolean().optional(),
});

export const mysticPackageCheckoutSchema = z.object({
  packageId: z.enum(PACKAGE_IDS),
  useMobileReturnDeepLink: z.boolean().optional(),
});

export type MysticBookingDraftInput = z.infer<typeof mysticBookingDraftSchema>;
export type MysticClientProfileInput = z.infer<typeof mysticClientProfileSchema>;

export const mysticCreateAppointmentSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  serviceId: z.enum(SERVICE_IDS),
  scheduledAt: z.iso.datetime(),
  address: mysticAddressSchema,
  distanceMiles: mysticDistanceMilesSchema,
  entitlement: z.enum(['none', 'membership', 'package']),
  quoteCents: z.number().int().min(0),
  surchargeJson: z.array(
    z.object({ code: z.string(), label: z.string(), amountCents: z.number().int() })
  ),
  tipCents: z.number().int().min(0).max(50000).optional(),
  tags: mysticAppointmentTagsSchema.optional(),
  referredByName: z.string().max(120).optional(),
  referralCode: z.string().max(16).optional(),
  promoCode: z.string().max(32).optional(),
  clientNotes: z.string().max(1000).optional(),
  policiesAccepted: z.boolean().refine((value) => value, {
    message: 'Please accept house-call policies',
  }),
});

export const mysticStudioBookForClientSchema = mysticCreateAppointmentSchema
  .extend({
    clientUserId: mysticUserIdSchema,
    policiesAccepted: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.policiesAccepted === false) {
      ctx.addIssue({
        code: 'custom',
        message: 'Policies must be accepted for client bookings',
        path: ['policiesAccepted'],
      });
    }
  });

export const mysticGrantCreditSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  userId: mysticUserIdSchema,
  blowoutsRemaining: z.number().int().min(1).max(50),
  expiresAt: z.iso.datetime().optional(),
  note: z.string().max(200).optional(),
});

export const mysticBlockedIntervalSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
  reason: z.string().max(200).optional(),
});

export const mysticPromotionSchema = z
  .object({
    workspaceId: mysticWorkspaceIdSchema,
    code: z.string().min(2).max(32),
    label: z.string().max(120).optional(),
    percentOff: z.number().int().min(1).max(100).optional(),
    amountOffCents: z.number().int().min(1).max(50000).optional(),
    active: z.boolean().optional(),
    expiresAt: z.iso.datetime().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.percentOff == null && value.amountOffCents == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Set percent off or amount off',
        path: ['percentOff'],
      });
    }
  });

export const mysticStudioSchedulingSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  bookingStartHour: z.number().int().min(0).max(23).optional(),
  bookingEndHour: z.number().int().min(1).max(24).optional(),
  slotMinutes: z.number().int().min(15).max(60).optional(),
  weeklyHours: z.record(z.string(), z.unknown()).optional(),
});

export const mysticStudioMenuOverridesSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  menuOverrides: z.record(z.string(), z.unknown()),
});

export const mysticBlockedDateSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  blockDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(200).optional(),
});

export const mysticShopCheckoutSchema = z.object({
  productId: z.enum(['volume_mist', 'heat_shield', 'silk_serum'] as const),
  quantity: z.number().int().min(1).max(10).default(1),
});

export const mysticInspoUploadSchema = z.object({
  appointmentId: z.uuid(),
});

/**
 * Batch inspo read for the studio board — one request per batch of visits
 * instead of one request per visit (each of which re-authenticated).
 */
export const mysticInspoBatchSchema = z.object({
  appointmentIds: z.array(z.uuid()).min(1).max(MYSTIC_INSPO_BATCH_MAX),
});

export const mysticSendMessageSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  /** Omit when the authenticated client is messaging Luke. */
  clientUserId: mysticUserIdSchema.optional(),
  body: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, 'Message cannot be empty').max(4000)),
  appointmentId: z.uuid().optional(),
});

export const mysticBlastSchema = z
  .object({
    workspaceId: mysticWorkspaceIdSchema,
    channel: z.enum(['email', 'sms', 'both']),
    segment: z.enum(['all', 'members', 'packages', 'upcoming_week']),
    subject: z.string().max(120).optional(),
    body: z.string().min(1).max(4000),
    /** Appends checkout instructions when set. */
    promoCode: z.string().max(32).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.channel !== 'sms' && !value.subject?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Subject is required for email blasts',
        path: ['subject'],
      });
    }
  });

export const mysticEnRouteSchema = z.object({
  appointmentId: z.uuid(),
  etaMinutes: z.number().int().min(1).max(180),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const mysticShareLocationSchema = z.object({
  appointmentId: z.uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const mysticDoorTimerSchema = z.object({
  appointmentId: z.uuid(),
});

export const mysticStudioSettingsSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  winterBufferEnabled: z.boolean().optional(),
  eveningSurchargeCents: z.number().int().min(0).max(50000).optional(),
  includedMiles: z.number().min(0).max(100).optional(),
  perMileSurchargeCents: z.number().int().min(0).max(10000).optional(),
  depositCents: z.number().int().min(0).max(50000).optional(),
  doorTimerMinutes: z.number().int().min(5).max(60).optional(),
  referralRewardAfter: z.number().int().min(1).max(50).optional(),
});

export const mysticStudioAppointmentPatchSchema = z
  .object({
    workspaceId: mysticWorkspaceIdSchema,
    appointmentId: z.uuid(),
    action: z.enum(['cancel', 'reschedule']),
    startsAt: z.iso.datetime().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action === 'reschedule' && !value.startsAt) {
      ctx.addIssue({
        code: 'custom',
        message: 'startsAt required for reschedule',
        path: ['startsAt'],
      });
    }
  });
