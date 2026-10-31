'use client';

import Link from 'next/link';
import {
  formatAddressLine,
  formatVisitWhen,
  getServiceById,
  isVisitLiveTracking,
  type ServiceId,
} from '@template/mystic';
import { MysticDoorTimerBanner } from '@/components/mystic/MysticDoorTimerBanner';
import {
  MysticLiveMapEmbed,
  visitAddressDestination,
} from '@/components/mystic/MysticLiveMapEmbed';
import { MysticVisitStatusBadge } from '@/components/mystic/MysticVisitStatusBadge';
import { MysticMagneticLink } from '@/components/mystic/MysticMagneticButton';
import { MysticServiceIllustration } from '@/components/mystic/illustrations/MysticServiceIllustration';
import { MysticStylistChip } from '@/components/mystic/MysticStylistChip';
import { mysticFlatRow, mysticLiveHighlight } from '@/components/mystic/mystic-styles';

type Visit = {
  id: string;
  service_id: string;
  starts_at: string;
  status: string;
  address?: Record<string, unknown>;
  eta_minutes: number | null;
  door_timer_ends_at: string | null;
  stylist_latitude: number | null;
  stylist_longitude: number | null;
  stylist_location_updated_at: string | null;
};

/** Zocdoc-style “Up next” hero for the nearest upcoming visit. */
export function MysticVisitUpNext({ visit }: { visit: Visit }) {
  let serviceName = visit.service_id;
  try {
    serviceName = getServiceById(visit.service_id as ServiceId).name;
  } catch {
    /* keep id */
  }
  const live = isVisitLiveTracking(visit.status);
  const addressLine = formatAddressLine(visit.address);

  return (
    <section aria-labelledby="visit-up-next-heading">
      <h2 id="visit-up-next-heading" className="type-eyebrow text-plum">
        Up next
      </h2>
      <div className={`${mysticFlatRow} mt-2 pb-6 ${live ? mysticLiveHighlight : ''}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-display text-lg font-medium text-ink">
            {formatVisitWhen(visit.starts_at)}
          </p>
          <MysticVisitStatusBadge status={visit.status} />
        </div>
        <div className="mt-2 flex items-center gap-3">
          <MysticServiceIllustration serviceId={visit.service_id as ServiceId} size="sm" />
          <p className="text-sm font-medium text-ink">{serviceName}</p>
        </div>
        <MysticStylistChip className="mt-3" />
        {addressLine ? <p className="mt-1 text-xs text-muted">{addressLine}</p> : null}
        {visit.status === 'stylist_en_route' && visit.eta_minutes ? (
          <p className="mt-2 text-sm text-chalk">Luke is ~{visit.eta_minutes} min away</p>
        ) : null}
        {visit.status === 'door_timer_active' && visit.door_timer_ends_at ? (
          <MysticDoorTimerBanner endsAt={visit.door_timer_ends_at} />
        ) : null}
        {visit.status === 'stylist_en_route' &&
        visit.stylist_latitude != null &&
        visit.stylist_longitude != null ? (
          <div className="mt-3 overflow-hidden rounded-xl">
            <MysticLiveMapEmbed
              latitude={visit.stylist_latitude}
              longitude={visit.stylist_longitude}
              updatedAt={visit.stylist_location_updated_at}
              destination={visitAddressDestination(visit.address)}
            />
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href={`/visits#${visit.id}`} className="font-medium text-accent underline">
            View details
          </Link>
          <MysticMagneticLink href="/messages" variant="secondary" size="sm">
            Message Luke
          </MysticMagneticLink>
        </div>
      </div>
    </section>
  );
}
