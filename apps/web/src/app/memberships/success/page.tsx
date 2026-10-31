import Link from 'next/link';

export default function MembershipSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="font-display text-3xl font-medium">Welcome to the family</h1>
      <p className="mt-4 text-muted">
        Your membership or package is active. Book your next house call.
      </p>
      <Link
        href="/book"
        className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm text-white"
      >
        Book now
      </Link>
    </div>
  );
}
