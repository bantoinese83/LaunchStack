'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useCallback, useEffect, useId, useState } from 'react';
import type { MysticIconRole } from '@template/mystic';
import { MysticIcon } from '@/components/mystic/icons/MysticIcon';
import { MysticHeaderAccountNavItem } from '@/components/mystic/MysticHeaderAccountNavItem';

const items: { href: string; label: string; icon: MysticIconRole }[] = [
  { href: '/visits', label: 'My visits', icon: 'visits' },
  { href: '/messages', label: 'Messages', icon: 'inbox' },
  { href: '/memberships', label: 'Plans', icon: 'plans' },
  { href: '/shop', label: 'Shop', icon: 'shop' },
];

const rowLink =
  'mystic-link-focus flex items-center gap-3 rounded-xl px-4 py-3 text-base text-ink transition hover:bg-surface/90';

/** Primary client nav on viewports below `sm` — desktop uses inline header links. */
export function MysticHeaderMobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className="mystic-link-focus inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted transition hover:bg-surface/80 hover:text-ink"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <MysticIcon name="studio" className="h-4 w-4 opacity-80" strokeWidth={2} aria-hidden />
        Menu
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={close}
          />
          <nav
            id={panelId}
            aria-label="Client menu"
            className="fixed inset-x-3 top-[4.25rem] z-[60] max-h-[min(70vh,420px)] overflow-y-auto rounded-2xl border border-line/80 bg-paper p-3 shadow-[0_20px_60px_-20px_rgba(26,31,24,0.35)]"
          >
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href as Route} className={rowLink} onClick={close}>
                    <MysticIcon name={item.icon} className="h-5 w-5 text-accent" strokeWidth={2} />
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-line/70 pt-2">
                <MysticHeaderAccountNavItem placement="menu" onNavigate={close} />
              </li>
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  );
}
