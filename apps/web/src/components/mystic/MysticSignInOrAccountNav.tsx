'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { MysticUserAvatar } from '@/components/mystic/MysticUserAvatar';
import { MysticIcon } from '@/components/mystic/icons/MysticIcon';
import { getBrowserSupabaseClient } from '@/lib/supabase/browser-session';

type Props = {
  /** From server on first paint — avoids flashing “Sign in” when cookies are valid. */
  initialSignedIn?: boolean;
  signInClassName?: string;
  accountClassName?: string;
};

export function MysticSignInOrAccountNav({
  initialSignedIn = false,
  signInClassName = '',
  accountClassName = '',
}: Props) {
  const [signedIn, setSignedIn] = useState(initialSignedIn);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | undefined>();

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    const sync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const ok = Boolean(session?.user);
      setSignedIn(ok);
      if (!ok) {
        setAvatarUrl(null);
        setName(undefined);
        return;
      }
      void fetch('/api/mystic/client-profile')
        .then((r) => r.json())
        .then((data) => {
          const p = data.profile;
          if (p) {
            setAvatarUrl(p.avatar_url ?? null);
            setName(p.full_name ?? p.email ?? undefined);
          }
        })
        .catch(() => {
          /* optional */
        });
    };
    void sync();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void sync();
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!signedIn) {
    return (
      <Link href="/login" className={signInClassName}>
        Sign in
      </Link>
    );
  }

  return (
    <Link href={'/account' as Route} className={accountClassName}>
      {avatarUrl || name ? (
        <MysticUserAvatar url={avatarUrl} name={name} size={30} className="ring-1 ring-gold/25" />
      ) : (
        <MysticIcon name="profile" className="h-4 w-4 opacity-80" strokeWidth={2} />
      )}
      Account
    </Link>
  );
}
