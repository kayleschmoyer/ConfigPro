import { describe, expect, it } from 'vitest';
import {
  compareScenarioToBaseline,
  createForecastingContext,
  evaluateBackcast,
  generateForecastInsights,
  type ForecastScenario,
} from '..';
import {
  demoBaselineSignals,
  demoForecastingScenario,
  demoModelSummary,
} from '../../../data/demoForecastingData';

const buildContext = () =>
  createForecastingContext(demoBaselineSignals, demoModelSummary, [demoForecastingScenario]);

describe('forecasting module', () => {
  it('generates uplift and channel mix insights', () => {
    const context = buildContext();
    const insights = generateForecastInsights(context, demoForecastingScenario);

    expect(insights.projectedTotal).toBeGreaterThan(insights.baselineTotal);
    expect(insights.channelMix).not.toHaveLength(0);
    expect(insights.confidenceScore).toBeGreaterThan(0);
  });

  it('compares scenarios against the baseline', () => {
    const context = buildContext();
    const comparison = compareScenarioToBaseline(context, demoForecastingScenario);

    expect(comparison.scenarioId).toBe(demoForecastingScenario.id);
    expect(comparison.upliftPercentage).toBeTypeOf('number');
  });

  it('evaluates backcast performance', () => {
    const summary = evaluateBackcast([
      { timestamp: '2024-01-01T00:00:00.000Z', actual: 100, forecasted: 105 },
      { timestamp: '2024-01-02T00:00:00.000Z', actual: 110, forecasted: 108 },
      { timestamp: '2024-01-03T00:00:00.000Z', actual: 95, forecasted: 100 },
    ]);

    expect(summary.mape).toBeGreaterThan(0);
    expect(summary.volatility).toBeGreaterThanOrEqual(0);
  });

  it('handles empty scenario arrays gracefully', () => {
    const emptyScenario: ForecastScenario = {
      ...demoForecastingScenario,
      baseSignals: [],
      assumptions: [],
      influences: [],
    };
    const context = createForecastingContext(demoBaselineSignals, demoModelSummary, [emptyScenario]);
    const insights = generateForecastInsights(context, emptyScenario);

    expect(insights.projectedTotal).toBe(0);
    expect(insights.upliftPercentage).toBe(0);
  });
});
