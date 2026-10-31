'use client';

import {
  BOOKING_FLOW_STEPS,
  BOOKING_FLOW_STEP_HINT,
  BOOKING_FLOW_STEP_LABEL,
  bookingFlowStepIndex,
  canNavigateToBookingStep,
  type BookingFlowStep,
} from '@template/mystic';

type Props = {
  step: BookingFlowStep;
  onStepChange?: (step: BookingFlowStep) => void;
};

export function MysticBookStepProgress({ step, onStepChange }: Props) {
  const currentIndex = bookingFlowStepIndex(step);

  return (
    <div className="mt-8">
      <ol className="flex items-start justify-between gap-1 sm:gap-2" aria-label="Booking steps">
        {BOOKING_FLOW_STEPS.map((id, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const reachable = canNavigateToBookingStep(step, id);
          const label = BOOKING_FLOW_STEP_LABEL[id];

          return (
            <li key={id} className="flex min-w-0 flex-1 flex-col items-center">
              {onStepChange && reachable ? (
                <button
                  type="button"
                  onClick={() => onStepChange(id)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 ${
                    active
                      ? 'bg-accent text-paper'
                      : done
                        ? 'bg-accent/20 text-accent hover:bg-accent/30'
                        : 'border border-line bg-surface text-muted'
                  }`}
                  aria-current={active ? 'step' : undefined}
                  aria-label={`${label}${done ? ', completed' : active ? ', current' : ''}`}
                >
                  {done ? '✓' : index + 1}
                </button>
              ) : (
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    active
                      ? 'bg-accent text-paper'
                      : done
                        ? 'bg-accent/20 text-accent'
                        : 'border border-line bg-surface text-muted'
                  }`}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? '✓' : index + 1}
                </span>
              )}
              <span
                className={`mt-1.5 hidden text-center text-[10px] leading-tight sm:block ${
                  active ? 'font-medium text-ink' : 'text-muted'
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <div
        className="mystic-progress-track mt-4"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={BOOKING_FLOW_STEPS.length}
        aria-valuenow={currentIndex + 1}
        aria-valuetext={`Step ${currentIndex + 1} of ${BOOKING_FLOW_STEPS.length}: ${BOOKING_FLOW_STEP_HINT[step]}`}
      >
        <div
          className="mystic-progress-fill transition-[width] duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / BOOKING_FLOW_STEPS.length) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted">{BOOKING_FLOW_STEP_HINT[step]}</p>
    </div>
  );
}
