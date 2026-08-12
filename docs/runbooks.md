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

1. Inspect failed events in Stripe Dashboard -> Developers -> Webhooks.
2. Verify `STRIPE_WEBHOOK_SECRET` matches environment variables.
3. Resend failed events manually from Stripe Dashboard.
