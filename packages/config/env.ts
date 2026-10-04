import { z } from 'zod';

// ── Building blocks ───────────────────────────────────────────────────────────

/**
 * http(s)-only URL check.
 *
 * `z.url()` on its own accepts any scheme (`javascript:`, `ftp:`, …). These
 * values are interpolated into redirect URLs and API clients, so only web
 * endpoints are accepted.
 */
const httpUrl = (message: string) => z.url({ protocol: /^https?$/, error: message });

/**
 * Required, non-empty string.
 *
 * The message is attached with `{ error }` rather than `.min(1, message)` on
 * purpose: an *unset* variable fails the base type check, where a `.min()`
 * message is never rendered — the operator would only see Zod's raw
 * "Invalid input: expected string, received undefined".
 */
const required = (message: string) => z.string({ error: message }).min(1, message);

/**
 * Optional value: absent *or blank* means "not configured".
 *
 * `cp .env.example .env` is the documented setup path, so every template line
 * exists in `.env` — including the ones a given environment does not use, which
 * end up as empty strings (`SENDER_EMAIL=`, `SENTRY_DSN=`, …). Without this
 * normalisation those blanks are validated as malformed emails/URLs.
 */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'], {
      error: 'NODE_ENV must be one of: development, test, production',
    })
    .default('development'),

  // ── Supabase ────────────────────────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: httpUrl('NEXT_PUBLIC_SUPABASE_URL must be a valid http(s) URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: required('NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  // Request-time secret, not build-critical: `createSupabaseAdminClient` throws
  // and the admin layout redirects when it is missing, so dev/test builds and
  // builds without secrets are legitimate (see docs/setup.md).
  SUPABASE_SERVICE_ROLE_KEY: optional(z.string()),

  // ── App ─────────────────────────────────────────────────────────────────────
  // Required: Stripe redirect URLs are built from this value, never from the
  // client-controlled Origin header (IDOR / open-redirect prevention).
  NEXT_PUBLIC_APP_URL: httpUrl('NEXT_PUBLIC_APP_URL must be a valid http(s) URL'),
  // Optional: the dashboard sidebar falls back to http://localhost:3002.
  NEXT_PUBLIC_ADMIN_URL: optional(httpUrl('NEXT_PUBLIC_ADMIN_URL must be a valid http(s) URL')),

  // ── Stripe ──────────────────────────────────────────────────────────────────
  // Request-time secrets: the checkout/webhook routes fail closed (5xx) when
  // they are unset, and unsigned fixtures are only tolerated outside production.
  STRIPE_SECRET_KEY: optional(z.string()),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optional(z.string()),
  NEXT_PUBLIC_STRIPE_PRICE_ID: optional(z.string()),
  STRIPE_WEBHOOK_SECRET: optional(z.string()),

  // ── Email (Brevo) ───────────────────────────────────────────────────────────
  BREVO_API_KEY: optional(z.string()),
  SENDER_EMAIL: optional(z.email({ error: 'SENDER_EMAIL must be a valid email address' })),
  SENDER_NAME: optional(z.string()),

  // ── Rate limiting (Upstash Redis) ───────────────────────────────────────────
  // Both must be set for limiting to engage; @template/kv no-ops (allow-all)
  // when either one is missing.
  UPSTASH_REDIS_REST_URL: optional(httpUrl('UPSTASH_REDIS_REST_URL must be a valid http(s) URL')),
  UPSTASH_REDIS_REST_TOKEN: optional(z.string()),

  // ── Analytics / Observability ───────────────────────────────────────────────
  NEXT_PUBLIC_POSTHOG_KEY: optional(z.string()),
  NEXT_PUBLIC_POSTHOG_HOST: optional(
    httpUrl('NEXT_PUBLIC_POSTHOG_HOST must be a valid http(s) URL')
  ),
  SENTRY_DSN: optional(z.string()),
});

export type Env = z.infer<typeof envSchema>;

// Variables that are inlined into the client bundle. A build without these
// produces a broken app, so they are called out separately in the report.
const BUILD_CRITICAL_VARS: (keyof Env)[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
];

// Secrets that are intentionally absent from a build and enforced fail-closed at
// request time instead. Reported separately so that a missing value reads as
// "expected at build time" instead of as a broken environment.
const RUNTIME_SECRET_VARS: (keyof Env)[] = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'BREVO_API_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
];

