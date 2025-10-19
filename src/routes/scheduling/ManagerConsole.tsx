import { useEffect, useMemo, useState } from 'react';
import { getSchedulingApi } from '../../api';
import {
  aggregateCoverage,
  createSchedulingContext,
  evaluateCompliance,
} from '../../modules/scheduling';
import type {
  ComplianceResult,
  ScheduleDraft,
  SchedulingContext,
  ShiftAssignment,
} from '../../modules/scheduling';
import { demoConstraints, demoDraft, demoDemandForecast, demoLaborRules, demoStaff } from '../../data/demoSchedulingData';
import { BaselineDemandForecastingService, GreedyScheduleOptimizationService, observeScheduleAccuracy } from '../../services';

const forecastingService = new BaselineDemandForecastingService();
const optimizationService = new GreedyScheduleOptimizationService({ maxShiftsPerDay: 2 });

const formatInterval = (assignment: ShiftAssignment) => `${assignment.startTime} - ${assignment.endTime}`;

export const ManagerConsole = () => {
  const [context, setContext] = useState<SchedulingContext | null>(null);
  const [draft, setDraft] = useState<ScheduleDraft | null>(null);
  const [coverage, setCoverage] = useState<Record<string, { demand: number; scheduled: number }>>({});
  const [compliance, setCompliance] = useState<ComplianceResult[]>([]);
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

  if (!context || !draft) {
    return <div className="text-slate-500">Preparing AI scheduling workspace…</div>;
  }

  return (
    <div className="space-y-8">
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
        <div className="mt-6 grid gap-4">
          {draft.assignments.map((assignment) => {
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
