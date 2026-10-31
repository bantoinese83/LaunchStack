/** Mystic Hair Co. — single source for menu, memberships, packages (house call). */

export const MYSTIC_BRAND = {
  name: 'Mystic Hair Co.',
  tagline: 'House-call hair in Chicago.',
  instagram: '@mystichair21',
  serviceAreaLabel: 'Chicago · River North & nearby',
} as const;

/** House-call stylist — portrait lives on the web app origin under public/marketing. */
export const MYSTIC_STYLIST = {
  name: 'Luke',
  portraitPath: '/marketing/stylist.jpg',
} as const;

export function mysticStylistPortraitUrl(appOrigin?: string | null): string {
  if (!appOrigin?.trim()) return MYSTIC_STYLIST.portraitPath;
  return `${appOrigin.replace(/\/$/, '')}${MYSTIC_STYLIST.portraitPath}`;
}

export const SERVICE_IDS = ['blowout', 'haircut', 'updo', 'dry_style'] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export type MysticService = {
  id: ServiceId;
  name: string;
  description: string;
  priceCents: number;
  durationMinutes: number;
  houseCall: true;
};

export const MYSTIC_SERVICES: MysticService[] = [
  {
    id: 'blowout',
    name: 'Blowout',
    description: 'Professional blowout with hot-tool styling.',
    priceCents: 4500,
    durationMinutes: 60,
    houseCall: true,
  },
  {
    id: 'haircut',
    name: 'Haircut',
    description: 'Precision cut — hair must be clean and dry unless wash add-on applies.',
    priceCents: 6500,
    durationMinutes: 60,
    houseCall: true,
  },
  {
    id: 'updo',
    name: 'Updo',
    description: 'Event-ready updo; share inspo photos when booking.',
    priceCents: 9000,
    durationMinutes: 60,
    houseCall: true,
  },
  {
    id: 'dry_style',
    name: 'Dry style',
    description: 'Quick curls and brush-out — 30 minutes total.',
    priceCents: 3500,
    durationMinutes: 30,
    houseCall: true,
  },
];

export const MEMBERSHIP_IDS = ['glow', 'luxe'] as const;
export type MembershipId = (typeof MEMBERSHIP_IDS)[number];

export type MysticMembership = {
  id: MembershipId;
  name: string;
  priceCentsMonthly: number;
  blowoutsPerMonth: number;
  extraBlowoutCents: number;
  perks: string[];
};

export const MYSTIC_MEMBERSHIPS: MysticMembership[] = [
  {
    id: 'glow',
    name: 'The Glow',
    priceCentsMonthly: 7000,
    blowoutsPerMonth: 2,
    extraBlowoutCents: 3000,
    perks: [
      'Two professional blowouts each month',
      'Hot-tool styling included',
      'No evening or travel surcharges',
      'Priority booking',
    ],
  },
  {
    id: 'luxe',
    name: 'The Luxe',
    priceCentsMonthly: 14000,
    blowoutsPerMonth: 4,
    extraBlowoutCents: 3000,
    perks: [
      'Four professional blowouts each month',
      'Hot-tool styling included',
      'No evening or travel surcharges',
      'Priority booking',
    ],
  },
];

export const PACKAGE_IDS = ['pack_4', 'pack_6', 'pack_10'] as const;
export type PackageId = (typeof PACKAGE_IDS)[number];

export type MysticPackage = {
  id: PackageId;
  blowoutCount: number;
  priceCents: number;
  pricePerBlowoutCents: number;
  savingsLabel: string;
  expiresMonths: number;
};

export const MYSTIC_PACKAGES: MysticPackage[] = [
  {
    id: 'pack_4',
    blowoutCount: 4,
    priceCents: 16000,
    pricePerBlowoutCents: 4000,
    savingsLabel: 'Save $20',
    expiresMonths: 6,
  },
  {
    id: 'pack_6',
    blowoutCount: 6,
    priceCents: 22500,
    pricePerBlowoutCents: 3750,
    savingsLabel: 'Save $45',
    expiresMonths: 6,
  },
  {
    id: 'pack_10',
    blowoutCount: 10,
    priceCents: 35000,
    pricePerBlowoutCents: 3500,
    savingsLabel: 'Save $100',
    expiresMonths: 6,
  },
];

export const APPOINTMENT_TAG_IDS = [
  'silent',
  'open_to_chat',
  'running_late',
  'need_sink_wash',
] as const;
export type AppointmentTagId = (typeof APPOINTMENT_TAG_IDS)[number];

export const APPOINTMENT_TAGS: { id: AppointmentTagId; label: string }[] = [
  { id: 'silent', label: 'Silent appointment' },
  { id: 'open_to_chat', label: 'Open to chat' },
  { id: 'running_late', label: 'I may be a few minutes late' },
  { id: 'need_sink_wash', label: 'I need a sink wash (hose required)' },
];

export function formatAppointmentTagLabels(tagIds: string[]): string[] {
  return tagIds.map((id) => APPOINTMENT_TAGS.find((t) => t.id === id)?.label ?? id);
}

export function getServiceById(id: ServiceId): MysticService {
  const service = MYSTIC_SERVICES.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service: ${id}`);
  return service;
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}
