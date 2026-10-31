# Mystic Hair Co.

Mobile house-call hairstyling for Chicago — web booking, client app, and Luke’s **Studio** ops dashboard.

Built as a pnpm monorepo (Next.js web + Expo mobile + super-admin + shared packages).

## Stack

- **Supabase** — auth, Postgres, storage
- **Stripe** — checkout (bookings, memberships, packages, shop)
- **Brevo** — transactional email
- **Twilio** — SMS (optional)
- **Upstash** — rate limiting
- **PostHog** / **Sentry** — analytics & errors

## Quick start

```bash
pnpm install
node scripts/write-local-env.mjs   # Supabase keys → apps/web/.env.local & apps/mobile/.env
pnpm db:push                       # linked remote project
pnpm dev:web                       # http://localhost:3000 (booking + Luke Studio)
pnpm dev:mobile                    # Expo client app
pnpm dev:admin                     # http://localhost:3002 (MLabs super-admin)
```

See [docs/client/LAUNCH.md](docs/client/LAUNCH.md) for production env, Stripe products, and store setup.

## Production

- **GitHub:** `bantoinese83/mystic-hair-co`
- **Web:** [mystic-hair-co.vercel.app](https://mystic-hair-co.vercel.app) (`apps/web`, includes `/studio` ops)
- **Admin:** `apps/admin` — platform super-admin (deploy separately; port 3002 locally)
- **Mobile:** `apps/mobile` — `pnpm build:mobile` runs `expo export` (iOS bundle to `dist/`)

## Scripts

| Command                               | Purpose                                     |
| ------------------------------------- | ------------------------------------------- |
| `pnpm db:types:remote`                | Regenerate `packages/types/src/supabase.ts` |
| `pnpm db:seed:remote`                 | Run `supabase/seed.sql` on linked project   |
| `pnpm --filter @template/mystic test` | Domain pricing/catalog tests                |
