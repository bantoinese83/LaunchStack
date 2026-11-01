import { redirect } from 'next/navigation';
import { MYSTIC_ACCOUNT_PAGE } from '@template/mystic';
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
    <MysticClientPage width="wide" loose>
      <MysticPageIntro
        eyebrow={MYSTIC_ACCOUNT_PAGE.eyebrow}
        title={MYSTIC_ACCOUNT_PAGE.title}
        description={MYSTIC_ACCOUNT_PAGE.lede}
        className="max-w-3xl"
      />
      <AccountClient initialEmail={user?.email ?? null} />
    </MysticClientPage>
  );
}
