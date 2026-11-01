'use client';

import {
  BOOKING_ENTITLEMENT_LABEL,
  BOOK_FLOW_COPY,
  type ClientEntitlement,
} from '@template/mystic';
import { mysticTimeChip } from '@/components/mystic/mystic-styles';

type Props = {
  value: ClientEntitlement;
  options: ClientEntitlement[];
  onChange: (value: ClientEntitlement) => void;
};

export function MysticBookEntitlementPicker({ value, options, onChange }: Props) {
  if (options.length <= 1) return null;

  return (
    <div className="space-y-2">
      <p className="type-eyebrow text-plum">{BOOK_FLOW_COPY.planForVisit}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={mysticTimeChip(value === option)}
          >
            {BOOKING_ENTITLEMENT_LABEL[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
