import { z } from 'zod';
import {
  APPOINTMENT_TAG_IDS,
  MYSTIC_DEFAULT_WORKSPACE_ID,
  PACKAGE_IDS,
  MEMBERSHIP_IDS,
  SERVICE_IDS,
} from '@template/mystic';

/** Seed Mystic workspace id is not RFC-4122; accept it plus standard UUIDs. */
export const mysticWorkspaceIdSchema = z.union([z.literal(MYSTIC_DEFAULT_WORKSPACE_ID), z.uuid()]);

export const mysticAddressSchema = z.object({
  line1: z.string().min(3, 'Street address is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'Use 2-letter state'),
  postalCode: z.string().min(5, 'ZIP code is required'),
  notes: z.string().max(500).optional(),
});

export const mysticBookingDraftSchema = z.object({
  serviceId: z.enum(SERVICE_IDS),
  scheduledAt: z.iso.datetime({ message: 'Pick a date and time' }),
  address: mysticAddressSchema,
  inspoPhotoCount: z.number().int().min(0).max(4),
  referredByName: z.string().max(120).optional(),
  appointmentTags: z.array(z.enum(APPOINTMENT_TAG_IDS)).max(4),
  policiesAccepted: z.boolean().refine((value) => value, {
    message: 'Please accept house-call policies',
  }),
  tipCents: z.number().int().min(0).max(50000).optional(),
  distanceMiles: z.number().min(0).max(100),
});

export const mysticClientProfileSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.email(),
  phone: z.string().min(10, 'Mobile number is required for SMS updates'),
  birthday: z.string().optional(),
  marketingSms: z.boolean().default(true),
  marketingEmail: z.boolean().default(true),
});

export const mysticMembershipCheckoutSchema = z.object({
  membershipId: z.enum(MEMBERSHIP_IDS),
});

export const mysticPackageCheckoutSchema = z.object({
  packageId: z.enum(PACKAGE_IDS),
});

export type MysticBookingDraftInput = z.infer<typeof mysticBookingDraftSchema>;
export type MysticClientProfileInput = z.infer<typeof mysticClientProfileSchema>;

export const mysticCreateAppointmentSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  serviceId: z.enum(SERVICE_IDS),
  scheduledAt: z.iso.datetime(),
  address: mysticAddressSchema,
  distanceMiles: z.number().min(0).max(100),
  entitlement: z.enum(['none', 'membership', 'package']),
  quoteCents: z.number().int().positive(),
  surchargeJson: z.array(
    z.object({ code: z.string(), label: z.string(), amountCents: z.number().int() })
  ),
  tipCents: z.number().int().min(0).optional(),
  tags: z.array(z.enum(APPOINTMENT_TAG_IDS)).optional(),
  referredByName: z.string().max(120).optional(),
  referralCode: z.string().max(16).optional(),
  clientNotes: z.string().max(1000).optional(),
  policiesAccepted: z.boolean().refine((value) => value, {
    message: 'Please accept house-call policies',
  }),
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

export const mysticSendMessageSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  /** Omit when the authenticated client is messaging Luke. */
  clientUserId: z.uuid().optional(),
  body: z.string().min(1).max(4000),
  appointmentId: z.uuid().optional(),
});

export const mysticBlastSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  channel: z.enum(['email', 'sms', 'both']),
  segment: z.enum(['all', 'members', 'packages', 'upcoming_week']),
  subject: z.string().max(120).optional(),
  body: z.string().min(1).max(4000),
});

export const mysticEnRouteSchema = z.object({
  appointmentId: z.uuid(),
  etaMinutes: z.number().int().min(1).max(180),
});

export const mysticDoorTimerSchema = z.object({
  appointmentId: z.uuid(),
});

export const mysticStudioSettingsSchema = z.object({
  workspaceId: mysticWorkspaceIdSchema,
  winterBufferEnabled: z.boolean().optional(),
  eveningSurchargeCents: z.number().int().optional(),
  includedMiles: z.number().optional(),
  perMileSurchargeCents: z.number().int().optional(),
  depositCents: z.number().int().optional(),
  doorTimerMinutes: z.number().int().min(5).max(60).optional(),
  referralRewardAfter: z.number().int().min(1).max(50).optional(),
});
