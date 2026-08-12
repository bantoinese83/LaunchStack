# Architecture Decisions & Monorepo Boundaries (`LaunchStack`)

## Monorepo Package Topology

```
pnpm Workspaces
 ├── apps/web (Next.js 16 App Router) -> Marketing + Customer Web App
 ├── apps/mobile (Expo 57 Router) -> iOS & Android Native App
 ├── apps/admin (Next.js 16 App Router) -> Internal Platform Admin Portal
 └── packages/
      ├── ui (Tailwind / Radix Web Primitives)
      ├── mobile-ui (React Native Primitives)
      ├── config (ESLint, TS, Tailwind shared configs)
      ├── types (Domain interfaces + shared enum constants)
      ├── validation (Zod schemas; consumes enums from @template/types)
      ├── api (Supabase Client Factory & Domain Queries)
      ├── auth (Permission Matrix & Role Assertions)
      ├── kv (Upstash Redis cache + rate limiters)
      ├── email (Brevo Email Integration & Templates)
      ├── analytics (PostHog Event Taxonomy & Dispatcher)
      └── feature-flags (Plan Entitlements & Flag Checks)
```

## Architectural Guidelines

1. **Zero Client Trust**: All user entitlements, roles, and pricing checks are enforced on the server or via PostgreSQL Row Level Security (RLS) policies.
2. **Platform Separation**: Web-specific DOM UI elements reside exclusively in `@template/ui`. React Native UI elements reside in `@template/mobile-ui`. Pure logic, validation, API helpers, and auth functions are shared across web, mobile, and admin.
3. **Multi-Tenant Isolation**: Every tenant record references a `workspace_id`. Cross-workspace data queries are rejected by PostgreSQL RLS.
4. **Single Source of Truth for Domain Enums**: Role, feedback category/status, and subscription status values are defined once as `as const` arrays in `@template/types`. `@template/validation` Zod schemas import those arrays (`z.enum(...)`) so TypeScript unions and runtime validation cannot drift.
5. **Capability Helpers Compose Role Checks**: Billing/member/moderation helpers in `@template/auth` call shared predicates (`isWorkspaceOwner`, `isWorkspaceAdmin`, `isSuperAdmin`) instead of re-implementing role comparisons.

## Testing & Quality Strategy

1. **Unit Testing (`vitest`)**: Used for purely logical, headless packages like `@template/auth`, `@template/validation`, or `@template/api` to verify complex state transformations quickly.
2. **E2E Testing (`@playwright/test`)**: Runs end-to-end browser workflows in `apps/web` (and `apps/admin`) to verify critical user paths such as Login, Stripe Checkout, and Onboarding.
3. **Database Migration Testing (`supabase`)**: GitHub Actions pipelines enforce that any changes to `supabase/migrations` correctly apply to a clean PostgreSQL instance and generate valid TypeScript types.
4. **Crash Reporting (`@sentry/nextjs`)**: Automatically configured on all server, edge, and client Next.js functions for immediate observability.
