import { redirect } from 'next/navigation';
import { MysticPageIntro } from '@/components/mystic/MysticPageIntro';
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
    <div className="mx-auto max-w-lg">
      <MysticPageIntro
        eyebrow="Account"
        title="Your profile"
        description="Phone and SMS consent are required for house-call updates and door-timer texts."
      />
      <div className="mt-8">
        <AccountClient initialEmail={user?.email ?? null} />
      </div>
    </div>
  );
}
