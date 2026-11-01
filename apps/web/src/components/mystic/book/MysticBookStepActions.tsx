'use client';

import type { ReactNode } from 'react';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';

export type MysticBookSelectionSummary = {
  primary: string;
  secondary?: string;
};

type Props = {
  onBack: () => void;
  onContinue: () => void;
  backLabel?: string;
  continueLabel?: string;
  continueDisabled?: boolean;
  /** Shown above the buttons (e.g. validation hint). */
  footer?: ReactNode;
  /** Fresha-style total row above Continue. */
  selectionSummary?: MysticBookSelectionSummary;
};

/** Sticky back / continue — keeps primary actions visible while scrolling long steps. */
export function MysticBookStepActions({
  onBack,
  onContinue,
  backLabel = 'Back',
  continueLabel = 'Continue',
  continueDisabled,
  footer,
  selectionSummary,
}: Props) {
  return (
    <div
      className="sticky bottom-0 z-10 -mx-1 mt-8 space-y-2 border-t border-line/80 bg-paper/95 px-1 pt-4 pb-3 backdrop-blur-sm"
      role="toolbar"
      aria-label="Booking step actions"
    >
      {footer ? <div className="px-1 text-xs text-muted">{footer}</div> : null}
      {selectionSummary ? (
        <div className="flex items-baseline justify-between gap-3 px-1" aria-live="polite">
          <span className="text-xl font-semibold tabular-nums text-ink">
            {selectionSummary.primary}
          </span>
          {selectionSummary.secondary ? (
            <span className="text-right text-xs text-muted">{selectionSummary.secondary}</span>
          ) : null}
        </div>
      ) : null}
      <div className="flex gap-3">
        <MysticMagneticButton
          type="button"
          variant="secondary"
          className="min-w-0 flex-1"
          fullWidth
          onClick={onBack}
        >
          {backLabel}
        </MysticMagneticButton>
        <MysticMagneticButton
          type="button"
          className="min-w-0 flex-1"
          fullWidth
          disabled={continueDisabled}
          onClick={onContinue}
        >
          {continueLabel}
        </MysticMagneticButton>
      </div>
    </div>
  );
}
