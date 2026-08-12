import Link from 'next/link';
import { Card } from '@template/ui';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 text-ink">
      <Link href="/" className="text-sm text-accent hover:underline">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-semibold mt-6 mb-4 text-ink">Terms of Service</h1>
      <Card className="space-y-4 text-sm leading-relaxed text-muted">
        <p>By using LaunchStack, you agree to these terms and conditions.</p>
        <h2 className="text-lg font-semibold text-ink">1. Account Responsibility</h2>
        <p>
          You are responsible for maintaining the security of your authentication credentials and
          all activity under your workspace.
        </p>
        <h2 className="text-lg font-semibold text-ink">2. Acceptable Use</h2>
        <p>
          You agree not to misuse the service, perform unauthorized penetration testing, or attempt
          to bypass multi-tenant RLS isolation.
        </p>
      </Card>
    </div>
  );
}
