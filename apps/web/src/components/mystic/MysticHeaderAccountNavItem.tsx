'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { MysticIcon } from '@/components/mystic/icons/MysticIcon';
import { MysticUserAvatar } from '@/components/mystic/MysticUserAvatar';
import { requireBrowserSession } from '@/lib/supabase/browser-session';

const navLink =
  'mystic-link-focus inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted transition hover:bg-surface/80 hover:text-ink';

type Props = {
  placement?: 'bar' | 'menu';
  onNavigate?: () => void;
};

export function MysticHeaderAccountNavItem({ placement = 'bar', onNavigate }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | undefined>();

  useEffect(() => {
    void requireBrowserSession().then((auth) => {
      if (!auth?.user.id) return;
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
    });
  }, []);

  return (
    <Link
      href={'/account' as Route}
      className={
        placement === 'menu'
          ? `${navLink} w-full justify-start rounded-xl px-4 py-3 sm:hidden`
          : `${navLink} hidden sm:inline-flex`
      }
      onClick={onNavigate}
    >
      {avatarUrl || name ? (
        <MysticUserAvatar url={avatarUrl} name={name} size={22} className="ring-1 ring-line/60" />
      ) : (
        <MysticIcon name="profile" className="h-4 w-4 opacity-80" strokeWidth={2} />
      )}
      Account
    </Link>
  );
}
