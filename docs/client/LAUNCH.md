# Mystic Hair Co. — launch checklist (env only)

After code is built, you only need **environment variables**, **Stripe products**, and **store accounts**. Supabase is already linked (`ipwubzqckiubrvrouzye`).

## 1. Copy env

```bash
cp .env.example apps/web/.env.local
# Optional Pixabay assets (set PIXABAY_API_KEY in .env.local):
# pnpm fetch:marketing-images && pnpm fetch:auth-video
cp .env.example apps/mobile/.env
```

Fill every value marked **required** below.

**Helpers**

```bash
node scripts/write-local-env.mjs          # Supabase anon + service role
node scripts/stripe-create-mystic-prices.mjs # after STRIPE_SECRET_KEY is set
node scripts/push-env-to-vercel.mjs       # sync apps/web/.env.local → Vercel
```

## 2. Required variables

| Variable                          | Where                                                                    |
| --------------------------------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`        | `https://ipwubzqckiubrvrouzye.supabase.co`                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase → Settings → API                                                |
| `SUPABASE_SERVICE_ROLE_KEY`       | Same (server only — never commit)                                        |
| `EXPO_PUBLIC_SUPABASE_*`          | Same anon URL/key for mobile                                             |
| `NEXT_PUBLIC_APP_URL`             | Production URL (e.g. Vercel) or `http://localhost:3000`                  |
| `EXPO_PUBLIC_APP_URL`             | Must match web URL mobile calls for API                                  |
| Google sign-in                    | [GOOGLE-OAUTH.md](./GOOGLE-OAUTH.md) — Google Cloud + Supabase Providers |
| Supabase redirect URLs            | `{APP_URL}/auth/callback`, `mystichair://auth/callback`                  |
| `NEXT_PUBLIC_MYSTIC_WORKSPACE_ID` | `33333333-3333-3333-3333-333333333333` (seed)                            |

## 3. Stripe

1. Create products/prices for Glow, Luxe, packages (see `.env.example` `STRIPE_PRICE_MYSTIC_*`).
2. Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
3. Webhook endpoint: `https://YOUR_DOMAIN/api/stripe/webhook`  
   Events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, subscription events.

## 4. Brevo + Twilio (optional until live)

- `BREVO_API_KEY`, `SENDER_EMAIL`, `SENDER_NAME=Mystic Hair Co.`
- `TWILIO_*` for SMS (on-the-way, door timer, booking texts)

Without these, booking still works; email/SMS are skipped safely.

## 5. Luke studio access

Add your Supabase auth user to `workspace_members` for workspace `33333333-…` with role `workspace_owner`, or sign in as seed user `00000000-0000-0000-0000-000000000002` in dev.

## 6. Database

If you pull fresh:

```bash
pnpm db:push
pnpm db:seed:remote   # optional re-seed
pnpm db:types:remote
```

## 7. Mobile stores (EAS + Fastlane)

Expo **does not require Fastlane** for day-to-day dev; **EAS Build** is the primary path.

```bash
cd apps/mobile
eas login
eas init          # writes real projectId into app.json
eas build --platform ios --profile production
eas submit --platform ios --latest
```

Optional Fastlane wrapper (same commands):

```bash
cd apps/mobile/fastlane
fastlane ios beta
```

Set `APPLE_ID`, `APPLE_TEAM_ID`, `EXPO_TOKEN` in CI.

## 8. Vercel

Link repo, set all `NEXT_PUBLIC_*` and server env vars, deploy `apps/web`.

## 9. Verify

````bash
pnpm verify:integrations   # Supabase, Upstash, Brevo, Twilio, Stripe, PostHog
pnpm typecheck && pnpm test && pnpm build   # web + mobile + admin + packages

Per app:

```bash
pnpm build:web      # Next.js → apps/web/.next
pnpm build:mobile   # expo export ios + android → apps/mobile/dist
pnpm build:admin    # Next.js super-admin → apps/admin/.next (port 3002)
````

```

Manual smoke:

- `/` marketing → `/book` → checkout (Stripe test card)
- `/studio` ops (Complete / No-show)
- Mobile: Book tab → checkout in browser
- `/shop` pre-order (optional)
```
