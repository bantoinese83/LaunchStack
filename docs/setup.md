# Quickstart & Local Development Setup Guide (`LaunchStack`)

This guide walks you through setting up and running the full-stack monorepo (`LaunchStack`) on your local machine.

---

## Prerequisites

- **Node.js**: `v22.13.0` or higher (required by Expo SDK 57; root `engines` enforce this)
- **pnpm**: `v9.0.0` or higher (`npm i -g pnpm`)
- **Docker Desktop**: Required for local Supabase emulator
- **Supabase CLI**: `brew install supabase/tap/supabase` (optional but recommended)
- **Expo Go App**: Required if running mobile app on physical iOS/Android device
- After changing mobile dependencies or `app.json`, run `pnpm check:expo` (`expo-doctor`)

---

## 1. Clone & Install Dependencies

```bash
git clone https://github.com/bantoinese83/LaunchStack.git
cd LaunchStack
pnpm install
```

---

## 2. Environment Configuration

Copy the template `.env.example` file:

```bash
cp .env.example .env
```

Verify the following variables in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
BREVO_API_KEY=xkeysib-...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXX...
```

> **Stripe note**: Local webhook fixtures may omit `STRIPE_WEBHOOK_SECRET` (unsigned JSON is allowed outside production). Production **must** set a real secret or the webhook route returns `500`.

### How environment validation works

`@template/config` validates the environment whenever a Next.js app boots. It is
**non-throwing by design**: `next build` legitimately runs without runtime
secrets (Stripe, Brevo, service-role key), so failing the build for those would
make local and CI builds impossible. Instead:

- Missing **`NEXT_PUBLIC_*`** variables are flagged `[BUILD-CRITICAL]` in the
  build log — they get inlined into the client bundle and are required for a
  correct deploy.
- Missing **server secrets** are enforced _fail-closed at request time_: the
  Stripe checkout/webhook routes return `5xx`, the admin layout redirects, and
  the Supabase client factories throw.
- Use `assertValidEnv(process.env)` from `@template/config` in scripts, edge
  functions, or tests where a missing variable must be fatal.

---

## 3. Local Supabase Setup

Initialize and start the Supabase PostgreSQL local container:

```bash
pnpm db:start
# or: supabase start
```

Run migrations and insert seed data:

```bash
pnpm db:reset
# or: supabase db reset
```

---

## 4. Run Development Applications

Start all applications simultaneously using Turborepo:

```bash
pnpm dev
```

Application URL map:

- **Customer Web Application**: [http://localhost:3000](http://localhost:3000)
- **Expo Mobile Bundler**: [http://localhost:8081](http://localhost:8081)
- **Internal Admin Portal**: [http://localhost:3002](http://localhost:3002)
- **Supabase Local Studio**: [http://localhost:54323](http://localhost:54323)

---

## Seed Accounts for Testing

- **Super Admin**: `admin@launchstack.com` / `LaunchStack!demo`
- **Demo Customer**: `demo@launchstack.com` / `LaunchStack!demo`

Signed-in Playwright (after `pnpm db:reset` and with the web app pointed at local Supabase):

```bash
E2E_SIGNED_IN=1 pnpm --filter @template/web test:e2e
```
