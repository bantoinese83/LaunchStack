export const HOUSE_CALL_POLICIES = [
  {
    id: 'clean_hair',
    title: 'Clean, dry hair',
    body: 'Blowouts and haircuts require hair that is already washed and dried. Luke does not wash hair unless you have a kitchen sink with a spray hose and request a wash.',
  },
  {
    id: 'seating',
    title: 'Chair setup',
    body: 'Please use a low-back or dining chair. High-back chairs aren’t workable — you may be asked to sit backward on the chair, salon-style.',
  },
  {
    id: 'power',
    title: 'Power & space',
    body: 'An outlet near your styling spot is ideal. Luke brings an extension cord when needed.',
  },
  {
    id: 'punctuality',
    title: 'Arrival window',
    body: 'Appointments are scheduled with travel time between house calls. If you’re more than 15 minutes late, your slot may be shortened or forfeited per studio policy.',
  },
] as const;

export const POLICY_ACKnowledgementLabel =
  'I agree to Mystic Hair Co. house-call policies and understand surcharges may apply for one-off bookings.';
