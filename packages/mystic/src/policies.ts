export const HOUSE_CALL_POLICIES = [
  {
    id: 'clean_hair',
    title: 'Clean Hair',
    body: 'Blow dry and haircut services require your hair to be washed prior to the appointment. Accommodations to have your hair washed in home can be made if you have a sink with a hose attachment.',
  },
  {
    id: 'seating',
    title: 'Seating',
    body: 'Please be sure to have a dining or low back chair that allows me to easily access your hair.',
  },
  {
    id: 'power',
    title: 'Power',
    body: 'An electrical outlet nearby. The workstation is ideal. I do carry an extension cord for outlets a bit further away.',
  },
  {
    id: 'punctuality',
    title: 'Appointment time',
    body: 'Appointments are scheduled with travel time between house calls. If you’re more than 15 minutes late, your slot may be shortened or forfeited per studio policy.',
  },
] as const;

export const POLICY_ACKnowledgementLabel =
  'I agree to Mystic Hair Co. house-call policies and understand surcharges may apply for one-off bookings.';
