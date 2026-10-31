import {
  MYSTIC_SERVICE_ICON_FACE,
  MYSTIC_SERVICE_ICON_FACE_UPDO,
  MYSTIC_SERVICE_ICON_HAIR,
  MYSTIC_SERVICE_ICON_STRANDS,
  MYSTIC_SERVICE_ICON_TONES,
  type ServiceId,
} from '@template/mystic';

type Props = {
  serviceId: ServiceId;
  className?: string;
  size?: 'sm' | 'md';
};

function ServiceArt({ serviceId }: { serviceId: ServiceId }) {
  const tone = MYSTIC_SERVICE_ICON_TONES[serviceId];
  const hair = MYSTIC_SERVICE_ICON_HAIR[serviceId];
  const strands = MYSTIC_SERVICE_ICON_STRANDS[serviceId];
  const face = serviceId === 'updo' ? MYSTIC_SERVICE_ICON_FACE_UPDO : MYSTIC_SERVICE_ICON_FACE;

  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
      <circle cx="32" cy="32" r="30" fill={tone.badge} />

      <path
        d={hair}
        fill={tone.hair}
        stroke={tone.stroke}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {strands.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke={tone.stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
      ))}

      <path
        d={face}
        fill={tone.skin}
        stroke={tone.stroke}
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {serviceId === 'updo' && tone.accent ? (
        <g transform="translate(41 11)">
          <circle cx="0" cy="0" r="3.4" fill={tone.accent} stroke={tone.stroke} strokeWidth="1.3" />
          <circle
            cx="-2.4"
            cy="1.8"
            r="2.3"
            fill={tone.accent}
            stroke={tone.stroke}
            strokeWidth="1.1"
          />
          <circle
            cx="2.4"
            cy="1.8"
            r="2.3"
            fill={tone.accent}
            stroke={tone.stroke}
            strokeWidth="1.1"
          />
          <circle cx="0" cy="0.5" r="1.15" fill={tone.hair} />
        </g>
      ) : null}
    </svg>
  );
}

/** Flaticon-style outline-color service marks (profile hair busts). */
export function MysticServiceIllustration({ serviceId, className = '', size = 'md' }: Props) {
  const dim = size === 'sm' ? 'h-12 w-12' : 'h-[4.25rem] w-[4.25rem]';

  return (
    <div className={`relative ${dim} shrink-0 ${className}`} aria-hidden>
      <ServiceArt serviceId={serviceId} />
    </div>
  );
}
