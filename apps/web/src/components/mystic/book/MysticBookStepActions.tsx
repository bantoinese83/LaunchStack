'use client';

import type { ReactNode } from 'react';
import { MysticMagneticButton } from '@/components/mystic/MysticMagneticButton';

type Props = {
  onBack: () => void;
  onContinue: () => void;
  backLabel?: string;
  continueLabel?: string;
  continueDisabled?: boolean;
  /** Shown above the buttons (e.g. validation hint). */
  footer?: ReactNode;
};

/** Sticky back / continue — keeps primary actions visible while scrolling long steps. */
export function MysticBookStepActions({
  onBack,
  onContinue,
  backLabel = 'Back',
  continueLabel = 'Continue',
  continueDisabled,
  footer,
}: Props) {
  return (
    <div
      className="sticky bottom-3 z-10 mt-8 space-y-2 rounded-2xl bg-surface/95 p-3 shadow-[0_16px_48px_-20px_rgba(26,31,24,0.35)] backdrop-blur-md"
      role="toolbar"
      aria-label="Booking step actions"
    >
      {footer ? <div className="px-1 text-xs text-muted">{footer}</div> : null}
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
