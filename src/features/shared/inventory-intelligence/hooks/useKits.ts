import { useMemo } from 'react';
import { computeKitAvailability, detectKitExceptions, explodeKitDemand } from '../lib/kits';
import { Exception, SKU, StockSnapshot } from '../lib/types';

const DEMO_KITS: SKU[] = [
  {
    id: 'kit-001',
    sku: 'ACME-CHILL-BUNDLE',
    name: 'Acme Chill Bundle',
    isKit: true,
    bom: [
      { childSkuId: 'sku-001', qty: 1 },
      { childSkuId: 'sku-003', qty: 2 }
    ]
  }
];

const DEMO_COMPONENTS: SKU[] = [
  { id: 'sku-001', sku: 'ACME-COOLER', name: 'Acme Cooler 24qt' },
  { id: 'sku-003', sku: 'ACME-ICEPACK', name: 'Acme Reusable Ice Pack' }
];

const DEMO_SNAPSHOTS: StockSnapshot[] = [
  { skuId: 'sku-001', locationId: 'loc-nyc', onHand: 40, onOrder: 0, allocated: 10, safety: 18 },
  { skuId: 'sku-003', locationId: 'loc-nyc', onHand: 60, onOrder: 0, allocated: 40, safety: 30 },
  { skuId: 'kit-001', locationId: 'loc-nyc', onHand: 5, onOrder: 0, allocated: 0, safety: 5 }
];

export type UseKitsResult = {
  kits: SKU[];
  components: SKU[];
  availability: ReturnType<typeof computeKitAvailability>[];
  exceptions: Exception[];
  explode: (kit: SKU, demand: number) => ReturnType<typeof explodeKitDemand>;
  snapshots: StockSnapshot[];
};

export const useKits = (): UseKitsResult => {
  const availability = useMemo(
    () => DEMO_KITS.map((kit) => computeKitAvailability(kit, DEMO_SNAPSHOTS)),
    []
  );

  const exceptions = useMemo(() => {
    const items: Exception[] = [];
    availability.forEach((availabilityItem, index) => {
      const kit = DEMO_KITS[index];
      const exception = detectKitExceptions(kit, availabilityItem);
      if (exception) {
        items.push({
          id: `${kit.id}-kit`,
          skuId: kit.id,
          bucket: exception.bucket,
          severity: 'HIGH',
          message: exception.message,
          detectedAt: new Date().toISOString()
        });
      }
    });
    return items;
  }, [availability]);

  const explode = (kit: SKU, demand: number) => explodeKitDemand(kit, demand);

  return {
    kits: DEMO_KITS,
    components: DEMO_COMPONENTS,
    availability,
    exceptions,
    explode,
    snapshots: DEMO_SNAPSHOTS
  };
};
