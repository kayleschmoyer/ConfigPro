import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ForecastChart } from '../components/ForecastChart';
import { SkuTable } from '../components/SkuTable';
import { useForecasts } from '../hooks/useForecasts';

export const Forecasts = () => {
  const { forecasts, demandSeries, compare, methods, skus } = useForecasts();
  const [selectedSkuId, setSelectedSkuId] = useState(forecasts[0]?.skuId ?? '');
  const selectedForecast = forecasts.find((forecast) => forecast.skuId === selectedSkuId) ?? forecasts[0];
  const selectedSeries = demandSeries.find(
    (series) => series.skuId === selectedForecast?.skuId && series.locationId === selectedForecast.locationId
  );

  const comparison = useMemo(() => (selectedSeries ? compare(selectedSeries, methods) : []), [selectedSeries, compare, methods]);

  const tableRows = useMemo(
    () =>
      forecasts.map((forecast) => {
        const sku = skus.find((item) => item.id === forecast.skuId);
        return {
          id: `${forecast.skuId}-${forecast.locationId}`,
          sku: sku?.sku ?? forecast.skuId,
          name: sku?.name ?? '—',
          location: forecast.locationId,
          onHand: Math.round(Math.random() * 120),
          onOrder: Math.round(Math.random() * 40),
          safety: Math.round(Math.random() * 60),
          reorderPoint: Math.round(Math.random() * 90),
          status: ['UNDER ROP']
        };
      }),
    [forecasts, skus]
  );

  return (
    <section className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <h2 className="text-2xl font-semibold text-foreground">Forecasts</h2>
        <p className="text-sm text-muted">
          Multi-method demand intelligence with auto-selection and error visibility. Choose a SKU to inspect its demand, forecast, and error metrics.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {forecasts.map((forecast) => (
            <Button
              key={forecast.skuId}
              size="sm"
              variant={forecast.skuId === selectedForecast?.skuId ? 'primary' : 'ghost'}
              onClick={() => setSelectedSkuId(forecast.skuId)}
            >
              {forecast.skuId}
            </Button>
          ))}
        </div>
      </motion.header>

      <motion.div className="grid gap-6 lg:grid-cols-[2fr,1fr]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {selectedForecast && selectedSeries && (
          <ForecastChart demand={selectedSeries} forecast={selectedForecast} />
        )}
        <Card className="bg-surface/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Method Comparison</p>
          <div className="mt-4 space-y-3">
            {comparison.map((item) => (
              <div key={item.method} className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/40 px-4 py-3 text-sm text-muted">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.method}</p>
                  <p className="text-xs text-muted">MAPE {item.error.mape?.toFixed(1) ?? '—'}%</p>
                </div>
                <span className="text-primary">WAPE {item.error.wape?.toFixed(1) ?? '—'}%</span>
              </div>
            ))}
          </div>
          <Button size="sm" className="mt-6 w-full">
            Pick Best ({comparison.sort((a, b) => (a.error.wape ?? 100) - (b.error.wape ?? 100))[0]?.method ?? '—'})
          </Button>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-surface/90 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Tracked SKUs</p>
            <SkuTable rows={tableRows} height={360} />
          </Card>
        </TabsContent>
        <TabsContent value="history" className="rounded-3xl border border-border/60 bg-surface/80 p-6 text-sm text-muted">
          Historical demand snapshots synced nightly. Bring your own data source via API or CSV import.
        </TabsContent>
        <TabsContent value="errors" className="rounded-3xl border border-border/60 bg-surface/80 p-6 text-sm text-muted">
          MAPE, WAPE and SMAPE tracked by SKU/location with alerts above thresholds. Confidence bands derived from last 90 days of error.
        </TabsContent>
      </Tabs>
    </section>
  );
};
