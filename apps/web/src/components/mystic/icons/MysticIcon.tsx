import type { LucideIcon } from 'lucide-react';
import {
  CalendarHeart,
  CarFront,
  Gem,
  Gift,
  LayoutGrid,
  LineChart,
  Lock,
  MapPinned,
  Megaphone,
  MessageCircle,
  Package,
  Route,
  Scissors,
  ShoppingBag,
  SlidersHorizontal,
  Sun,
  UserRound,
  Users,
} from 'lucide-react';
import type { MysticIconRole } from '@template/mystic';

const ICONS: Record<MysticIconRole, LucideIcon> = {
  book: CalendarHeart,
  visits: Route,
  plans: Gem,
  shop: ShoppingBag,
  inbox: MessageCircle,
  studio: LayoutGrid,
  profile: UserRound,
  houseCall: CarFront,
  membershipPerk: Gem,
  serviceArea: MapPinned,
  packageOffer: Package,
  secure: Lock,
  serviceMatch: Scissors,
  studioToday: Sun,
  studioCalendar: CalendarHeart,
  studioClients: Users,
  studioMessages: MessageCircle,
  studioBlasts: Megaphone,
  studioReferrals: Gift,
  studioAnalytics: LineChart,
  studioSettings: SlidersHorizontal,
};

type Props = {
  name: MysticIconRole;
  className?: string;
  strokeWidth?: number;
};

/** Mystic-branded Lucide glyph — pair with mobile MDI tabs for the same roles. */
export function MysticIcon({ name, className = 'h-5 w-5', strokeWidth = 1.75 }: Props) {
  const Icon = ICONS[name] ?? Scissors;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}

export function mysticIconTileClassName(active?: boolean) {
  return active ? 'bg-gold-soft text-chalk ring-gold/35' : 'bg-surface text-chalk ring-line/80';
}
