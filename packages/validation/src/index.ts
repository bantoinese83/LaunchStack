import { z } from 'zod';
import { FEEDBACK_CATEGORIES, FEEDBACK_STATUSES, INVITABLE_WORKSPACE_ROLES } from '@template/types';

export { firstZodIssueMessage, slugifyWorkspaceName, getErrorMessage } from './helpers';

// AUTH SCHEMAS
export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// WORKSPACE SCHEMAS
export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(50, 'Workspace name too long'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(30, 'Slug cannot exceed 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(50, 'Workspace name too long')
    .optional(),
  logoUrl: z.url('Invalid image URL').nullable().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.email('Please enter a valid email address'),
  role: z.enum(INVITABLE_WORKSPACE_ROLES),
});

export const createWorkspaceInviteSchema = inviteMemberSchema.extend({
  workspaceId: z.uuid('Invalid workspace ID'),
});

// FEEDBACK SCHEMAS
export const createFeedbackSchema = z.object({
  workspaceId: z.uuid('Invalid workspace ID'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description too long'),
  category: z.enum(FEEDBACK_CATEGORIES),
});

export const updateFeedbackStatusSchema = z.object({
  postId: z.uuid('Invalid post ID'),
  status: z.enum(FEEDBACK_STATUSES),
});

// BILLING SCHEMAS
export const createCheckoutSchema = z.object({
  workspaceId: z.uuid('Invalid workspace ID'),
  priceId: z.string().min(1, 'Price ID is required'),
});

export const createPortalSchema = z.object({
  workspaceId: z.uuid('Invalid workspace ID'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(16, 'Invite token is required'),
});

export const consentSchema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
});

export type CreatePortalInput = z.infer<typeof createPortalSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
export type ConsentInput = z.infer<typeof consentSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateWorkspaceInviteInput = z.infer<typeof createWorkspaceInviteSchema>;
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackStatusInput = z.infer<typeof updateFeedbackStatusSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
