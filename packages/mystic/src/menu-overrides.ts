import { MYSTIC_SERVICES, type MysticService, type ServiceId, getServiceById } from './catalog';

export type MysticMenuOverride = {
  priceCents?: number;
  description?: string;
  name?: string;
};

export type MysticMenuOverridesMap = Partial<Record<ServiceId, MysticMenuOverride>>;

export function mergeMenuOverrides(
  overrides: MysticMenuOverridesMap | null | undefined
): MysticService[] {
  if (!overrides || !Object.keys(overrides).length) return MYSTIC_SERVICES;
  return MYSTIC_SERVICES.map((service) => {
    const patch = overrides[service.id];
    if (!patch) return service;
    return {
      ...service,
      name: patch.name?.trim() || service.name,
      description: patch.description?.trim() || service.description,
      priceCents:
        typeof patch.priceCents === 'number' && patch.priceCents >= 0
          ? Math.round(patch.priceCents)
          : service.priceCents,
    };
  });
}

export function getServiceWithOverrides(
  id: ServiceId,
  overrides: MysticMenuOverridesMap | null | undefined
): MysticService {
  const base = getServiceById(id);
  const patch = overrides?.[id];
  if (!patch) return base;
  return {
    ...base,
    name: patch.name?.trim() || base.name,
    description: patch.description?.trim() || base.description,
    priceCents:
      typeof patch.priceCents === 'number' && patch.priceCents >= 0
        ? Math.round(patch.priceCents)
        : base.priceCents,
  };
}
