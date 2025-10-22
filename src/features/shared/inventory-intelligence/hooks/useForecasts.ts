import { useMemo, useState } from 'react';
import type { DemandSeries, Forecast, ForecastMethod, SKU } from '../lib';
import { createForecastSummary, evaluateForecasts } from '../lib/forecast';
import { normalizeDemandSeries } from '../lib/demand';

const DEMO_DEMAND: DemandSeries[] = [
  {
    skuId: 'sku-001',
    locationId: 'loc-nyc',
    points: Array.from({ length: 26 }).map((_, index) => ({
      at: new Date(Date.now() - (26 - index) * 86400000).toISOString(),
      qty: Math.max(0, Math.round(30 + Math.sin(index / 3) * 8 + (index % 7 === 0 ? 20 : 0))),
      tag: index % 14 === 0 ? 'PROMO' : undefined
    }))
  },
  {
    skuId: 'sku-002',
    locationId: 'loc-nyc',
    points: Array.from({ length: 26 }).map((_, index) => ({
      at: new Date(Date.now() - (26 - index) * 86400000).toISOString(),
      qty: index % 5 === 0 ? Math.round(60 + Math.random() * 10) : 0
    }))
  }
];

const DEMO_SKUS: SKU[] = [
  { id: 'sku-001', sku: 'ACME-COOLER', name: 'Acme Cooler 24qt', category: 'Outdoor' },
  { id: 'sku-002', sku: 'ACME-GASKET', name: 'Acme Compressor Gasket', category: 'Service' }
];

export type UseForecastsResult = {
  forecasts: Forecast[];
  methods: ForecastMethod[];
  compare: (series: DemandSeries, methods?: ForecastMethod[]) => ReturnType<typeof evaluateForecasts>;
  refresh: () => void;
  demandSeries: DemandSeries[];
  skus: SKU[];
};

export const useForecasts = (): UseForecastsResult => {
  const [refreshIndex, setRefreshIndex] = useState(0);

  const demandSeries = useMemo(() => {
    void refreshIndex;
    return DEMO_DEMAND.map((series) => normalizeDemandSeries(series));
  }, [refreshIndex]);

  const forecasts = useMemo(
    () => demandSeries.map((series) => createForecastSummary(series)),
    [demandSeries]
  );

  const methods: ForecastMethod[] = ['SMA', 'SES', 'HOLT', 'SEASONAL', 'CROSTON', 'TSB'];

  const compare = (series: DemandSeries, selectedMethods = methods) =>
    evaluateForecasts(series, selectedMethods);

  const refresh = () => setRefreshIndex((index) => index + 1);

  return {
    forecasts,
    methods,
    compare,
    refresh,
    demandSeries,
    skus: DEMO_SKUS
  };
};
