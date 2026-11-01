'use client';

import {
  BOOKING_FLOW_STEP_LABEL,
  formatUsd,
  formatVisitWhen,
  getServiceById,
  type BookingFlowStep,
  type ServiceId,
} from '@template/mystic';

type Props = {
  step: BookingFlowStep;
  serviceId: ServiceId;
  scheduledAt: Date | null;
  addressLine1: string;
  /** Service + surcharges before tip; null until time & distance are known. */
  estimateCents: number | null;
};

export function MysticBookTripSummary({
  step,
  serviceId,
  scheduledAt,
  addressLine1,
  estimateCents,
}: Props) {
  if (step === 'service') return null;

  let serviceName: string = serviceId;
  try {
    serviceName = getServiceById(serviceId).name;
  } catch {
    /* unknown */
  }

  const whenLabel = scheduledAt ? formatVisitWhen(scheduledAt.toISOString()) : 'Pick date & time';
  const whereLabel = addressLine1.trim() || 'Add your address';
  const estimateLabel =
    estimateCents != null ? formatUsd(estimateCents) : 'Estimate after time & address';

  return (
    <aside
      className="hidden lg:block lg:sticky lg:top-24 lg:col-start-2 lg:row-start-2 lg:self-start"
      aria-label="Booking summary"
    >
      <div className="rounded-2xl border border-line/70 bg-surface/90 p-5 text-sm shadow-[0_12px_40px_-24px_rgba(26,31,24,0.45)]">
        <p className="type-eyebrow text-plum">Your house call</p>
        <p className="mt-1 font-display text-lg font-medium text-ink">{serviceName}</p>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">When</dt>
            <dd className={`mt-0.5 ${scheduledAt ? 'text-ink' : 'text-muted'}`}>{whenLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">Where</dt>
            <dd className={`mt-0.5 ${addressLine1.trim() ? 'text-ink' : 'text-muted'}`}>
              {whereLabel}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">
              Estimate
            </dt>
            <dd
              className={`mt-0.5 tabular-nums ${estimateCents != null ? 'font-medium text-ink' : 'text-muted'}`}
            >
              {estimateLabel}
            </dd>
            {estimateCents != null ? (
              <dd className="mt-1 text-xs text-muted">Before tip · deposit at checkout</dd>
            ) : null}
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Step {BOOKING_FLOW_STEP_LABEL[step]} — you can tap the stepper above to jump back anytime.
        </p>
      </div>
    </aside>
  );
}
