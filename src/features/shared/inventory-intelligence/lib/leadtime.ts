import { LeadTimeStats } from './types';

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
};

const percentile = (values: number[], pct: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((pct / 100) * sorted.length) - 1);
  return sorted[Math.max(index, 0)];
};

export const calculateLeadTimeStats = (
  samples: number[],
  options?: { onTimeThreshold?: number }
): Pick<LeadTimeStats, 'medianDays' | 'p95Days' | 'onTimePct'> => {
  const medianDays = Math.round(median(samples));
  const p95Days = Math.round(percentile(samples, 95));
  const threshold = options?.onTimeThreshold ?? medianDays;
  const onTimeCount = samples.filter((sample) => sample <= threshold).length;
  const onTimePct = samples.length ? Math.round((onTimeCount / samples.length) * 100) : 0;
  return { medianDays, p95Days, onTimePct };
};

export const detectLeadTimeSpike = (
  samples: number[],
  baselineMedian: number,
  spikeThresholdPct = 0.35
) => {
  if (samples.length === 0) return false;
  const latest = samples[samples.length - 1];
  return latest > baselineMedian * (1 + spikeThresholdPct);
};

export const updateLeadTimeScore = (
  current: LeadTimeStats,
  samples: number[],
  weightings = { delivery: 0.5, cost: 0.2, quality: 0.2, communications: 0.1 }
) => {
  const stats = calculateLeadTimeStats(samples, { onTimeThreshold: current.p95Days });
  const deliveryScore = 100 - Math.min(stats.medianDays - current.medianDays, 30);
  const onTimeScore = stats.onTimePct;
  const composite =
    deliveryScore * weightings.delivery +
    onTimeScore * (weightings.quality + weightings.communications);
  return Math.round(Math.max(Math.min(composite, 100), 0));
};
