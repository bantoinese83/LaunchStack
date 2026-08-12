# Security, RLS & Secrets Model (`LaunchStack`)

## Row Level Security (RLS) Model

Row Level Security is enabled on all core database tables (`profiles`, `workspaces`, `workspace_members`, `subscriptions`, `feedback_posts`, `feedback_votes`, `audit_logs`).

### Primary Security Invariants

- `is_workspace_member(workspace_id)` function checks if `auth.uid()` belongs to the specified workspace.
- `is_super_admin()` checks if `auth.uid()` has `system_role = 'super_admin'`.
- Clients using the Supabase `anon` key are constrained by RLS policies.
- The Supabase `service_role` key is strictly reserved for Edge Functions and `apps/admin`.

## Secret Safeguards

- Never commit `.env` or production service role keys to source control.
- Validate environment variables at build time using `@template/config`.

## Application Security Headers

Both `apps/web` and `apps/admin` utilize strict security headers enforced via `next.config.mjs`:

- **Content-Security-Policy** (or Permissions-Policy): Restricts camera, microphone, and geolocation.
- **X-Frame-Options (`DENY`)**: Prevents clickjacking by disabling iframe rendering of the apps.
- **X-Content-Type-Options (`nosniff`)**: Prevents MIME-sniffing.
- **Strict-Transport-Security (HSTS)**: Forces all connections over HTTPS.
- **Referrer-Policy**: Ensures strict origin tracking when navigating cross-origin.
