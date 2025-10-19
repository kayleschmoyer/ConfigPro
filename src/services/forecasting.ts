import type { DemandForecast, DemandSignal } from '../modules/scheduling';

export interface DemandForecastingService {
  readonly name: string;
  generateForecast(signals: DemandSignal[], options?: Record<string, unknown>): Promise<DemandForecast>;
}

export type ForecastingListener = (forecast: DemandForecast) => void;

export class BaselineDemandForecastingService implements DemandForecastingService {
  public readonly name = 'baseline-moving-average';
  private readonly windowSize: number;
  private readonly listeners: ForecastingListener[];

  constructor(windowSize = 3, listeners: ForecastingListener[] = []) {
    this.windowSize = windowSize;
    this.listeners = listeners;
  }

  async generateForecast(signals: DemandSignal[]): Promise<DemandForecast> {
    const sortedSignals = [...signals].sort((a, b) => a.date.localeCompare(b.date));
    const smoothedSignals = sortedSignals.map((signal, index, arr) => {
      const start = Math.max(0, index - (this.windowSize - 1));
      const window = arr.slice(start, index + 1);
      const average = window.reduce((acc, value) => acc + value.expectedDemand, 0) / window.length;

      return {
        ...signal,
        expectedDemand: Number(average.toFixed(2)),
      };
    });

    const forecast: DemandForecast = {
      generatedAt: new Date().toISOString(),
      signals: smoothedSignals,
      model: this.name,
      version: '1.0.0',
    };

    this.listeners.forEach((listener) => listener(forecast));

    return forecast;
  }
}

export class CompositeForecastingService implements DemandForecastingService {
  public readonly name = 'composite-ensemble';
  private readonly services: DemandForecastingService[];

  constructor(services: DemandForecastingService[]) {
    this.services = services;
  }

  async generateForecast(signals: DemandSignal[], options?: Record<string, unknown>): Promise<DemandForecast> {
    const forecasts = await Promise.all(this.services.map((service) => service.generateForecast(signals, options)));
    const combinedSignals = signals.map((signal) => {
      const values = forecasts.map((forecast) =>
        forecast.signals.find((entry) => entry.date === signal.date && entry.interval === signal.interval)?.expectedDemand ??
        signal.expectedDemand,
      );

      const average = values.reduce((acc, value) => acc + value, 0) / values.length;

      return {
        ...signal,
        expectedDemand: Number(average.toFixed(2)),
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      signals: combinedSignals,
      model: this.name,
      version: '1.0.0',
    };
  }
}
