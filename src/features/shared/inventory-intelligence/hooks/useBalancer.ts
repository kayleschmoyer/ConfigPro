import { useMemo } from 'react';
import { optimizeTransfers } from '../lib/balancer';
import type { Location, StockSnapshot, TransferPlan } from '../lib';

const DEMO_SNAPSHOTS: StockSnapshot[] = [
  { skuId: 'sku-001', locationId: 'loc-nyc', onHand: 120, onOrder: 10, allocated: 40, safety: 60 },
  { skuId: 'sku-001', locationId: 'loc-la', onHand: 30, onOrder: 0, allocated: 15, safety: 50 },
  { skuId: 'sku-002', locationId: 'loc-nyc', onHand: 70, onOrder: 0, allocated: 20, safety: 30 },
  { skuId: 'sku-002', locationId: 'loc-la', onHand: 140, onOrder: 0, allocated: 10, safety: 60 }
];

const DEMO_LOCATIONS: Location[] = [
  { id: 'loc-nyc', name: 'NYC DC', priority: 1 },
  { id: 'loc-la', name: 'LA DC', priority: 2 }
];

export type UseBalancerResult = {
  snapshots: StockSnapshot[];
  locations: Location[];
  plans: TransferPlan[];
};

export const useBalancer = (): UseBalancerResult => {
  const plans = useMemo(
    () => optimizeTransfers(DEMO_SNAPSHOTS, DEMO_LOCATIONS, { minDisplayQty: 20, transferCost: 45 }),
    []
  );

  return {
    snapshots: DEMO_SNAPSHOTS,
    locations: DEMO_LOCATIONS,
    plans
  };
};
