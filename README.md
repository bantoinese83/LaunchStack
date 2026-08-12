# 🚀 LaunchStack — Enterprise Full-Stack Monorepo Template

**LaunchStack** is a production-grade, highly scalable, full-stack B2B SaaS and cross-platform mobile app template. It is designed to save you hundreds of hours of configuration by providing a unified, fully typed monorepo powered by Turborepo, Next.js, Expo, and Supabase.

---

## 🌟 Key Features

### 🏛 Architecture

- **Turborepo**: Blazing fast, cache-enabled monorepo builds.
- **Next.js 14 (App Router)**: Powers both the Customer Web App (`apps/web`) and the Internal Admin Portal (`apps/admin`).
- **Expo & React Native**: Cross-platform iOS and Android mobile app (`apps/mobile`) sharing domain logic and UI primitives.
- **Supabase**: PostgreSQL database with Row-Level Security (RLS) and real-time triggers.

### 🛡️ Enterprise Production Readiness (New!)

- **CI/CD Automation**: GitHub Actions pipelines for tests, linting, formatting, and DB migration validation.
- **Containerization**: Multi-stage `Dockerfile`s optimized with Next.js `standalone` output for ECS/K8s/Cloud Run deployments.
- **Automated Testing**:
  - **Unit Testing**: Vitest setup for rapid module logic verification (e.g. Auth roles).
  - **E2E Testing**: Playwright configured for full web flow verification.
- **Observability**: Fully integrated `@sentry/nextjs` for edge, server, and client crash reporting.
- **Pre-commit Hooks**: Husky & lint-staged ensure no poorly formatted code reaches Git.
- **Security Headers**: Hardened `next.config.mjs` with strict CSP, HSTS, and XSS Protection.

### 💼 Integrated Services

- **Authentication**: Supabase Auth with custom role claims.
- **Payments**: Stripe Checkout integrations.
- **Email**: Brevo transactional emails (Welcome, Invites).
- **Analytics**: PostHog product tracking and taxonomy.
- **UI/UX**: Beautiful, accessible, glassmorphic Tailwind CSS primitives with Radix UI.

---

## 📂 Project Structure

```text
enterprise-app-template/
├── .github/workflows/           # GitHub Actions (main.yml, supabase.yml)
├── .vscode/                     # Recommended IDE configurations
├── apps/
│   ├── admin/                   # Next.js 14 Internal Admin Dashboard (Port 3002)
│   ├── mobile/                  # Expo React Native App
│   └── web/                     # Next.js 14 Customer SaaS App (Port 3000)
├── docs/                        # Deep-dive architectural documentation
├── packages/
│   ├── analytics/               # PostHog integration
│   ├── api/                     # Supabase DB clients
│   ├── auth/                    # Permission matrices (isSuperAdmin, isWorkspaceOwner)
│   ├── config/                  # Shared ESLint, TS, and Env Zod Validators
│   ├── email/                   # Brevo Email API definitions
│   ├── feature-flags/           # SaaS Plan Entitlements
│   ├── mobile-ui/               # React Native UI components
│   ├── types/                   # Shared TypeScript domain interfaces
│   ├── ui/                      # Web Tailwind / Radix UI components
│   └── validation/              # Shared Zod schemas (API & Forms)
└── supabase/
    ├── migrations/              # SQL DDL schemas and RLS policies
    └── seed.sql                 # Demo local data
```

---

## 🛠️ Quick Start

### 1. Prerequisites

- Node.js `v18+`
- pnpm `v9+`
- Docker Desktop (for local Supabase)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo>
cd enterprise-app-template
pnpm install
```

### 3. Start Local Supabase

This will spin up a local PostgreSQL database, apply migrations, and insert the `seed.sql` data.

```bash
pnpm db:start
```

### 4. Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Ensure you have your Stripe and Brevo keys populated if you intend to test checkout and email flows.

### 5. Start the Development Servers

Launch all applications simultaneously using Turborepo:

```bash
pnpm dev
```

- **Web App**: `http://localhost:3000`
- **Admin App**: `http://localhost:3002`
- **Supabase Studio**: `http://localhost:54323`

---

## 🧪 Testing and Code Quality

- **Format**: `pnpm format` (Prettier)
- **Lint**: `pnpm lint` (ESLint)
- **Typecheck**: `pnpm typecheck` (TypeScript)
- **Unit Tests**: `pnpm test` (Vitest)
- **E2E Tests**:
  ```bash
  cd apps/web
  pnpm dlx playwright test
  ```

---

## 📚 Documentation

For detailed guides on deploying, security, and architecture, refer to the `/docs` directory:

- [Setup Guide](./docs/setup.md)
- [Architecture & Monorepo Overview](./docs/architecture.md)
- [Deployment & Docker Guide](./docs/deployment.md)
- [Security Posture & RLS](./docs/security.md)
- [Analytics Strategy](./docs/analytics.md)
