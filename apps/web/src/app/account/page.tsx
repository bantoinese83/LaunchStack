import { redirect } from 'next/navigation';
import { MysticHeader } from '@/app/(marketing)/components/mystic/MysticHeader';
import { getVerifiedServerUser } from '@/lib/supabase/server';
import { AccountClient } from './AccountClient';

export default async function AccountPage() {
  const { userId, supabase } = await getVerifiedServerUser();
  if (!userId) {
    redirect('/login?next=/account');
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-paper">
      <MysticHeader />
      <div className="px-5 py-10 md:px-8">
        <p className="type-eyebrow text-accent">Account</p>
        <h1 className="font-display mt-2 text-3xl font-medium">Your profile</h1>
        <p className="mt-2 max-w-lg text-muted">
          Phone and SMS consent are required for house-call updates and door-timer texts.
        </p>
        <div className="mt-8">
          <AccountClient initialEmail={user?.email ?? null} />
        </div>
      </div>
    </div>
  );
}
