import type { SKU, StockSnapshot } from './index';

type KitAvailability = {
  skuId: string;
  available: number;
  gatedBy?: { skuId: string; required: number; available: number };
};

export const computeKitAvailability = (
  kit: SKU,
  snapshots: StockSnapshot[]
): KitAvailability => {
  if (!kit.isKit || !kit.bom || kit.bom.length === 0) {
    const snapshot = snapshots.find((item) => item.skuId === kit.id);
    return { skuId: kit.id, available: snapshot ? snapshot.onHand - snapshot.allocated : 0 };
  }

  let minAvailability = Number.POSITIVE_INFINITY;
  let gatingComponent: KitAvailability['gatedBy'];

  for (const component of kit.bom) {
    const snapshot = snapshots.find((item) => item.skuId === component.childSkuId);
    const available = snapshot ? snapshot.onHand - snapshot.allocated : 0;
    const possible = Math.floor(available / component.qty);
    if (possible < minAvailability) {
      minAvailability = possible;
      gatingComponent = {
        skuId: component.childSkuId,
        required: component.qty,
        available
      };
    }
  }

  if (!Number.isFinite(minAvailability)) {
    minAvailability = 0;
  }

  return {
    skuId: kit.id,
    available: Math.max(minAvailability, 0),
    gatedBy: gatingComponent
  };
};

export const explodeKitDemand = (
  kit: SKU,
  kitDemand: number
): { skuId: string; required: number }[] => {
  if (!kit.isKit || !kit.bom) return [];
  return kit.bom.map((component) => ({
    skuId: component.childSkuId,
    required: component.qty * kitDemand
  }));
};

export const detectKitExceptions = (
  kit: SKU,
  availability: KitAvailability
) => {
  if (!availability.gatedBy) return null;
  const shortfall = Math.max(
    availability.gatedBy.required - availability.gatedBy.available,
    0
  );
  return {
    bucket: 'KIT_BLOCKED' as const,
    message: `${kit.name} blocked by ${availability.gatedBy.skuId} short ${shortfall}`
  };
};
