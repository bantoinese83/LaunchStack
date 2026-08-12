<div align="center">

# 🚀 LaunchStack

**The Ultimate Enterprise Full-Stack Monorepo Template**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-57-white?logo=expo)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-DB%20%26%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?logo=turborepo)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright)](https://playwright.dev/)
[![Upstash](https://img.shields.io/badge/Upstash-Redis%20%26%20RateLimit-00E599?logo=upstash)](https://upstash.com/)

_Stop rebuilding the same foundational boilerplate._ <br>
_Start writing business logic on day one._

</div>

---

## 🌟 Why LaunchStack?

**LaunchStack** is an obsessively configured, production-grade B2B SaaS and cross-platform mobile app template. It uses modern architectures to provide maximum code-sharing, type safety, and scalability without compromising on developer experience.

It's designed for **principled engineers** who want enterprise-level confidence (CI/CD, strict linting, Docker, Sentry, E2E testing) straight out of the box.

---

## 🏗️ Architecture at a Glance

### 📱 Apps (The Frontiers)

- **`apps/web`**: 🌐 The public-facing SaaS / Marketing platform (Next.js 16 App Router).
- **`apps/admin`**: 🛠️ Internal Back-Office portal for your team (Next.js 16 App Router).
- **`apps/mobile`**: 📱 iOS & Android cross-platform mobile app (Expo 57 & React Native).

### 📦 Packages (The Brains & Brawn)

Sharing code across 3 separate apps is hard. LaunchStack solves this with hyper-focused packages:

- **`@template/ui`**: 🎨 Web styling with Tailwind CSS & Radix primitives (glassmorphism ready!).
- **`@template/mobile-ui`**: 📱 Mobile-optimized UI components for Expo.
- **`@template/api`**: 🔌 Strongly-typed Supabase client factories and data fetchers.
- **`@template/auth`**: 🔐 Shared RBAC, permission matrices, and role assertions.
- **`@template/validation`**: ✅ Zod schemas for API payload and form validations (imports enum constants from `@template/types`).
- **`@template/feature-flags`**: 🚩 SaaS plan entitlements and tier limits.
- **`@template/kv`**: ⚡ Edge Redis caching and API rate-limiting (via Upstash).
- **`@template/email`**: ✉️ Transactional email templates (via Brevo) with HTML escaping for user-controlled fields.
- **`@template/analytics`**: 📊 Event tracking schemas (via PostHog).
- **`@template/config`**: ⚙️ Centralized ESLint, TS, and Env configurations.
- **`@template/types`**: 🔠 Domain-level TypeScript interfaces and shared `as const` enum arrays (single source of truth for roles/statuses).

---

## 🛡️ Enterprise-Ready Production Gaps (Solved!)

We went the extra mile so you don't have to:

1. **🤖 CI/CD Automation**: Pre-configured GitHub Actions (`main.yml`, `supabase.yml`) for linting, typechecking, E2E tests, and Database migration validations.
2. **🐳 Docker Containerization**: Multi-stage `Dockerfile`s optimized with Next.js `output: 'standalone'`, drastically reducing image bloat for K8s / AWS ECS / Google Cloud Run.
3. **🚦 Pre-Commit Hooks**: Husky + `lint-staged` run Prettier/ESLint on every commit to keep the Git history pristine.
4. **🧪 Comprehensive Testing**:
   - **Unit**: Blazing fast Vitest workspaces.
   - **E2E**: Playwright configured for deep web-flow verification.
5. **🐛 Error Observability**: Fully integrated `@sentry/nextjs` for tracking unhandled exceptions on the Edge, Server, and Client.
6. **🔒 Security Headers**: Hardened Next.js configs with strict Content-Security-Policy (CSP), HSTS, `X-Frame-Options`, and more to prevent XSS/Clickjacking.
7. **⚡ Edge Rate-Limiting & Caching**: `@template/kv` package powered by Upstash Redis and `@upstash/ratelimit` protecting Next.js API endpoints.
8. **🔎 Automated SEO**: Built-in `sitemap.ts` and `robots.ts` in the web app for instant Google indexing.
9. **💳 Fail-Closed Billing Webhooks**: Stripe signatures are always verified in production; missing `STRIPE_WEBHOOK_SECRET` returns 500 instead of accepting forged events.
10. **🔠 Shared Domain Enums**: Roles, feedback categories, and statuses live once in `@template/types` and are consumed by Zod in `@template/validation` — no string-literal drift.

---

## 🚀 Quick Start Guide

Ready to blast off? Let's get your local environment running.

### 1️⃣ Prerequisites

- **Node.js**: `v22+` (matches CI)
- **Package Manager**: pnpm `v9+` (`npm install -g pnpm`)
- **Docker**: For running Supabase locally.

### 2️⃣ Clone & Install

```bash
git clone https://github.com/bantoinese83/LaunchStack.git
cd LaunchStack
pnpm install
```

### 3️⃣ Fire up the Database (Supabase)

This command spins up a local PostgreSQL container, runs all migrations in `supabase/migrations`, and seeds the database with demo data.

```bash
pnpm db:start
```

> _Pro-tip: You can view your local database UI at [http://localhost:54323](http://localhost:54323)._

### 4️⃣ Setup Environment Variables

```bash
cp .env.example .env
```

_(Populate your `.env` with Stripe — including `STRIPE_WEBHOOK_SECRET` for production — Brevo, PostHog, or Upstash keys if you plan to test those integrations.)_

### 5️⃣ Ignite the Engines! 🏎️

Run the entire monorepo with Turborepo's hyper-parallelized task runner:

```bash
pnpm dev
```

- 🌐 **Web App**: [http://localhost:3000](http://localhost:3000)
- 🛠️ **Admin App**: [http://localhost:3002](http://localhost:3002)

---

## 🛠️ Developer Commands Cheat Sheet

Here are the most common commands you'll use daily:

| Command          | What it does                                          |
| ---------------- | ----------------------------------------------------- |
| `pnpm dev`       | Starts all dev servers in parallel.                   |
| `pnpm build`     | Builds all apps and packages for production.          |
| `pnpm lint`      | Runs ESLint across the entire monorepo.               |
| `pnpm format`    | Runs Prettier across the entire monorepo.             |
| `pnpm typecheck` | Checks TypeScript compilation without emitting files. |
| `pnpm test`      | Runs all Vitest unit tests.                           |
| `pnpm test:e2e`  | Runs Playwright E2E tests (run inside `apps/web`).    |
| `pnpm db:start`  | Starts local Supabase stack.                          |
| `pnpm db:stop`   | Stops local Supabase stack.                           |
| `pnpm db:reset`  | Wipes and resets the local database to a clean state. |

---

## 📚 Deep Dive Documentation

Don't guess how things work—read the docs! We have extensive write-ups located in the `/docs` folder:

- 📖 [Setup & Local Dev](./docs/setup.md)
- 🏗️ [Architecture & Monorepo Boundaries](./docs/architecture.md)
- 🚀 [Deployment (Docker, Vercel, EAS)](./docs/deployment.md)
- 🔒 [Security Posture & RLS Models](./docs/security.md)
- 📈 [Analytics & Telemetry](./docs/analytics.md)
- 🚑 [Runbooks & Troubleshooting](./docs/runbooks.md)

---

<div align="center">
Made with ❤️ by Principled Engineers. <br>
<i>Ready to build something amazing?</i>
</div>
