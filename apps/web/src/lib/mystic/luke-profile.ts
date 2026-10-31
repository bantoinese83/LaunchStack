import { MYSTIC_BRAND, MYSTIC_STYLIST } from '@template/mystic';

export const LUKE_PROFILE = {
  name: MYSTIC_STYLIST.name,
  title: 'Founder & house-call stylist',
  brand: MYSTIC_BRAND.name,
  imageSrc: MYSTIC_STYLIST.portraitPath,
  instagram: MYSTIC_BRAND.instagram,
  instagramUrl: 'https://instagram.com/mystichair21',
  serviceArea: MYSTIC_BRAND.serviceAreaLabel,
  languages: ['English'],
  specialties: ['Blowouts & hot-tool styling', 'Precision cuts', 'Event updos', 'Dry styles'],
  bio: `Luke is a house-call stylist in Chicago — blowouts, cuts, updos, and dry styling with a full pro kit at every visit. Share inspo photos, say if you prefer quiet or conversation, and get finished without leaving home.`,
  credentials: [
    'Mobile house calls across Chicago',
    'Membership & package credits at checkout',
    'SMS updates when your appointment is confirmed',
  ],
} as const;
