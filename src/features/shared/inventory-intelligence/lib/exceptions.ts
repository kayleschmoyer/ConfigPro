import type { Exception, ExceptionBucket, Forecast, LeadTimeStats, StockSnapshot } from './index';

const severityFromDelta = (delta: number): Exception['severity'] => {
  if (delta > 0.4) return 'HIGH';
  if (delta > 0.2) return 'MEDIUM';
  return 'LOW';
};

export const detectInventoryExceptions = (
  snapshot: StockSnapshot
): Exception[] => {
  const projected = snapshot.onHand + snapshot.onOrder - snapshot.allocated;
  const exceptions: Exception[] = [];
  if (projected < snapshot.safety) {
    exceptions.push({
      id: `${snapshot.skuId}-${snapshot.locationId}-safety`,
      skuId: snapshot.skuId,
      locationId: snapshot.locationId,
      bucket: 'BELOW_SAFETY',
      severity: severityFromDelta((snapshot.safety - projected) / Math.max(snapshot.safety, 1)),
      message: 'Projected coverage below safety stock.',
      detectedAt: new Date().toISOString(),
      actions: [
        { label: 'Raise Safety', action: 'adjust_safety' },
        { label: 'Plan Reorder', action: 'open_replenishment' }
      ]
    });
  }

  if (snapshot.reorderPoint && projected < snapshot.reorderPoint) {
    exceptions.push({
      id: `${snapshot.skuId}-${snapshot.locationId}-rop`,
      skuId: snapshot.skuId,
      locationId: snapshot.locationId,
      bucket: 'UNDER_ROP',
      severity: 'MEDIUM',
      message: 'Inventory under reorder point.',
      detectedAt: new Date().toISOString(),
      actions: [{ label: 'Create Proposal', action: 'open_replenishment' }]
    });
  }

  return exceptions;
};

export const detectForecastExceptions = (
  forecast: Forecast,
  threshold = 25
): Exception | null => {
  const error = forecast.error?.wape ?? forecast.error?.mape;
  if (!error || error < threshold) return null;
  return {
    id: `${forecast.skuId}-${forecast.locationId}-forecast`,
    skuId: forecast.skuId,
    locationId: forecast.locationId,
    bucket: 'FORECAST_ERROR_HIGH',
    severity: error > 40 ? 'HIGH' : 'MEDIUM',
    message: `Forecast error ${error.toFixed(1)}% exceeds threshold`,
    detectedAt: new Date().toISOString(),
    actions: [{ label: 'Change Method', action: 'switch_method' }]
  };
};

export const detectLeadTimeExceptions = (
  stats: LeadTimeStats,
  latestSamples: number[],
  spikeThresholdPct = 0.25
): Exception | null => {
  if (latestSamples.length === 0) return null;
  const latest = latestSamples[latestSamples.length - 1];
  const delta = latest / stats.medianDays - 1;
  if (delta < spikeThresholdPct) return null;
  return {
    id: `${stats.supplierId}-${stats.skuId ?? 'all'}-leadtime`,
    supplierId: stats.supplierId,
    skuId: stats.skuId,
    locationId: stats.locationId,
    bucket: 'LEAD_TIME_SPIKE',
    severity: severityFromDelta(delta),
    message: `Lead time spiked to ${latest} days (median ${stats.medianDays})`,
    detectedAt: new Date().toISOString(),
    actions: [
      { label: 'Alert Supplier', action: 'notify_supplier' },
      { label: 'Adjust Lead Time', action: 'adjust_leadtime' }
    ]
  };
};

export const bucketOrder: ExceptionBucket[] = [
  'BELOW_SAFETY',
  'UNDER_ROP',
  'STOCKOUT_RISK',
  'SUPPLIER_DELAY',
  'INTERMITTENT_DEMAND',
  'FORECAST_ERROR_HIGH',
  'KIT_BLOCKED',
  'LEAD_TIME_SPIKE'
];

export const sortExceptions = (exceptions: Exception[]): Exception[] => {
  const severityRank: Record<Exception['severity'], number> = { LOW: 2, MEDIUM: 1, HIGH: 0 };
  return [...exceptions].sort((a, b) => {
    const bucketDiff = bucketOrder.indexOf(a.bucket) - bucketOrder.indexOf(b.bucket);
    if (bucketDiff !== 0) return bucketDiff;
    const severityDiff = severityRank[a.severity] - severityRank[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });
};
