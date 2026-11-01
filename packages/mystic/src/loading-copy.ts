/** Short loading labels — shared by web and mobile loaders. */
export const MYSTIC_LOADING_COPY = {
  default: 'Getting ready…',
  signIn: 'Finishing sign-in…',
  profile: 'Opening your profile…',
  visits: 'Gathering your house calls…',
  messages: 'Loading your thread…',
  studio: 'Checking the studio…',
  map: 'Plotting the route…',
  welcome: 'Preparing welcome…',
  board: 'Loading this week’s house calls…',
  referrals: 'Loading referrals…',
  settings: 'Loading settings…',
  blockedDates: 'Loading blocked dates…',
  history: 'Loading history…',
  route: 'Loading stops…',
} as const;

export type MysticLoadingCopyKey = keyof typeof MYSTIC_LOADING_COPY;
