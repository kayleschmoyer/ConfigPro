import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { baseTheme } from '@/app/config/theme';
import { cn } from '@/lib/cn';
import { formatDate } from '../lib/format';
import { DemandSeries, Forecast } from '../lib/types';

export type ForecastChartProps = {
  demand: DemandSeries;
  forecast: Forecast;
  className?: string;
};

const toPoints = (
  values: number[],
  offset: number,
  total: number,
  width: number,
  height: number,
  min: number,
  max: number
) => {
  if (values.length === 0) return '';
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = ((offset + index) / Math.max(total - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
};

export const ForecastChart = ({ demand, forecast, className }: ForecastChartProps) => {
  const actualValues = demand.points.map((point) => point.qty);
  const forecastValues = forecast.values.map((value) => value.mean);
  const lowBand = forecast.values.map((value) => value.low ?? value.mean);
  const highBand = forecast.values.map((value) => value.high ?? value.mean);

  const chartWidth = 640;
  const chartHeight = 240;

  const totals = actualValues.length + Math.max(forecastValues.length - 1, 0);
  const combined = [...actualValues, ...forecastValues];
  const min = Math.min(...combined, ...lowBand, 0);
  const max = Math.max(...combined, ...highBand, 1);

  const actualPoints = useMemo(
    () => toPoints(actualValues, 0, totals, chartWidth, chartHeight, min, max),
    [actualValues, totals, chartWidth, chartHeight, min, max]
  );

  const forecastPoints = useMemo(
    () =>
      toPoints(
        forecastValues,
        Math.max(actualValues.length - 1, 0),
        totals,
        chartWidth,
        chartHeight,
        min,
        max
      ),
    [forecastValues, actualValues.length, totals, chartWidth, chartHeight, min, max]
  );

  const bandPath = useMemo(() => {
    if (forecastValues.length === 0) return '';
    const start = Math.max(actualValues.length - 1, 0);
    const lowPoints = toPoints(lowBand, start, totals, chartWidth, chartHeight, min, max).split(' ');
    const highPoints = toPoints(highBand, start, totals, chartWidth, chartHeight, min, max).split(' ');
    return [...lowPoints, ...highPoints.reverse()].join(' ');
  }, [actualValues.length, forecastValues.length, lowBand, highBand, totals, chartWidth, chartHeight, min, max]);

  return (
    <div className={cn('rounded-3xl bg-surface/80 p-6 shadow-lg shadow-primary/5 backdrop-blur', className)}>
      <div className="flex items-center justify-between pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Forecast Method</p>
          <h3 className="text-xl font-semibold text-foreground">{forecast.method}</h3>
        </div>
        {forecast.error?.wape != null && (
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">WAPE</p>
            <p className="text-xl font-semibold text-primary">{forecast.error.wape.toFixed(1)}%</p>
          </div>
        )}
      </div>
      <div className="relative">
        <svg width={chartWidth} height={chartHeight} role="img" aria-label="Demand and forecast chart" className="w-full">
          <defs>
            <linearGradient id="forecastBand" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={baseTheme.primary} stopOpacity={0.2} />
              <stop offset="100%" stopColor={baseTheme.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          {bandPath && (
            <polygon points={bandPath} fill="url(#forecastBand)" aria-hidden="true" />
          )}
          <polyline
            points={actualPoints}
            fill="none"
            stroke={baseTheme.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <polyline
            points={forecastPoints}
            fill="none"
            stroke={baseTheme.primary}
            strokeWidth={2.5}
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        </svg>
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between text-xs text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
        >
          <span>{formatDate(demand.points[0]?.at)}</span>
          <span>{formatDate(forecast.values.at(-1)?.at ?? new Date().toISOString())}</span>
        </motion.div>
      </div>
    </div>
  );
};
