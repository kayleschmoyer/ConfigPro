import type { DemandSeries, Forecast, ForecastMethod } from './index';
import {
  croston,
  extractDemandValues,
  holtTrendSmoothing,
  normalizeDemandSeries,
  seasonalNaive,
  simpleMovingAverage,
  singleExponentialSmoothing,
  tsb
} from './demand';

export type ForecastEvaluation = {
  method: ForecastMethod;
  error: { mape?: number; wape?: number; smape?: number };
  series: number[];
};

const safeDivide = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : numerator / denominator;

export const computeMape = (actual: number[], forecast: number[]): number => {
  const errors = actual.map((value, index) => {
    if (value === 0) return 0;
    return Math.abs((value - (forecast[index] ?? 0)) / value);
  });
  return (errors.reduce((acc, value) => acc + value, 0) / errors.length) * 100;
};

export const computeWape = (actual: number[], forecast: number[]): number => {
  const numerator = actual.reduce(
    (acc, value, index) => acc + Math.abs(value - (forecast[index] ?? 0)),
    0
  );
  const denominator = actual.reduce((acc, value) => acc + Math.abs(value), 0);
  return safeDivide(numerator, denominator) * 100;
};

export const computeSmape = (actual: number[], forecast: number[]): number => {
  const numerator = actual.reduce((acc, value, index) => {
    const forecastValue = forecast[index] ?? 0;
    const denom = Math.abs(value) + Math.abs(forecastValue);
    if (denom === 0) return acc;
    return acc + Math.abs(value - forecastValue) / denom;
  }, 0);
  return safeDivide(numerator, actual.length) * 100 * 2;
};

export const buildConfidenceBand = (
  forecast: number[],
  errorPct: number
): { low: number[]; high: number[] } => {
  const factor = errorPct / 100;
  return {
    low: forecast.map((value) => Math.max(value * (1 - factor), 0)),
    high: forecast.map((value) => value * (1 + factor))
  };
};

const methodGenerators: Record<ForecastMethod, (values: number[]) => number[]> = {
  SMA: (values) => simpleMovingAverage(values, 3),
  SES: (values) => singleExponentialSmoothing(values, 0.35),
  HOLT: (values) => holtTrendSmoothing(values, 0.35, 0.2).forecast,
  SEASONAL: (values) => seasonalNaive(values, Math.min(values.length, 7)),
  CROSTON: (values) => croston(values).forecast,
  TSB: (values) => tsb(values).forecast
};

export const evaluateForecasts = (
  demand: DemandSeries,
  methods: ForecastMethod[] = ['SMA', 'SES', 'HOLT', 'SEASONAL', 'CROSTON', 'TSB']
): ForecastEvaluation[] => {
  const normalized = normalizeDemandSeries(demand);
  const values = extractDemandValues(normalized);
  const actual = values.slice(1);
  return methods.map((method) => {
    const generator = methodGenerators[method];
    const series = generator(values);
    const forecast = series.slice(0, actual.length);
    const error = {
      mape: computeMape(actual, forecast),
      wape: computeWape(actual, forecast),
      smape: computeSmape(actual, forecast)
    };
    return { method, error, series };
  });
};

export const pickBestForecast = (evaluations: ForecastEvaluation[]): ForecastEvaluation | null => {
  if (evaluations.length === 0) return null;
  return evaluations.reduce((best, current) => {
    if (!best) return current;
    const bestScore = best.error.wape ?? best.error.mape ?? best.error.smape ?? Number.POSITIVE_INFINITY;
    const currentScore =
      current.error.wape ?? current.error.mape ?? current.error.smape ?? Number.POSITIVE_INFINITY;
    return currentScore < bestScore ? current : best;
  });
};

export const buildForecast = (
  demand: DemandSeries,
  method: ForecastMethod,
  horizon = 14
): Forecast => {
  const normalized = normalizeDemandSeries(demand);
  const values = extractDemandValues(normalized);
  const generator = methodGenerators[method];
  const series = generator(values);
  const history = series[series.length - 1] ?? 0;
  const projection = Array(horizon).fill(history);
  const band = buildConfidenceBand(projection, 20);

  return {
    skuId: demand.skuId,
    locationId: demand.locationId,
    method,
    horizonDays: horizon,
    period: 'DAY',
    values: projection.map((mean, index) => ({
      at: new Date(Date.now() + (index + 1) * 86400000).toISOString(),
      mean,
      low: band.low[index],
      high: band.high[index]
    }))
  };
};

export const createForecastSummary = (demand: DemandSeries): Forecast => {
  const evaluations = evaluateForecasts(demand);
  const best = pickBestForecast(evaluations) ?? evaluations[0];
  const forecast = buildForecast(demand, best.method);
  return {
    ...forecast,
    error: best?.error
  };
};
