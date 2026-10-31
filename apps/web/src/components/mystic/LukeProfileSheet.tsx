'use client';

import type { ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { MapPin, X } from 'lucide-react';
import { LUKE_PROFILE } from '@/lib/mystic/luke-profile';
import { MysticMarketingImage } from '@/components/mystic/MysticMarketingImage';
import { MysticMagneticAnchor, MysticMagneticLink } from './MysticMagneticButton';

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Alan-style provider detail sheet for Luke. */
export function LukeProfileSheet({ open, onClose }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="mystic-luke-sheet z-[100] max-h-[min(92vh,720px)] w-[min(calc(100vw-2rem),32rem)] max-w-lg rounded-[1.75rem] border border-line/80 bg-surface p-0 shadow-[0_24px_80px_-24px_rgba(26,31,24,0.45)]"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="flex max-h-[inherit] flex-col overflow-hidden">
        <div className="relative h-44 shrink-0 overflow-hidden bg-chalk-soft">
          <MysticMarketingImage
            variant="stylist"
            alt=""
            fill
            className="object-cover object-center"
            sizes="512px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-shell/70 via-shell/20 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-white/30 bg-shell/40 p-2 text-paper backdrop-blur-sm"
            aria-label="Close profile"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-5">
          <p className="type-eyebrow text-gold">{LUKE_PROFILE.title}</p>
          <h2 id={titleId} className="font-display mt-1 text-2xl font-medium text-ink">
            {LUKE_PROFILE.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {LUKE_PROFILE.serviceArea}
          </p>

          <p className="mt-5 text-sm leading-relaxed text-ink/90">{LUKE_PROFILE.bio}</p>

          <div className="mt-6">
            <p className="type-eyebrow text-muted">Specialties</p>
            <ul className="mt-2 space-y-2 text-sm text-ink/90">
              {LUKE_PROFILE.specialties.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {LUKE_PROFILE.languages.map((lang) => (
              <span
                key={lang}
                className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-muted"
              >
                {lang}
              </span>
            ))}
          </div>

          <ul className="mt-6 space-y-2 border-t border-line/70 pt-6 text-sm text-muted">
            {LUKE_PROFILE.credentials.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <MysticMagneticLink href="/book" className="flex-1 sm:flex-none">
              Book with Luke
            </MysticMagneticLink>
            <MysticMagneticAnchor
              href={LUKE_PROFILE.instagramUrl}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              {LUKE_PROFILE.instagram}
            </MysticMagneticAnchor>
          </div>
        </div>
      </div>
    </dialog>
  );
}

/** Button that opens {@link LukeProfileSheet} via parent state. */
export function LukeProfileTrigger({
  onOpen,
  className = '',
  children,
}: {
  onOpen: () => void;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button type="button" onClick={onOpen} className={className}>
      {children ?? 'About Luke'}
    </button>
  );
}
