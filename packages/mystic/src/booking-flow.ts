export const BOOKING_FLOW_STEPS = ['service', 'datetime', 'location', 'details', 'review'] as const;

export type BookingFlowStep = (typeof BOOKING_FLOW_STEPS)[number];

/** Short labels for stepper UI. */
export const BOOKING_FLOW_STEP_LABEL: Record<BookingFlowStep, string> = {
  service: 'Service',
  datetime: 'Time',
  location: 'Address',
  details: 'Details',
  review: 'Pay',
};

/** One-line guidance under the stepper. */
export const BOOKING_FLOW_STEP_HINT: Record<BookingFlowStep, string> = {
  service: 'Pick a service',
  datetime: 'Choose date & time',
  location: 'House-call address',
  details: 'Preferences & referral',
  review: 'Review summary before payment',
};

export function bookingFlowStepIndex(step: BookingFlowStep): number {
  return BOOKING_FLOW_STEPS.indexOf(step);
}

export function bookingFlowProgressPercent(step: BookingFlowStep): number {
  const index = bookingFlowStepIndex(step);
  return ((index + 1) / BOOKING_FLOW_STEPS.length) * 100;
}

/** Jump back to an earlier step (same step allowed). */
export function canNavigateToBookingStep(
  current: BookingFlowStep,
  target: BookingFlowStep
): boolean {
  return bookingFlowStepIndex(target) <= bookingFlowStepIndex(current);
}
