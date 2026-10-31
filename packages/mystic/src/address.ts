/** Normalize user-entered address pieces before geocoding. */
export function normalizeAddressFields(input: {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
}): { line1: string; city: string; state: string; postalCode: string } {
  let line1 = input.line1.trim().replace(/\s+/g, ' ');
  let city = input.city.trim().replace(/\s+/g, ' ');
  let state = input.state.trim().toUpperCase();
  let postalCode = input.postalCode.trim().replace(/\D/g, '').slice(0, 5);

  const cityStateInCity = city.match(/^(.+?),\s*([A-Za-z]{2})\s*$/);
  if (cityStateInCity) {
    city = cityStateInCity[1].trim();
    state = cityStateInCity[2].toUpperCase();
  }

  if (state.length > 2) {
    state = usStateNameToAbbr(state) ?? state.slice(0, 2);
  }

  return { line1, city, state, postalCode };
}

const US_STATE_ABBR: Record<string, string> = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  'district of columbia': 'DC',
};

function usStateNameToAbbr(name: string): string | null {
  return US_STATE_ABBR[name.trim().toLowerCase()] ?? null;
}

export type AddressSuggestion = {
  id: string;
  label: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
};
