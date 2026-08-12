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
        <p className="mt-2 text-sm text-muted">Last updated August 12, 2026</p>
        <Card className="mt-8 space-y-5 text-sm leading-relaxed text-muted">
          <p>
            Your privacy is important to us. LaunchStack collects minimal personal data required to
            operate your account and services.
          </p>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              1. Data Collection
            </h2>
            <p className="mt-2">
              We collect email addresses, user names, and workspace usage telemetry necessary for
              authentication, billing, and system operations.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              2. Data Isolation & Security
            </h2>
            <p className="mt-2">
              Customer data is strictly isolated using Supabase PostgreSQL Row Level Security (RLS)
              policies. We do not sell user data to third parties.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
