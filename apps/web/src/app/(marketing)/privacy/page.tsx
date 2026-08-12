import Link from 'next/link';
import { Card } from '@template/ui';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 text-ink">
      <Link href="/" className="text-sm text-accent hover:underline">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-semibold mt-6 mb-4 text-ink">Privacy Policy</h1>
      <Card className="space-y-4 text-sm leading-relaxed text-muted">
        <p>
          Your privacy is important to us. LaunchStack collects minimal personal data required to
          operate your account and services.
        </p>
        <h2 className="text-lg font-semibold text-ink">1. Data Collection</h2>
        <p>
          We collect email addresses, user names, and workspace usage telemetry necessary for
          authentication, billing, and system operations.
        </p>
        <h2 className="text-lg font-semibold text-ink">2. Data Isolation & Security</h2>
        <p>
          Customer data is strictly isolated using Supabase PostgreSQL Row Level Security (RLS)
          policies. We do not sell user data to third parties.
        </p>
      </Card>
    </div>
  );
}
