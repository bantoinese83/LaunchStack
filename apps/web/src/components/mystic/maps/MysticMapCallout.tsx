import { MYSTIC_STYLIST } from '@template/mystic';
import { MysticUserAvatar } from '@/components/mystic/MysticUserAvatar';
import type { MysticMapMarker } from './mystic-map-types';

function resolveAvatar(marker: MysticMapMarker) {
  if (marker.avatarUrl !== undefined || marker.avatarName) {
    return {
      url: marker.avatarUrl ?? null,
      name: marker.avatarName ?? marker.title,
    };
  }
  if (marker.tone === 'stylist') {
    return { url: MYSTIC_STYLIST.portraitPath, name: MYSTIC_STYLIST.name };
  }
  return { url: marker.avatarUrl ?? null, name: marker.avatarName ?? marker.title };
}

/** Shared pin label for Google advanced markers and Leaflet popups. */
export function MysticMapCallout({
  marker,
  compact = false,
}: {
  marker: MysticMapMarker;
  compact?: boolean;
}) {
  const avatar = resolveAvatar(marker);
  return (
    <div className={`flex items-center gap-2 ${compact ? 'max-w-[140px]' : 'max-w-[168px]'}`}>
      <MysticUserAvatar url={avatar.url} name={avatar.name} size={compact ? 36 : 44} />
      <div className="min-w-0 text-left">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-ink">
          {marker.title}
        </p>
        {marker.subtitle ? (
          <p className="line-clamp-2 text-[10px] leading-snug text-muted">{marker.subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
