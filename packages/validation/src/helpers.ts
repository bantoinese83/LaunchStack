import type { ZodError } from 'zod';

/** First human-readable message from a Zod validation failure. */
export function firstZodIssueMessage(error: ZodError, fallback = 'Invalid input'): string {
  return error.issues[0]?.message ?? fallback;
}

/** Derive a URL-safe workspace slug from a display name. */
export function slugifyWorkspaceName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Normalize unknown thrown values into a user-facing error string. */
export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
