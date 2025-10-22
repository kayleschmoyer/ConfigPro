import { Location, StockSnapshot, TransferPlan } from './types';

type SurplusDeficit = {
  skuId: string;
  locationId: string;
  surplus: number;
  deficit: number;
};

type BalanceOptions = {
  minDisplayQty?: number;
  transferLeadTimeDays?: number;
  transferCost?: number;
};

const toKey = (skuId: string, locationId: string) => `${skuId}-${locationId}`;

const buildSurplusMap = (
  snapshots: StockSnapshot[],
  minDisplayQty = 0
): Record<string, SurplusDeficit> => {
  return snapshots.reduce<Record<string, SurplusDeficit>>((acc, snapshot) => {
    const projected = snapshot.onHand + snapshot.onOrder - snapshot.allocated;
    const surplus = Math.max(projected - Math.max(snapshot.safety, minDisplayQty), 0);
    const deficit = Math.max(snapshot.safety - projected, 0);
    acc[toKey(snapshot.skuId, snapshot.locationId)] = {
      skuId: snapshot.skuId,
      locationId: snapshot.locationId,
      surplus,
      deficit
    };
    return acc;
  }, {});
};

export const optimizeTransfers = (
  snapshots: StockSnapshot[],
  locations: Location[],
  options: BalanceOptions = {}
): TransferPlan[] => {
  const map = buildSurplusMap(snapshots, options.minDisplayQty);
  const locationPriority = new Map(locations.map((loc) => [loc.id, loc.priority ?? 1]));
  const plans: TransferPlan[] = [];

  snapshots.forEach((snapshot) => {
    const key = toKey(snapshot.skuId, snapshot.locationId);
    const entry = map[key];
    if (!entry || entry.deficit <= 0) return;
    const candidates = snapshots
      .filter((other) => other.skuId === snapshot.skuId && other.locationId !== snapshot.locationId)
      .map((other) => ({ other, surplus: map[toKey(other.skuId, other.locationId)]?.surplus ?? 0 }))
      .filter(({ surplus }) => surplus > 0)
      .sort((a, b) => (locationPriority.get(a.other.locationId) ?? 1) - (locationPriority.get(b.other.locationId) ?? 1));

    let remaining = entry.deficit;

    for (const candidate of candidates) {
      if (remaining <= 0) break;
      const qty = Math.min(candidate.surplus, remaining);
      if (qty <= 0) continue;
      map[toKey(candidate.other.skuId, candidate.other.locationId)].surplus -= qty;
      remaining -= qty;
      plans.push({
        id: `${snapshot.skuId}-${candidate.other.locationId}-${snapshot.locationId}-${Date.now()}`,
        fromLocationId: candidate.other.locationId,
        toLocationId: snapshot.locationId,
        lines: [{ skuId: snapshot.skuId, qty }],
        leadTimeDays: options.transferLeadTimeDays,
        transferCost: options.transferCost
          ? { currency: 'USD', value: options.transferCost * qty }
          : undefined,
        status: 'DRAFT'
      });
    }
  });

  return plans;
};
