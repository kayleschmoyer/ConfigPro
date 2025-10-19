import { describe, expect, it, beforeEach } from 'vitest';
import { getForecastingApi, resetForecastingApi } from '../forecasting';
import { createForecastingContext } from '../../modules/forecasting';
import { demoBaselineSignals, demoForecastingScenario, demoModelSummary } from '../../data/demoForecastingData';

describe('Forecasting API', () => {
  beforeEach(() => {
    resetForecastingApi();
  });

  it('bootstraps and lists scenarios', async () => {
    const api = getForecastingApi();
    const context = await api.bootstrap(
      createForecastingContext(demoBaselineSignals, demoModelSummary, [demoForecastingScenario]),
    );

    expect(context.scenarios).toHaveLength(1);
    expect((await api.listScenarios()).length).toBe(1);
  });

  it('updates assumptions and appends signals', async () => {
    const api = getForecastingApi();
    await api.bootstrap(createForecastingContext(demoBaselineSignals, demoModelSummary, [demoForecastingScenario]));

    const updated = await api.updateAssumptions(demoForecastingScenario.id, [
      { ...demoForecastingScenario.assumptions[0], upliftPercentage: 15 },
    ]);

    expect(updated.assumptions[0]?.upliftPercentage).toBe(15);

    const appended = await api.appendSignals(demoForecastingScenario.id, [demoForecastingScenario.baseSignals[0]]);
    expect(appended.baseSignals.length).toBeGreaterThan(demoForecastingScenario.baseSignals.length);
  });

  it('archives scenarios', async () => {
    const api = getForecastingApi();
    await api.bootstrap(createForecastingContext(demoBaselineSignals, demoModelSummary, [demoForecastingScenario]));

    await api.archiveScenario(demoForecastingScenario.id);
    await expect(api.getScenario(demoForecastingScenario.id)).rejects.toThrowError();
  });
});
