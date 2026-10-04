import Link from 'next/link';
import { BrandMark, Card } from '@template/ui';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper atlas-grain text-ink">
      <div className="mx-auto max-w-3xl px-6 py-14 animate-[rise_400ms_ease-out]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <BrandMark size="sm" />
          <span>Back to LaunchStack</span>
        </Link>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-ink">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated October 4, 2026</p>
        <Card className="mt-8 space-y-5 text-sm leading-relaxed text-muted">
          <p>
            LaunchStack collects the minimum personal data needed to operate your account,
            workspace, billing, and support. We do not sell personal data.
          </p>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              1. Data we collect
            </h2>
            <p className="mt-2">
              Account email and name, workspace membership, feedback you submit, invite records,
              optional analytics events after consent, billing identifiers from Stripe, and
              authentication factors you enroll (TOTP, passkeys, recovery-code hashes).
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              2. Cookies
            </h2>
            <p className="mt-2">
              Necessary cookies keep you signed in. Analytics and marketing cookies are opt-in via
              the consent banner. See the{' '}
              <Link href="/cookies" className="font-semibold text-accent">
                cookie policy
              </Link>
              .
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              3. Processors
            </h2>
            <p className="mt-2">
              Supabase (auth and database), Stripe (payments), Brevo (transactional email), PostHog
              (analytics only after consent), Sentry (error telemetry), and Expo (push delivery).
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              4. Your rights
            </h2>
            <p className="mt-2">
              Signed-in users can export or delete their account from Settings → Privacy. Deletion
              cancels Stripe subscriptions, removes owned workspaces, and anonymizes remaining
              profile data.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              5. Security
            </h2>
            <p className="mt-2">
              Tenant data is isolated with PostgreSQL Row Level Security. Super-admin tools live on
              a separate admin app and require a verified system role.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
