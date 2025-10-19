import { useEffect, useMemo, useState } from 'react';
import { getSchedulingApi } from '../../api';
import {
  aggregateCoverage,
  createSchedulingContext,
  evaluateCompliance,
  generateScheduleInsights,
} from '../../modules/scheduling';
import type {
  ComplianceResult,
  ScheduleDraft,
  SchedulingContext,
  ShiftAssignment,
  ScheduleInsights,
} from '../../modules/scheduling';
import { demoConstraints, demoDraft, demoDemandForecast, demoLaborRules, demoStaff } from '../../data/demoSchedulingData';
import { defaultPlaybookId, industryPlaybooks } from '../../data/industryPlaybooks';
import { BaselineDemandForecastingService, GreedyScheduleOptimizationService, observeScheduleAccuracy } from '../../services';

const forecastingService = new BaselineDemandForecastingService();
const optimizationService = new GreedyScheduleOptimizationService({ maxShiftsPerDay: 2 });

const formatInterval = (assignment: ShiftAssignment) => `${assignment.startTime} - ${assignment.endTime}`;

export const ManagerConsole = () => {
  const [context, setContext] = useState<SchedulingContext | null>(null);
  const [draft, setDraft] = useState<ScheduleDraft | null>(null);
  const [coverage, setCoverage] = useState<Record<string, { demand: number; scheduled: number }>>({});
  const [compliance, setCompliance] = useState<ComplianceResult[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedPlaybookId, setSelectedPlaybookId] = useState(defaultPlaybookId);
  const api = useMemo(() => getSchedulingApi(), []);

  useEffect(() => {
    const bootstrap = async () => {
      const forecast = await forecastingService.generateForecast(demoDemandForecast.signals);
      const baseContext = createSchedulingContext(demoStaff, demoLaborRules, forecast, demoConstraints, [demoDraft]);

      const schedule = await optimizationService.generateSchedule(baseContext);
      const drafted = await api.draftSchedule(schedule);
      const enrichedContext = { ...baseContext, drafts: [drafted] };
      setContext(enrichedContext);
      setDraft(drafted);
      setCoverage(aggregateCoverage(forecast, drafted.assignments));
      setCompliance(evaluateCompliance(enrichedContext));
      observeScheduleAccuracy(Number(drafted.metadata?.coverageScore ?? 0));
    };

    void bootstrap();
  }, [api]);

  const publish = async () => {
    if (!draft || !context) return;
    const published = await api.publishSchedule(draft.id);
    setDraft(published);
    setContext({ ...context, drafts: [published] });
    setCompliance(evaluateCompliance({ ...context, drafts: [published] }));
  };

  const insights: ScheduleInsights | null = useMemo(() => {
    if (!context || !draft) {
      return null;
    }
    return generateScheduleInsights(context, draft, compliance);
  }, [context, draft, compliance]);

  const activePlaybook = useMemo(
    () => industryPlaybooks.find((playbook) => playbook.id === selectedPlaybookId) ?? industryPlaybooks[0] ?? null,
    [selectedPlaybookId],
  );

  const availableLocations = useMemo(() => {
    if (!draft) return [];
    return Array.from(new Set(draft.assignments.map((assignment) => assignment.location))).sort();
  }, [draft]);

  const availableRoles = useMemo(() => {
    if (!draft) return [];
    return Array.from(new Set(draft.assignments.map((assignment) => assignment.role))).sort();
  }, [draft]);

  const filteredAssignments = useMemo(() => {
    if (!draft) return [];
    return draft.assignments.filter((assignment) => {
      if (locationFilter && assignment.location !== locationFilter) {
        return false;
      }
      if (roleFilter && assignment.role !== roleFilter) {
        return false;
      }
      return true;
    });
  }, [draft, locationFilter, roleFilter]);

  const commandMetrics = insights
    ? [
        {
          label: 'Coverage score',
          value: `${insights.coverageScore}%`,
          helper: 'Forecast demand fulfilled across the planning horizon.',
        },
        {
          label: 'Utilisation',
          value: `${insights.utilisation}%`,
          helper: 'Average hours scheduled against teammate preferences.',
        },
        {
          label: 'Fairness index',
          value: `${insights.fairnessIndex}%`,
          helper: 'Hour balance across the roster (higher is better).',
        },
        {
          label: 'Compliance score',
          value: `${insights.complianceScore}%`,
          helper: 'Automated rule validations passing ahead of publishing.',
        },
      ]
    : [];

  if (!context || !draft) {
    return <div className="text-slate-500">Preparing AI scheduling workspace…</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Industry playbooks</h2>
        <p className="text-sm text-slate-500">
          Activate a vertical-specific orchestration lens to adapt automation rules, guardrails, and insights for any operating model.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {industryPlaybooks.map((playbook) => {
            const isActive = playbook.id === (activePlaybook?.id ?? selectedPlaybookId);
            return (
              <button
                key={playbook.id}
                type="button"
                onClick={() => setSelectedPlaybookId(playbook.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-600'
                }`}
              >
                {playbook.name}
              </button>
            );
          })}
        </div>
        {activePlaybook && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{activePlaybook.subtitle}</h3>
                <p className="text-sm text-slate-500">{activePlaybook.description}</p>
              </div>
              <dl className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-3">
                {activePlaybook.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-md bg-slate-50 p-3">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</dt>
                    <dd className="text-lg font-semibold text-slate-900">{metric.format(insights)}</dd>
                    <p className="mt-1 text-xs text-slate-500">{metric.description}</p>
                  </div>
                ))}
              </dl>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Focus accelerators</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                  {activePlaybook.focusAreas.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Automation wins</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
                  {activePlaybook.automationWins.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {insights && (
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Executive command center</h2>
          <p className="text-sm text-slate-500">
            Real-time scorecards spanning coverage, compliance, fairness, and role allocation keep every industry-ready operation on track.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {commandMetrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
                <p className="mt-1 text-xs text-slate-500">{metric.helper}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Location coverage</h3>
              <p className="text-xs text-slate-500">Drill into regions, venues, or clinics instantly.</p>
              <ul className="mt-4 space-y-3">
                {insights.locationCoverage.map((item) => (
                  <li key={item.location} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.location}</p>
                      <p className="text-xs text-slate-500">Demand: {item.demand.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{item.scheduled}</p>
                      <p className="text-xs text-slate-500">Fill rate {item.fillRate}%</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Role calibration</h3>
              <p className="text-xs text-slate-500">Understand headcount balance and effort distribution.</p>
              <ul className="mt-4 space-y-3">
                {insights.roleCoverage.map((item) => (
                  <li key={item.role} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.role}</p>
                      <p className="text-xs text-slate-500">Team members: {item.uniqueStaff}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{item.assignments}</p>
                      <p className="text-xs text-slate-500">Avg hours {item.averageHours}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Schedule builder</h2>
            <p className="text-sm text-slate-500">Optimize coverage with AI-curated staffing suggestions.</p>
          </div>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            onClick={publish}
          >
            Publish schedule
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
          >
            <option value="">All locations</option>
            {availableLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="">All roles</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {(locationFilter || roleFilter) && (
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => {
                setLocationFilter('');
                setRoleFilter('');
              }}
            >
              Clear filters
            </button>
          )}
          {activePlaybook && (
            <span className="ml-auto inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {activePlaybook.name} lens active
            </span>
          )}
        </div>
        <div className="mt-6 grid gap-4">
          {filteredAssignments.map((assignment) => {
            const staff = context.staff.find((member) => member.id === assignment.staffId);
            return (
              <article
                key={`${assignment.staffId}-${assignment.date}-${assignment.startTime}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{staff?.displayName}</p>
                  <p className="text-sm text-slate-500">
                    {assignment.date} • {formatInterval(assignment)} • {assignment.location}
                  </p>
                </div>
                <span className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {assignment.role}
                </span>
              </article>
            );
          })}
          {filteredAssignments.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No shifts match the current filters. Try broadening the location or role selection to explore more AI-generated coverage.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Coverage heatmap</h2>
        <p className="text-sm text-slate-500">Compare scheduled headcount against forecast demand.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {Object.entries(coverage).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-600">{key}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-slate-900">{value.scheduled}</span>
                <span className="text-sm text-slate-500">scheduled</span>
              </div>
              <p className="text-sm text-slate-500">Demand target: {value.demand}</p>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${Math.min(100, (value.scheduled / Math.max(1, value.demand)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Strategic automation</h2>
        <p className="text-sm text-slate-500">
          Launch scenario planning, simulate surge demand, or auto-rebalance shifts while respecting labour rules, certifications, and fairness signals.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Scenario lab</h3>
            <p className="mt-2 text-xs text-slate-500">
              Clone this draft, tweak demand in bulk, and compare insight scores side-by-side before publishing.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Compliance autopilot</h3>
            <p className="mt-2 text-xs text-slate-500">
              Pre-configure statutory, union, or accreditation guardrails and let the system validate every update instantly.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">Talent marketplace</h3>
            <p className="mt-2 text-xs text-slate-500">
              Surface gig pools, contractors, and internal float teams when coverage gaps appear across locations or service lines.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Compliance warnings</h2>
        <p className="text-sm text-slate-500">
          Automatically check labor laws, qualifications, and custom rules before publishing.
        </p>
        <ul className="mt-4 space-y-3">
          {compliance.map((result) => {
            const constraint = context.constraints.find((item) => item.id === result.constraintId);
            const statusClass = result.passed ? 'text-emerald-600 bg-emerald-50' : 'text-amber-700 bg-amber-50';
            return (
              <li key={result.constraintId} className={`rounded-md px-4 py-3 text-sm ${statusClass}`}>
                <p className="font-medium">{constraint?.description ?? result.constraintId}</p>
                <p>{result.passed ? 'Ready to publish' : result.message}</p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};
