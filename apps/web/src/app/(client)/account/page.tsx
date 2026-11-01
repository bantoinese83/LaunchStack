import { redirect } from 'next/navigation';
import { MysticClientPage } from '@/components/mystic/MysticClientPage';
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
    <MysticClientPage>
      <MysticPageIntro
        eyebrow="Account"
        title="Your profile"
        description="Phone and SMS consent are required for house-call updates and arrival texts."
      />
      <AccountClient initialEmail={user?.email ?? null} />
    </MysticClientPage>
  );
}
