import { useMemo } from 'react';
import { buildReorderLine, groupProposalsBySupplier, minMaxPolicy, periodicReviewPolicy } from '../lib/replenish';
import { Location, ReorderProposal, SKU, StockSnapshot } from '../lib/types';

const DEMO_SKUS: SKU[] = [
  {
    id: 'sku-001',
    sku: 'ACME-COOLER',
    name: 'Acme Cooler 24qt',
    supplierId: 'sup-001',
    cost: { currency: 'USD', value: 120 },
    holdingCostPctYr: 0.28,
    orderCost: { currency: 'USD', value: 55 },
    moq: 10,
    lotSize: 5
  },
  {
    id: 'sku-002',
    sku: 'ACME-GASKET',
    name: 'Acme Compressor Gasket',
    supplierId: 'sup-002',
    cost: { currency: 'USD', value: 18 },
    holdingCostPctYr: 0.22,
    orderCost: { currency: 'USD', value: 25 }
  }
];

const DEMO_SNAPSHOTS: StockSnapshot[] = [
  {
    skuId: 'sku-001',
    locationId: 'loc-nyc',
    onHand: 38,
    onOrder: 12,
    allocated: 14,
    safety: 40,
    min: 45,
    max: 140,
    reorderPoint: 60
  },
  {
    skuId: 'sku-002',
    locationId: 'loc-nyc',
    onHand: 12,
    onOrder: 0,
    allocated: 5,
    safety: 18,
    min: 20,
    max: 80,
    reorderPoint: 30
  }
];

const DEMO_LOCATIONS: Location[] = [
  { id: 'loc-nyc', name: 'NYC DC', priority: 1 },
  { id: 'loc-la', name: 'LA DC', priority: 2 }
];

export type UseReplenishmentResult = {
  proposals: ReorderProposal[];
  policies: ReturnType<typeof minMaxPolicy>;
  reviewPolicy: ReturnType<typeof periodicReviewPolicy>;
  snapshots: StockSnapshot[];
  skus: SKU[];
  locations: Location[];
};

export const useReplenishment = (): UseReplenishmentResult => {
  const lines = useMemo(
    () =>
      DEMO_SKUS.map((sku) => {
        const snapshot = DEMO_SNAPSHOTS.find((item) => item.skuId === sku.id)!;
        return (
          buildReorderLine({
            sku,
            snapshot,
            demandMean: 12,
            demandStdDev: 4,
            leadTimeDays: 18,
            serviceLevel: 0.95
          }) ?? {
            skuId: sku.id,
            qty: 0,
            reason: 'UNDER_ROP',
            method: 'MINMAX',
            calc: {}
          }
        );
      }).filter(Boolean) as ReorderProposal['lines'],
    []
  );

  const skuMap = useMemo(() => new Map(DEMO_SKUS.map((sku) => [sku.id, sku])), []);

  const proposals = useMemo(
    () =>
      ['sup-001', 'sup-002'].map((supplierId) =>
        groupProposalsBySupplier(
          lines.filter((line) => skuMap.get(line.skuId)?.supplierId === supplierId),
          supplierId,
          'loc-nyc'
        )
      ),
    [lines, skuMap]
  );

  const policies = minMaxPolicy(DEMO_SNAPSHOTS[0], 12, 4, 18);
  const reviewPolicy = periodicReviewPolicy(DEMO_SNAPSHOTS[0], 12, 4, 14, 18, 0.95);

  return {
    proposals,
    policies,
    reviewPolicy,
    snapshots: DEMO_SNAPSHOTS,
    skus: DEMO_SKUS,
    locations: DEMO_LOCATIONS
  };
};
