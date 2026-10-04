# Security, RLS & Secrets Model (`LaunchStack`)

## Row Level Security (RLS) Model

Row Level Security is enabled on all core database tables (`profiles`, `workspaces`, `workspace_members`, `subscriptions`, `feedback_posts`, `feedback_votes`, `audit_logs`, `workspace_invites`, `consent_records`, `data_export_requests`).

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

`apps/web/src/proxy.ts` refreshes the Supabase cookie session with `getClaims()` (never trust `getSession()` on the server) and applies `@template/kv` rate limiters to `/api/*`. The client IP is derived from `x-forwarded-for` (first hop — set by Vercel, nginx, Cloudflare, etc.) with an `x-real-ip` fallback; Next.js 16 removed the built-in `request.ip` property. Auth, Stripe, and privacy paths use the stricter `authRateLimiter`; other API routes use `apiRateLimiter`. Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in deployed environments (without them, limiters no-op allow-all for local DX). Protected pages (`/dashboard`, `/feedback`, `/onboarding`, `/settings`) redirect to `/login` when claims are missing.

> **Proxy-header trust note**: `x-forwarded-for` is client-spoofable when your
> platform does not strip/overwrite it. Hosting platforms like Vercel and
> Cloudflare set the leftmost value themselves, which is what this code reads.
> If you self-host behind a proxy you control, ensure it overwrites (not
> appends to) the header, or rate-limit by another stable identifier.

## Application Security Headers

Both `apps/web` and `apps/admin` utilize strict security headers enforced via `next.config.mjs`:

- **Content-Security-Policy** (or Permissions-Policy): Restricts camera, microphone, and geolocation.
- **X-Frame-Options (`DENY`)**: Prevents clickjacking by disabling iframe rendering of the apps.
- **X-Content-Type-Options (`nosniff`)**: Prevents MIME-sniffing.
- **Strict-Transport-Security (HSTS)**: Forces all connections over HTTPS.
- **Referrer-Policy**: Ensures strict origin tracking when navigating cross-origin.
