# Security, RLS & Secrets Model (`LaunchStack`)

## Row Level Security (RLS) Model

Row Level Security is enabled on all core database tables (`profiles`, `workspaces`, `workspace_members`, `subscriptions`, `feedback_posts`, `feedback_votes`, `audit_logs`).

### Primary Security Invariants

- `is_workspace_member(workspace_id)` function checks if `auth.uid()` belongs to the specified workspace.
- `is_super_admin()` checks if `auth.uid()` has `system_role = 'super_admin'`.
- Clients using the Supabase `anon` key are constrained by RLS policies.
- The Supabase `service_role` key is strictly reserved for Edge Functions and `apps/admin`.

## Secret Safeguards

- Never commit `.env` or production service role keys to source control.
- Validate environment variables at build time using `@template/config`.
- Production Stripe routes require real secrets:
  - `STRIPE_SECRET_KEY` — checkout fails closed if missing in production.
  - `STRIPE_WEBHOOK_SECRET` — webhooks always verify signatures in production; a missing or mock secret returns `500` instead of accepting unsigned payloads.

## Stripe Webhook Verification

The webhook handler in `apps/web/src/app/api/stripe/webhook/route.ts` is fail-closed:

| Environment  | `STRIPE_WEBHOOK_SECRET` | Behavior                                        |
| ------------ | ----------------------- | ----------------------------------------------- |
| `production` | Missing / `whsec_mock`  | Reject with `500` (not configured)              |
| `production` | Real secret             | Require `stripe-signature` and `constructEvent` |
| Local / test | Missing or `whsec_mock` | Allow unsigned JSON for fixture testing         |
| Local / test | Real secret             | Verify signatures the same as production        |

Never deploy production (or preview treated as production) without a real webhook secret from the Stripe Dashboard.

## Email HTML Escaping

`@template/email` escapes user-controlled values (`escapeHtml`) before interpolating names, workspace titles, invite URLs, and feedback titles into HTML bodies. Prefer that helper whenever adding new transactional templates.

## Edge Rate Limiting

`apps/web/src/proxy.ts` applies `@template/kv` rate limiters to `/api/*`. Auth and Stripe paths use the stricter `authRateLimiter`; other API routes use `apiRateLimiter`. Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in deployed environments (without them, limiters no-op allow-all for local DX).

## Application Security Headers

Both `apps/web` and `apps/admin` utilize strict security headers enforced via `next.config.mjs`:

- **Content-Security-Policy** (or Permissions-Policy): Restricts camera, microphone, and geolocation.
- **X-Frame-Options (`DENY`)**: Prevents clickjacking by disabling iframe rendering of the apps.
- **X-Content-Type-Options (`nosniff`)**: Prevents MIME-sniffing.
- **Strict-Transport-Security (HSTS)**: Forces all connections over HTTPS.
- **Referrer-Policy**: Ensures strict origin tracking when navigating cross-origin.