const unsetRuntimeSecrets = (env: Record<string, string | undefined>) =>
  RUNTIME_SECRET_VARS.filter((key) => !env[key]);

/**
 * Validates environment variables and reports every issue to the console.
 *
 * Non-throwing by default: `next.config.mjs` is evaluated both during
 * `next build` (where runtime secrets like Stripe/Brevo are legitimately
 * absent) and when a production server boots, and Next.js provides no
 * reliable way to distinguish the two phases. The schema therefore hard-
 * requires only what a *build* needs — the NEXT_PUBLIC_* values that get
 * inlined into the client bundle. Instead:
 *
 * - Missing/invalid **build-critical** vars (NEXT_PUBLIC_*) are highlighted
 *   with `[BUILD-CRITICAL]` because they break the client bundle.
 * - **Server secrets** are optional here because the routes that need them
 *   fail closed at request time (Stripe checkout/webhook return 5xx, the
 *   admin layout redirects, client factories throw, rate limiting no-ops);
 *   any that are still unset are named in the report when it is printed.
 * - Callers that need strict enforcement (scripts, edge functions, tests)
 *   can pass `{ enforce: true }` to throw on any issue.
 */
export const validateEnv = (
  env: Record<string, string | undefined> = process.env,
  options: { enforce?: boolean } = {}
): Env | null => {
  const result = envSchema.safeParse(env);
  const report = options.enforce ? console.error : console.warn;

  if (result.success) {
    return result.data;
  }

  const nodeEnv = env.NODE_ENV ?? 'development';
  const isLocalDev = nodeEnv === 'development' || nodeEnv === 'test';
  const missingBuildCritical = BUILD_CRITICAL_VARS.filter((key) => !env[key]?.trim());
  const onlyMissingCritical =
    missingBuildCritical.length > 0 &&
    result.error.issues.every((issue) => {
      const key = issue.path[0];
      return typeof key === 'string' && BUILD_CRITICAL_VARS.includes(key as keyof Env);
    });

  if (
    isLocalDev &&
    onlyMissingCritical &&
    missingBuildCritical.length === BUILD_CRITICAL_VARS.length
  ) {
    report(
      '⚠️  Local env not configured: copy `.env.example` to `.env.local` at the repo root or `apps/web/.env.local`, then restart dev.'
    );
    report(
      '   Required for the web app: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL.'
    );
    return null;
  }

  const unsetSecrets = unsetRuntimeSecrets(env);
  // Reached only when the environment is already being reported as incomplete:
  // in production the closing line then names the server secrets that are still
  // missing, because those fail closed at request time rather than here.
  const closingReport =
    env.NODE_ENV === 'production' && unsetSecrets.length > 0
      ? '   Production without server secrets: ' +
        `${unsetSecrets.join(', ')}. Those routes fail closed at request ` +
        'time rather than at boot — Stripe returns 5xx, the admin layout ' +
        'redirects and rate limiting no-ops until the values are set.'
      : '   Server secrets are enforced fail-closed at request time. Set every ' +
        'NEXT_PUBLIC_* variable above before deploying.';

  report(
    options.enforce
      ? '❌ Invalid environment variables — refusing to continue:'
      : '⚠️  Environment variables incomplete (build continues; runtime fails closed):'
  );
  result.error.issues.forEach((err) => {
    const key = err.path.join('.') as keyof Env;
    const marker = BUILD_CRITICAL_VARS.includes(key)
      ? ' [BUILD-CRITICAL]'
      : RUNTIME_SECRET_VARS.includes(key)
        ? ' [request-time]'
        : '';
    report(`  - ${key}: ${err.message}${marker}`);
  });

  if (options.enforce) {
    throw new Error(
      'Invalid environment variables. Fix the issues reported above before continuing.'
    );
  }

  report(closingReport);
  return null;
};

/**
 * Strict variant for runtime contexts where a missing variable is always
 * fatal (deployment scripts, edge functions, integration tests).
 */
export const assertValidEnv = (env: Record<string, string | undefined> = process.env): Env => {
  const result = validateEnv(env, { enforce: true });
  // Unreachable at runtime — `enforce: true` throws above. Kept so the
  // nullable return type of `validateEnv` is narrowed for the compiler.
  if (result === null) {
    throw new Error('Environment validation failed');
  }
  return result;
};
