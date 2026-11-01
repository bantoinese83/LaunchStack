'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { ServiceId } from '@template/mystic';
import { MysticAiOrb } from '@/components/mystic/MysticAiOrb';
import { MysticIcon } from '@/components/mystic/icons/MysticIcon';
import { cn } from '@/lib/utils';

export type BookingCopilotExtras = {
  clarifyingQuestion?: string;
  alternatives?: { serviceId: string; serviceName?: string; why: string }[];
  confidence?: string;
} | null;

type CopilotBodyProps = {
  prompt: string;
  onPromptChange: (value: string) => void;
  busy: boolean;
  hint: string | null;
  extras: BookingCopilotExtras;
  onSubmit: () => void;
  onPickService: (serviceId: ServiceId) => void;
  className?: string;
};

function MysticBookingCopilotBody({
  prompt,
  onPromptChange,
  busy,
  hint,
  extras,
  onSubmit,
  onPickService,
  className,
}: CopilotBodyProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-3">
        <MysticAiOrb active={busy} size="sm" label="Booking concierge" />
        <div>
          <p className="type-hand-md text-plum">Booking copilot</p>
          <p className="mt-0.5 text-xs text-muted">
            Describe the look — I’ll match a service and tags.
          </p>
        </div>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        rows={4}
        maxLength={400}
        placeholder="Wedding guest, soft waves, 45 minutes before photos…"
        className="min-h-[5.5rem] w-full resize-y rounded-xl border border-line/60 bg-paper px-3 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-accent/40 focus:ring-2 focus:ring-accent/15"
      />
      <button
        type="button"
        disabled={busy}
        onClick={onSubmit}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-accent-hover disabled:opacity-50"
      >
        <MysticIcon name="serviceMatch" className="h-4 w-4" strokeWidth={2.25} />
        {busy ? 'Matching…' : 'Recommend a service'}
      </button>
      {hint ? <p className="text-sm leading-relaxed text-muted">{hint}</p> : null}
      {extras?.clarifyingQuestion ? (
        <p className="text-sm text-plum">Still unsure? {extras.clarifyingQuestion}</p>
      ) : null}
      {extras?.alternatives && extras.alternatives.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className="type-eyebrow text-muted">Also consider</p>
          {extras.alternatives.map((alt) => (
            <button
              key={alt.serviceId}
              type="button"
              onClick={() => onPickService(alt.serviceId as ServiceId)}
              className="rounded-xl border border-line/50 bg-paper px-3 py-2 text-left text-xs text-ink transition hover:border-accent/30 hover:bg-accent-soft/40"
            >
              <span className="font-medium text-accent">{alt.serviceName ?? alt.serviceId}</span>
              <span className="text-muted"> — {alt.why}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type Props = CopilotBodyProps & {
  layout?: 'rail' | 'card';
};

/** Copilot sidebar on desktop; floating launcher + slide-over on smaller viewports. */
export function MysticBookingCopilot({ layout = 'card', ...props }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (sheetOpen) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [sheetOpen]);

  useEffect(() => {
    if (!sheetOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSheetOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  return (
    <>
      <aside
        className={cn(
          'hidden lg:col-start-2 lg:row-start-2 lg:row-span-1 lg:block lg:self-stretch',
          layout === 'rail' && 'lg:border-l lg:border-line/55 lg:pl-8'
        )}
        aria-label="Booking copilot"
      >
        <div
          className={cn(
            'sticky top-[5.25rem] w-full',
            layout === 'rail'
              ? 'pt-1'
              : 'rounded-2xl border border-line/70 bg-surface/95 p-5 shadow-[0_16px_48px_-28px_rgba(26,31,24,0.35)] backdrop-blur-sm'
          )}
        >
          <MysticBookingCopilotBody {...props} />
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-line/80 bg-surface/95 py-2 pl-2 pr-4 text-sm font-medium text-ink shadow-[0_12px_40px_-16px_rgba(26,31,24,0.45)] backdrop-blur-md transition hover:border-accent/40 lg:hidden"
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
      >
        <MysticAiOrb active={props.busy} size="xs" label="Booking copilot" />
        Copilot
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="mystic-copilot-sheet z-[90] h-full max-h-none w-[min(100vw-2.5rem,24rem)] max-w-none rounded-l-[1.5rem] border border-line/80 border-r-0 bg-surface p-0 shadow-[-12px_0_48px_-20px_rgba(26,31,24,0.4)]"
        onClose={() => setSheetOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setSheetOpen(false);
        }}
      >
        <div className="flex h-full max-h-[100dvh] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line/60 px-4 py-3">
            <h2 id={titleId} className="text-sm font-semibold text-ink">
              Booking copilot
            </h2>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="rounded-full p-2 text-muted hover:bg-accent-soft/50 hover:text-ink"
              aria-label="Close copilot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <MysticBookingCopilotBody {...props} />
          </div>
        </div>
      </dialog>
    </>
  );
}
