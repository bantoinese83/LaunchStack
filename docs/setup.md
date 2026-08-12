# Quickstart & Local Development Setup Guide (`LaunchStack`)

This guide walks you through setting up and running the full-stack monorepo (`LaunchStack`) on your local machine.

---

## Prerequisites

- **Node.js**: `v18.0.0` or higher
- **pnpm**: `v9.0.0` or higher (`npm i -g pnpm`)
- **Docker Desktop**: Required for local Supabase emulator
- **Supabase CLI**: `brew install supabase/tap/supabase` (optional but recommended)
- **Expo Go App**: Required if running mobile app on physical iOS/Android device

---

## 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-org/launchstack-monorepo.git
cd launchstack-monorepo
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
BREVO_API_KEY=xkeysib-...
```

---

## 3. Local Supabase Setup

Initialize and start the Supabase PostgreSQL local container:

```bash
supabase start
```

Run migrations and insert seed data:

```bash
supabase db reset
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

- **Super Admin**: `admin@launchstack.com`
- **Demo Customer**: `demo@launchstack.com`
