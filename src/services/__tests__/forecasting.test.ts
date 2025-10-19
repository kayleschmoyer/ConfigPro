import { describe, expect, it } from 'vitest';
import { BaselineDemandForecastingService, CompositeForecastingService } from '../forecasting';
import type { DemandSignal } from '../../modules/scheduling';

describe('forecasting services', () => {
  const signals: DemandSignal[] = [
    { date: '2024-04-01', interval: '08:00-12:00', expectedDemand: 4, location: 'Main' },
    { date: '2024-04-02', interval: '08:00-12:00', expectedDemand: 8, location: 'Main' },
    { date: '2024-04-03', interval: '08:00-12:00', expectedDemand: 6, location: 'Main' },
  ];

  it('smooths signals using a moving average', async () => {
    const service = new BaselineDemandForecastingService(2);
    const forecast = await service.generateForecast(signals);

    expect(forecast.signals).toHaveLength(signals.length);
    expect(forecast.signals[1].expectedDemand).toBeCloseTo((4 + 8) / 2, 2);
  });

  it('combines multiple forecasts through averaging', async () => {
    const composite = new CompositeForecastingService([
      new BaselineDemandForecastingService(1),
      new BaselineDemandForecastingService(3),
    ]);

    const forecast = await composite.generateForecast(signals);
    expect(forecast.signals[0].expectedDemand).toBeGreaterThan(0);
    expect(forecast.model).toBe('composite-ensemble');
  });
});
