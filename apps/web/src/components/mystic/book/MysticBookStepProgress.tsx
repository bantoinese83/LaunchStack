'use client';

import {
  BOOKING_FLOW_STEPS,
  BOOKING_FLOW_STEP_HINT,
  BOOKING_FLOW_STEP_LABEL,
  bookingFlowStepIndex,
  canNavigateToBookingStep,
  type BookingFlowStep,
} from '@template/mystic';
import type { LucideIcon } from 'lucide-react';
import { CalendarClock, Check, ClipboardList, CreditCard, MapPin, Scissors } from 'lucide-react';

type Props = {
  step: BookingFlowStep;
  onStepChange?: (step: BookingFlowStep) => void;
};

/** Icons replace 1–5 on web + mobile. */
const STEP_ICON: Record<BookingFlowStep, LucideIcon> = {
  service: Scissors,
  datetime: CalendarClock,
  location: MapPin,
  details: ClipboardList,
  review: CreditCard,
};

export function MysticBookStepProgress({ step, onStepChange }: Props) {
  const currentIndex = bookingFlowStepIndex(step);

  return (
    <div className="mb-8 w-full">
      <ol
        className="flex items-start justify-between gap-1"
        aria-label="Booking steps"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={BOOKING_FLOW_STEPS.length}
        aria-valuenow={currentIndex + 1}
        aria-valuetext={`Step ${currentIndex + 1} of ${BOOKING_FLOW_STEPS.length}: ${BOOKING_FLOW_STEP_HINT[step]}`}
      >
        {BOOKING_FLOW_STEPS.map((id, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const reachable = canNavigateToBookingStep(step, id);
          const label = BOOKING_FLOW_STEP_LABEL[id];
          const Icon = STEP_ICON[id];
          const glyph = done ? (
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          ) : (
            <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden />
          );
          const chipClass = [
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45',
            active
              ? 'scale-105 bg-accent text-paper shadow-[0_10px_24px_-12px_rgba(122,143,110,0.9)]'
              : done
                ? 'bg-accent-soft text-accent hover:bg-accent/20'
                : 'bg-paper text-muted',
          ].join(' ');

          return (
            <li key={id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              {onStepChange && reachable ? (
                <button
                  type="button"
                  onClick={() => onStepChange(id)}
                  className={chipClass}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`${label}${done ? ', completed' : active ? ', current' : ''}`}
                >
                  {glyph}
                </button>
              ) : (
                <span
                  className={chipClass}
                  aria-current={active ? 'step' : undefined}
                  aria-hidden={!active}
                >
                  {glyph}
                </span>
              )}
              <span
                className={`max-w-full truncate text-center text-[10px] leading-tight tracking-wide ${
                  active ? 'font-semibold text-ink' : 'font-medium text-muted'
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-center text-sm text-muted sm:text-left">
        {BOOKING_FLOW_STEP_HINT[step]}
      </p>
    </div>
  );
}
