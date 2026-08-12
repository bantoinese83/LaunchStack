# Operations & Incident Runbooks (`LaunchStack`)

## Runbook 1: Database Backup & Point-in-Time Recovery

- Supabase automatically performs daily physical backups.
- For manual logical backup: `supabase db dump -f backup.sql`

## Runbook 2: Revoking Super Admin Access

1. Execute in Supabase SQL Editor:

```sql
UPDATE public.profiles SET system_role = 'user' WHERE email = 'target-user@example.com';
```

## Runbook 3: Handling Stripe Webhook Failures

1. Inspect failed events in Stripe Dashboard → Developers → Webhooks.
2. Verify `STRIPE_WEBHOOK_SECRET` matches the signing secret for the endpoint (not the API key).
3. Confirm production has a **real** secret — if the env var is missing or still `whsec_mock`, the route returns `500` with `Webhook not configured` and Stripe will keep retrying.
4. Confirm requests include a valid `stripe-signature` header (unsigned bodies are rejected in production).
5. Resend failed events manually from the Stripe Dashboard after fixing configuration.
6. For local fixture testing only: omit the secret (or use `whsec_mock`) so unsigned JSON payloads are accepted outside production.
