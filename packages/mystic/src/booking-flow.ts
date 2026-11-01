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
  service: 'What are we doing at your place?',
  datetime: 'Pick an open slot — times are Chicago local',
  location: 'Where should Luke pull up?',
  details: 'Optional tags, inspo, or a friend referral',
  review: 'Confirm details, then pay the deposit with Stripe',
};

/** First weekday within the booking horizon (skips Sat/Sun). */
export function defaultBookingDateIso(from: Date = new Date(), maxLookahead = 14): string {
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < maxLookahead; i++) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      return cursor.toISOString().slice(0, 10);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return cursor.toISOString().slice(0, 10);
}

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
