import type { SimpleIcon } from 'simple-icons';
import {
  siBrevo,
  siDocker,
  siExpo,
  siFramer,
  siGithubactions,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPosthog,
  siReact,
  siSentry,
  siStripe,
  siSupabase,
  siTailwindcss,
  siTurborepo,
  siTypescript,
  siUpstash,
  siVercel,
  siVitest,
  siZod,
} from 'simple-icons';

export type LaunchStackTechEntry = {
  name: string;
  icon: SimpleIcon | null;
  /** Official mark when Simple Icons has no entry (from Monarch Labs tech-logos). */
  logoSrc?: string;
  logoAlt: string;
  fill?: string;
};

/** Technologies used across the LaunchStack monorepo (web, admin, mobile, packages). */
export const LAUNCHSTACK_TECH_ENTRIES: LaunchStackTechEntry[] = [
  { name: 'TypeScript', icon: siTypescript, logoAlt: 'TypeScript' },
  { name: 'React', icon: siReact, logoAlt: 'React' },
  { name: 'Next.js', icon: siNextdotjs, logoAlt: 'Next.js' },
  { name: 'Node.js', icon: siNodedotjs, logoAlt: 'Node.js' },
  { name: 'Expo', icon: siExpo, logoAlt: 'Expo' },
  {
    name: 'React Native',
    icon: null,
    logoSrc: '/marketing/tech-logos/react-native.svg',
    logoAlt: 'React Native',
  },
  { name: 'Turborepo', icon: siTurborepo, logoAlt: 'Turborepo' },
  { name: 'Supabase', icon: siSupabase, logoAlt: 'Supabase' },
  { name: 'PostgreSQL', icon: siPostgresql, logoAlt: 'PostgreSQL' },
  { name: 'Stripe', icon: siStripe, logoAlt: 'Stripe' },
  { name: 'Tailwind CSS', icon: siTailwindcss, logoAlt: 'Tailwind CSS' },
  { name: 'Zod', icon: siZod, logoAlt: 'Zod' },
  { name: 'Vitest', icon: siVitest, logoAlt: 'Vitest' },
  { name: 'Upstash', icon: siUpstash, logoAlt: 'Upstash Redis' },
  { name: 'PostHog', icon: siPosthog, logoAlt: 'PostHog' },
  { name: 'Brevo', icon: siBrevo, logoAlt: 'Brevo' },
  { name: 'Sentry', icon: siSentry, logoAlt: 'Sentry' },
  { name: 'Vercel', icon: siVercel, logoAlt: 'Vercel' },
  { name: 'Docker', icon: siDocker, logoAlt: 'Docker' },
  { name: 'GitHub Actions', icon: siGithubactions, logoAlt: 'GitHub Actions' },
  { name: 'Framer Motion', icon: siFramer, logoAlt: 'Framer Motion' },
];

const midpoint = Math.ceil(LAUNCHSTACK_TECH_ENTRIES.length / 2);

export const LAUNCHSTACK_TECH_ROW_A = LAUNCHSTACK_TECH_ENTRIES.slice(0, midpoint);
export const LAUNCHSTACK_TECH_ROW_B = LAUNCHSTACK_TECH_ENTRIES.slice(midpoint);
