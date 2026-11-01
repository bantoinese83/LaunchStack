'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  BOOKING_FLOW_STEPS,
  BOOKING_FLOW_STEP_LABEL,
  bookingFlowStepIndex,
  canNavigateToBookingStep,
  type BookingFlowStep,
} from '@template/mystic';

type Props = {
  step: BookingFlowStep;
  onStepChange?: (step: BookingFlowStep) => void;
  className?: string;
};

/** In-flow trail: Book › Service › … › current step */
export function MysticBookStepBreadcrumb({ step, onStepChange, className = '' }: Props) {
  const currentIndex = bookingFlowStepIndex(step);

  return (
    <nav aria-label="Booking steps" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-muted">
        <li className="inline-flex items-center gap-1">
          <Link
            href="/book"
            className="mystic-link-focus rounded-sm font-medium transition hover:text-ink hover:underline"
          >
            Book
          </Link>
        </li>
        {BOOKING_FLOW_STEPS.map((id, index) => {
          const label = BOOKING_FLOW_STEP_LABEL[id];
          const isLast = index === currentIndex;
          const reachable = Boolean(onStepChange && canNavigateToBookingStep(step, id));
          return (
            <li key={id} className="inline-flex items-center gap-1">
              <ChevronRight className="h-3 w-3 shrink-0 text-line/90" aria-hidden />
              {isLast ? (
                <span className="font-medium text-ink/85" aria-current="step">
                  {label}
                </span>
              ) : reachable ? (
                <button
                  type="button"
                  onClick={() => onStepChange?.(id)}
                  className="mystic-link-focus rounded-sm transition hover:text-ink hover:underline"
                >
                  {label}
                </button>
              ) : (
                <span>{label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
