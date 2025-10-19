import { useEffect, useMemo, useState } from 'react';
import { getForecastingApi, type ProjectionAuditEntry } from '../../api';
import {
  compareScenarioToBaseline,
  createForecastingContext,
  evaluateBackcast,
  generateForecastInsights,
  type ForecastInsights,
  type ForecastScenario,
  type ForecastingContext,
  type ScenarioComparison,
} from '../../modules/forecasting';
import {
  demoBaselineSignals,
  demoForecastingContext,
  demoForecastingScenario,
  demoScenarioAssumptions,
  demoScenarioInfluences,
} from '../../data/demoForecastingData';

const backcastObservations = [
  { timestamp: '2024-02-22T00:00:00.000Z', actual: 980, forecasted: 940 },
  { timestamp: '2024-02-23T00:00:00.000Z', actual: 1010, forecasted: 995 },
  { timestamp: '2024-02-24T00:00:00.000Z', actual: 1120, forecasted: 1095 },
  { timestamp: '2024-02-25T00:00:00.000Z', actual: 1185, forecasted: 1205 },
  { timestamp: '2024-02-26T00:00:00.000Z', actual: 980, forecasted: 960 },
];

const formatPercent = (value: number | undefined) =>
  `${Number.isFinite(value ?? NaN) ? (value ?? 0).toFixed(1) : '0.0'}%`;

const formatNumber = (value: number | undefined) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value ?? 0);

const formatVariance = (value: number | undefined) =>
  `${Number.isFinite(value ?? NaN) ? (value ?? 0).toFixed(2) : '0.00'}`;

export const DemandStudio = () => {
  const [context, setContext] = useState<ForecastingContext | null>(null);
  const [activeScenario, setActiveScenario] = useState<ForecastScenario | null>(null);
  const [auditEntries, setAuditEntries] = useState<ProjectionAuditEntry[]>([]);
  const api = useMemo(() => getForecastingApi(), []);

  useEffect(() => {
    const bootstrap = async () => {
      const workspace = await api.bootstrap(createForecastingContext(
        demoBaselineSignals,
        demoForecastingContext.model,
        demoForecastingContext.scenarios,
      ));
      setContext(workspace);
      const scenario = workspace.scenarios[0] ?? demoForecastingScenario;
      setActiveScenario(scenario);
      const audit = await api.getProjectionAudit(scenario.id);
      setAuditEntries(audit);
    };

    void bootstrap();
  }, [api]);

  const insights: ForecastInsights | null = useMemo(() => {
    if (!context || !activeScenario) {
      return null;
    }
    return generateForecastInsights(context, activeScenario);
  }, [context, activeScenario]);

  const comparisons: ScenarioComparison[] = useMemo(() => {
    if (!context) {
      return [];
    }
    return context.scenarios.map((scenario) => compareScenarioToBaseline(context, scenario));
  }, [context]);

  const backcast = useMemo(() => evaluateBackcast(backcastObservations), []);

  const metricCards = insights
    ? [
        {
          label: 'Projected volume',
          value: formatNumber(insights.projectedTotal),
          helper: 'Aggregate transactions across the 7 day horizon.',
        },
        {
          label: 'Uplift vs. baseline',
          value: formatPercent(insights.upliftPercentage),
          helper: 'Percentage change against the auto-ingested baseline.',
        },
        {
          label: 'Confidence blend',
          value: formatPercent(insights.confidenceScore),
          helper: 'Model accuracy combined with assumption certainty.',
        },
        {
          label: 'Variance',
          value: formatVariance(insights.variance),
          helper: 'Daily volatility to feed staffing buffers downstream.',
        },
      ]
    : [];

  const scenarioTags = insights
    ? [
        `Peak day: ${insights.peakDay ?? 'TBD'}`,
        `Avg. daily demand: ${formatNumber(insights.averageDaily)}`,
        `Model accuracy: ${formatPercent(insights.accuracyScore)}`,
      ]
    : [];

  if (!context || !activeScenario || !insights) {
    return <div className="text-slate-500">Calibrating demand signals…</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Strategic overview</h2>
            <p className="text-sm text-slate-500">
              Align every channel plan to a single source of truth before automation orchestrates downstream schedules.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {scenarioTags.map((tag) => (
              <span key={tag} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-500">{metric.helper}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Channel mix intelligence</h3>
              <p className="text-sm text-slate-500">
                Monitor revenue streams to orchestrate staffing, prep, and supply plans without channel conflicts.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {insights.channelMix.map((channel) => (
              <div key={channel.channel} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{channel.channel}</p>
                  <p className="text-xs text-slate-500">
                    Share of demand {channel.share.toFixed(1)}% • Projected volume {formatNumber(channel.value)}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {formatNumber(channel.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Influence panel</h3>
          <p className="text-sm text-slate-500">Quantify external events layered over the baseline to inform playbooks.</p>
          <ul className="mt-4 space-y-3">
            {demoScenarioInfluences.map((influence) => (
              <li key={influence.id} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">{influence.label}</p>
                <p className="text-xs text-slate-500">
                  Impact {formatPercent(influence.impactPercentage)} • Confidence {formatPercent(influence.confidence * 100)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Scenario comparisons</h3>
          <p className="text-sm text-slate-500">
            Instantly see which playbook lift best meets the commercial targets while staying stable for operations.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Scenario</th>
                  <th className="px-4 py-2">Projected volume</th>
                  <th className="px-4 py-2">Uplift vs. baseline</th>
                  <th className="px-4 py-2">Variance delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisons.map((comparison) => (
                  <tr key={comparison.scenarioId} className="bg-white">
                    <td className="px-4 py-2 font-medium text-slate-900">{comparison.scenarioName}</td>
                    <td className="px-4 py-2 text-slate-600">{formatNumber(comparison.projectedTotal)}</td>
                    <td className="px-4 py-2 text-emerald-600">{formatPercent(comparison.upliftPercentage)}</td>
                    <td className="px-4 py-2 text-slate-600">{formatVariance(comparison.varianceDelta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Backcast quality</h3>
            <p className="text-sm text-slate-500">
              Validate the model&apos;s ability to replay historical demand before activating automations.
            </p>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-sm font-medium text-slate-700">MAPE</dt>
                <dd className="text-sm font-semibold text-slate-900">{formatPercent(backcast.mape)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-sm font-medium text-slate-700">Bias</dt>
                <dd className="text-sm font-semibold text-slate-900">{formatVariance(backcast.bias)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <dt className="text-sm font-medium text-slate-700">Volatility</dt>
                <dd className="text-sm font-semibold text-slate-900">{formatVariance(backcast.volatility)}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Recent actions</h3>
            <p className="text-sm text-slate-500">
              Transparent audit trails mean finance, operations, and marketing all stay in sync.
            </p>
            <ul className="mt-4 space-y-3">
              {auditEntries.map((entry) => (
                <li key={entry.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-900">{entry.id.split('-')[0]}</p>
                  <p className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
                </li>
              ))}
              {auditEntries.length === 0 && (
                <li className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                  Workspace bootstrapped – ready for live automation feeds.
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Active assumptions</h3>
            <p className="text-sm text-slate-500">Fine-tune uplift levers shared with marketing and revenue teams.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {demoScenarioAssumptions.map((assumption) => (
            <div key={assumption.id} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">{assumption.name}</p>
              <p className="mt-1 text-xs text-slate-500">{assumption.description}</p>
              <p className="mt-3 text-xs font-medium text-slate-500">
                Uplift {formatPercent(assumption.upliftPercentage)} • Confidence {formatPercent(assumption.confidence * 100)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
