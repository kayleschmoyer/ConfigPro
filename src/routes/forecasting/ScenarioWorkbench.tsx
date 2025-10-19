import { useEffect, useMemo, useState } from 'react';
import { getForecastingApi } from '../../api';
import {
  createForecastingContext,
  generateForecastInsights,
  type ForecastInsights,
  type ForecastScenario,
  type ForecastingContext,
} from '../../modules/forecasting';
import { demoBaselineSignals, demoForecastingContext } from '../../data/demoForecastingData';

const buildOmniScenario = (): ForecastScenario => ({
  id: 'omni-expansion',
  name: 'Omni-channel expansion',
  createdAt: new Date().toISOString(),
  horizonDays: 7,
  baseSignals: demoBaselineSignals.map((signal) => ({
    ...signal,
    value:
      Math.round(
        signal.value *
          (signal.channel === 'digital'
            ? 1.2
            : signal.channel === 'delivery'
            ? 1.15
            : 1.05),
      ),
  })),
  assumptions: [
    {
      id: 'loyalty-boost',
      name: 'Loyalty relaunch',
      description: 'Rebuilt loyalty tiers with tiered rewards to push omnichannel baskets.',
      upliftPercentage: 9,
      confidence: 0.65,
      appliesToChannels: ['digital', 'delivery'],
    },
    {
      id: 'express-lane',
      name: 'Express collection rollout',
      description: 'Extended click-and-collect hours across key sites.',
      upliftPercentage: 6,
      confidence: 0.55,
      appliesToChannels: ['in-store'],
    },
  ],
  influences: [
    {
      id: 'sports-season',
      label: 'Sports season opener',
      type: 'event',
      impactPercentage: 15,
      confidence: 0.55,
      startDate: '2024-03-06',
      endDate: '2024-03-07',
      appliesToChannels: ['delivery', 'in-store'],
    },
  ],
  notes: 'Aggressive omnichannel uplift prepping for membership launch.',
});

const toPercent = (value: number | undefined) => `${Number.isFinite(value ?? NaN) ? (value ?? 0).toFixed(1) : '0.0'}%`;

export const ScenarioWorkbench = () => {
  const [context, setContext] = useState<ForecastingContext | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [status, setStatus] = useState('');
  const api = useMemo(() => getForecastingApi(), []);

  useEffect(() => {
    const bootstrap = async () => {
      const omniScenario = buildOmniScenario();
      const baselineContext = createForecastingContext(
        demoBaselineSignals,
        demoForecastingContext.model,
        [demoForecastingContext.scenarios[0], omniScenario],
      );
      const workspace = await api.bootstrap(baselineContext);
      setContext(workspace);
      const initialScenario = workspace.scenarios[0] ?? omniScenario;
      setSelectedScenarioId(initialScenario.id);
    };

    void bootstrap();
  }, [api]);

  const selectedScenario = useMemo(() =>
    context?.scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? null,
  [context, selectedScenarioId]);

  const insights: ForecastInsights | null = useMemo(() => {
    if (!context || !selectedScenario) {
      return null;
    }
    return generateForecastInsights(context, selectedScenario);
  }, [context, selectedScenario]);

  const tuneAssumptions = async () => {
    if (!selectedScenario) return;

    const tuned = selectedScenario.assumptions.map((assumption) => ({
      ...assumption,
      upliftPercentage: Math.round((assumption.upliftPercentage + 2) * 10) / 10,
      confidence: Math.min(1, assumption.confidence + 0.05),
    }));

    const updated = await api.updateAssumptions(selectedScenario.id, tuned);
    const scenarios = await api.listScenarios();
    const refreshedContext = createForecastingContext(
      demoBaselineSignals,
      demoForecastingContext.model,
      scenarios,
    );
    setContext(refreshedContext);
    setSelectedScenarioId(updated.id);
    setStatus('Assumptions tuned and synced across workstreams.');
    setTimeout(() => setStatus(''), 4000);
  };

  const appendSignals = async () => {
    if (!selectedScenario) return;

    const nextDayIndex = selectedScenario.baseSignals.length + 1;
    const signal = selectedScenario.baseSignals[0];
    if (!signal) return;

    const newSignal = {
      ...signal,
      timestamp: new Date(new Date(signal.timestamp).getTime() + nextDayIndex * 24 * 60 * 60 * 1000).toISOString(),
      value: Math.round(signal.value * 1.08),
    };

    await api.appendSignals(selectedScenario.id, [newSignal]);
    const scenarios = await api.listScenarios();
    const refreshedContext = createForecastingContext(
      demoBaselineSignals,
      demoForecastingContext.model,
      scenarios,
    );
    setContext(refreshedContext);
    setStatus('Live signal appended from streaming data feed.');
    setTimeout(() => setStatus(''), 4000);
  };

  if (!context || !selectedScenario || !insights) {
    return <div className="text-slate-500">Synchronising scenario workbench…</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Scenario orchestration</h2>
            <p className="text-sm text-slate-500">
              Align finance, marketing, and operations on scenario strategy before pushing automation downstream.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {context.scenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setSelectedScenarioId(scenario.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedScenarioId === scenario.id
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-200 hover:text-emerald-600'
                }`}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>
        {status && (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status}
          </div>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projected volume</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{insights.projectedTotal.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">Aggregated demand across the scenario window.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uplift vs. baseline</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">{toPercent(insights.upliftPercentage)}</p>
            <p className="mt-1 text-xs text-slate-500">Monitor growth goals in real time.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confidence blend</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{toPercent(insights.confidenceScore)}</p>
            <p className="mt-1 text-xs text-slate-500">Model accuracy plus operator certainty.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Variance</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{insights.variance.toFixed(2)}</p>
            <p className="mt-1 text-xs text-slate-500">Helps shape staffing buffers and supply orders.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Scenario brief</h3>
          <p className="text-sm text-slate-500">{selectedScenario.notes}</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-900">Assumptions</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {selectedScenario.assumptions.map((assumption) => (
                  <li key={assumption.id}>
                    <span className="font-medium text-slate-900">{assumption.name}</span> – {assumption.description}
                    <span className="ml-2 text-xs text-slate-500">
                      Uplift {toPercent(assumption.upliftPercentage)} • Confidence {toPercent(assumption.confidence * 100)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-900">Influences</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {selectedScenario.influences.map((influence) => (
                  <li key={influence.id}>
                    <span className="font-medium text-slate-900">{influence.label}</span> – {influence.type}
                    <span className="ml-2 text-xs text-slate-500">
                      Impact {toPercent(influence.impactPercentage)} • Confidence {toPercent(influence.confidence * 100)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Automation hand-off</h3>
            <p className="text-sm text-slate-500">
              Trigger labour, inventory, and marketing workflows the moment scenarios hit your target threshold.
            </p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={tuneAssumptions}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
              >
                Tune assumptions +2% uplift
              </button>
              <button
                type="button"
                onClick={appendSignals}
                className="w-full rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
              >
                Append live signal
              </button>
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Channel outlook</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {insights.channelMix.map((channel) => (
                <li key={channel.channel} className="flex items-center justify-between">
                  <span className="capitalize text-slate-900">{channel.channel}</span>
                  <span className="text-slate-500">{channel.share.toFixed(1)}% share</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
