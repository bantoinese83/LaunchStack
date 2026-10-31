# Phase 2 — apply checklist (you run this)

## 1. Database

```bash
pnpm db:reset   # or supabase db push
```

Migration file: `supabase/migrations/20261031120000_mystic_hair_operations.sql`

Then regenerate types:

```bash
pnpm db:types
```

## 2. Environment

Copy from `.env.example`:

- `NEXT_PUBLIC_MYSTIC_WORKSPACE_ID` — optional; seed uses `33333333-3333-3333-3333-333333333333`
- `STRIPE_PRICE_MYSTIC_*` — Glow, Luxe, and package price IDs (see `.env.example`)
- Twilio + Brevo (already in template)
- Stripe (deposits / no-show capture — wire in Phase 2.5)

Seed `mystic_studio_settings` for the workspace (defaults exist in migration-less upsert via API).

## 3. Edge function (optional)

Deploy `supabase/functions/mystic-door-timer-expire` on a cron to auto–no-show after door timer.

## 4. Luke studio

- `/studio` — on the way + door timer
- `/studio/blasts` — email/SMS campaigns
- `/studio/messages` — client threads
- `/studio/analytics` — MTD stats
- `/studio/settings` — winter buffer, deposit, timer

## 5. Client

- `/visits` — appointment status + ETA
- `/messages` — chat with Luke
- Mobile: Book, Visits, Plans, Messages, Account

## API map

| Method    | Path                                  |
| --------- | ------------------------------------- |
| GET/POST  | `/api/mystic/appointments`            |
| GET       | `/api/mystic/appointments/mine`       |
| POST      | `/api/mystic/appointments/en-route`   |
| POST      | `/api/mystic/appointments/door-timer` |
| GET/POST  | `/api/mystic/messages`                |
| GET/POST  | `/api/mystic/blasts`                  |
| GET/POST  | `/api/mystic/referrals`               |
| GET/PATCH | `/api/mystic/studio/settings`         |
| GET       | `/api/mystic/analytics/summary`       |
