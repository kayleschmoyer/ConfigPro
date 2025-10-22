import { DemandPoint, DemandSeries } from './types';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const trimOutliers = (points: DemandPoint[], z = 3): DemandPoint[] => {
  if (points.length === 0) return points;
  const values = points.map((p) => p.qty);
  const mean = values.reduce((acc, v) => acc + v, 0) / values.length;
  const variance =
    values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / Math.max(values.length - 1, 1);
  const sd = Math.sqrt(variance);

  return points.map((point) => {
    if (point.tag === 'PROMO') return point;
    if (sd === 0) return point;
    const zScore = (point.qty - mean) / sd;
    if (Math.abs(zScore) <= z) return point;
    return { ...point, qty: clamp(mean + Math.sign(zScore) * z * sd, 0, Number.MAX_SAFE_INTEGER) };
  });
};

export const applyPromoUplift = (points: DemandPoint[], upliftPct = 0.2): DemandPoint[] =>
  points.map((point) =>
    point.tag === 'PROMO'
      ? { ...point, qty: Math.round(point.qty * (1 + upliftPct)) }
      : point
  );

export const simpleMovingAverage = (values: number[], window = 3): number[] => {
  if (window <= 0) throw new Error('Window must be greater than 0');
  return values.map((_, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = values.slice(start, index + 1);
    return slice.reduce((acc, v) => acc + v, 0) / slice.length;
  });
};

export const singleExponentialSmoothing = (
  values: number[],
  alpha = 0.3
): number[] => {
  if (values.length === 0) return [];
  const smoothed: number[] = [values[0]];
  for (let i = 1; i < values.length; i += 1) {
    smoothed[i] = alpha * values[i] + (1 - alpha) * smoothed[i - 1];
  }
  return smoothed;
};

export const holtTrendSmoothing = (
  values: number[],
  alpha = 0.3,
  beta = 0.1
): { level: number[]; trend: number[]; forecast: number[] } => {
  if (values.length === 0) {
    return { level: [], trend: [], forecast: [] };
  }

  const level: number[] = [values[0]];
  const trend: number[] = [values.length > 1 ? values[1] - values[0] : 0];
  const forecast: number[] = [values[0]];

  for (let i = 1; i < values.length; i += 1) {
    const lastLevel = level[i - 1];
    const lastTrend = trend[i - 1];
    const currentLevel = alpha * values[i] + (1 - alpha) * (lastLevel + lastTrend);
    const currentTrend = beta * (currentLevel - lastLevel) + (1 - beta) * lastTrend;
    level[i] = currentLevel;
    trend[i] = currentTrend;
    forecast[i] = currentLevel + currentTrend;
  }

  return { level, trend, forecast };
};

export const seasonalNaive = (values: number[], seasonLength: number): number[] => {
  if (seasonLength <= 0) throw new Error('Season length must be positive');
  return values.map((_, index) => (index >= seasonLength ? values[index - seasonLength] : values[index]));
};

const demandIntervals = (points: DemandPoint[]): number[] => {
  const intervals: number[] = [];
  let lastIndex = -1;
  points.forEach((point, index) => {
    if (point.qty > 0) {
      intervals.push(lastIndex < 0 ? index + 1 : index - lastIndex);
      lastIndex = index;
    }
  });
  return intervals;
};

export const croston = (
  values: number[],
  alpha = 0.3
): { demand: number[]; interval: number[]; forecast: number[] } => {
  if (values.length === 0) {
    return { demand: [], interval: [], forecast: [] };
  }

  const demand: number[] = [];
  const interval: number[] = [];
  const forecast: number[] = [];
  let lastDemand = values.find((v) => v > 0) ?? 0;
  let lastInterval = demandIntervals(values.map((qty, index) => ({ at: `${index}`, qty })))[0] ?? 1;

  for (let i = 0; i < values.length; i += 1) {
    const qty = values[i];
    if (qty > 0) {
      lastDemand = alpha * qty + (1 - alpha) * lastDemand;
      lastInterval = alpha * 1 + (1 - alpha) * lastInterval;
    } else {
      lastInterval = (1 - alpha) * (lastInterval + 1);
    }
    demand[i] = lastDemand;
    interval[i] = lastInterval;
    forecast[i] = lastInterval === 0 ? 0 : lastDemand / lastInterval;
  }

  return { demand, interval, forecast };
};

export const tsb = (
  values: number[],
  alpha = 0.3,
  beta = 0.1
): { demand: number[]; probability: number[]; forecast: number[] } => {
  if (values.length === 0) {
    return { demand: [], probability: [], forecast: [] };
  }

  const demand: number[] = [];
  const probability: number[] = [];
  const forecast: number[] = [];
  let lastDemand = values.find((v) => v > 0) ?? 0;
  let lastProbability = values.filter((v) => v > 0).length / values.length;

  for (let i = 0; i < values.length; i += 1) {
    const demandOccurred = values[i] > 0 ? 1 : 0;
    lastProbability = beta * demandOccurred + (1 - beta) * lastProbability;
    if (demandOccurred) {
      lastDemand = alpha * values[i] + (1 - alpha) * lastDemand;
    }
    demand[i] = lastDemand;
    probability[i] = lastProbability;
    forecast[i] = lastDemand * lastProbability;
  }

  return { demand, probability, forecast };
};

export const extractDemandValues = (series: DemandSeries): number[] =>
  series.points.map((point) => point.qty);

export const normalizeDemandSeries = (series: DemandSeries): DemandSeries => {
  const trimmed = trimOutliers(series.points);
  const uplifted = applyPromoUplift(trimmed);
  return { ...series, points: uplifted };
};
