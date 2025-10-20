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
import { BaselineDemandForecastingService, GreedyScheduleOptimizationService, observeScheduleAccuracy } from '../../services';

const forecastingService = new BaselineDemandForecastingService();
const optimizationService = new GreedyScheduleOptimizationService({ maxShiftsPerDay: 2 });

const formatInterval = (assignment: ShiftAssignment) => `${assignment.startTime} - ${assignment.endTime}`;

const parseMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getDurationHours = (assignment: ShiftAssignment) =>
  Math.max(0, (parseMinutes(assignment.endTime) - parseMinutes(assignment.startTime)) / 60);

const formatDateLabel = (dateString: string) =>
  new Date(`${dateString}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const createWeekBucket = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const startLabel = monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endLabel = sunday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return {
    key: `${monday.toISOString().slice(0, 10)}_${sunday.toISOString().slice(0, 10)}`,
    label: `${startLabel} – ${endLabel}`,
    sortKey: monday.getTime(),
    startLabel,
    endLabel,
  };
};

const createMonthBucket = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00Z`);
  const monthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return {
    key: monthStart.toISOString().slice(0, 10),
    label: monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    sortKey: monthStart.getTime(),
  };
};

type TimeFrame = 'day' | 'week' | 'month';

export const ManagerConsole = () => {
  const [context, setContext] = useState<SchedulingContext | null>(null);
  const [draft, setDraft] = useState<ScheduleDraft | null>(null);
  const [coverage, setCoverage] = useState<Record<string, { demand: number; scheduled: number }>>({});
  const [compliance, setCompliance] = useState<ComplianceResult[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
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
      const complianceResults = evaluateCompliance(enrichedContext);
      setCompliance(complianceResults);
      observeScheduleAccuracy(Number(drafted.metadata?.coverageScore ?? 0));
    };

    void bootstrap();
  }, [api]);

  const publish = async () => {
    if (!draft || !context) return;
    const published = await api.publishSchedule(draft.id);
    setDraft(published);
    const nextContext = { ...context, drafts: [published] };
    setContext(nextContext);
    setCompliance(evaluateCompliance(nextContext));
  };

  const insights: ScheduleInsights | null = useMemo(() => {
    if (!context || !draft) {
      return null;
    }
    return generateScheduleInsights(context, draft, compliance);
  }, [context, draft, compliance]);

  const availableLocations = useMemo(() => {
    if (!draft) return [];
    return Array.from(new Set(draft.assignments.map((assignment) => assignment.location))).sort();
  }, [draft]);

  const availableRoles = useMemo(() => {
    if (!draft) return [];
    return Array.from(new Set(draft.assignments.map((assignment) => assignment.role))).sort();
  }, [draft]);

  const getAssignmentId = (assignment: ShiftAssignment) =>
    `${assignment.staffId}-${assignment.date}-${assignment.startTime}-${assignment.endTime}`;

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

  useEffect(() => {
    if (!filteredAssignments.length) {
      setSelectedAssignmentId(null);
      return;
    }

    const stillVisible = selectedAssignmentId
      ? filteredAssignments.some((assignment) => getAssignmentId(assignment) === selectedAssignmentId)
      : false;

    if (!stillVisible) {
      setSelectedAssignmentId(getAssignmentId(filteredAssignments[0]));
    }
  }, [filteredAssignments, selectedAssignmentId]);

  const selectedAssignment = useMemo(() => {
    if (!draft || !selectedAssignmentId) return null;
    return draft.assignments.find((assignment) => getAssignmentId(assignment) === selectedAssignmentId) ?? null;
  }, [draft, selectedAssignmentId]);

  const assignmentsByDate = useMemo(() => {
    const grouped: Record<string, ShiftAssignment[]> = {};
    filteredAssignments.forEach((assignment) => {
      grouped[assignment.date] = grouped[assignment.date] ?? [];
      grouped[assignment.date].push(assignment);
    });
    return Object.entries(grouped)
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime)),
      }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [filteredAssignments]);

  const viewGroups = useMemo(() => {
    if (timeFrame === 'day') {
      return assignmentsByDate.map((day) => {
        const uniqueLocations = new Set(day.items.map((item) => item.location));
        const uniqueRoles = new Set(day.items.map((item) => item.role));
        const totalHours = day.items.reduce((sum, item) => sum + getDurationHours(item), 0);
        return {
          key: day.date,
          label: formatDateLabel(day.date),
          subLabel: day.date,
          assignments: day.items,
          summary: `${day.items.length} shifts • ${uniqueLocations.size} locations • ${uniqueRoles.size} roles`,
          totalHours,
          sortKey: new Date(`${day.date}T00:00:00Z`).getTime(),
        };
      });
    }

    if (timeFrame === 'week') {
      const grouped: Record<
        string,
        { bucketLabel: string; sortKey: number; assignments: ShiftAssignment[]; startLabel: string }
      > = {};
      filteredAssignments.forEach((assignment) => {
        const bucket = createWeekBucket(assignment.date);
        if (!grouped[bucket.key]) {
          grouped[bucket.key] = {
            bucketLabel: bucket.label,
            sortKey: bucket.sortKey,
            assignments: [],
            startLabel: bucket.startLabel,
          };
        }
        grouped[bucket.key].assignments.push(assignment);
      });

      return Object.entries(grouped)
        .map(([key, value]) => {
          const uniqueLocations = new Set(value.assignments.map((item) => item.location));
          const uniqueRoles = new Set(value.assignments.map((item) => item.role));
          const totalHours = value.assignments.reduce((sum, item) => sum + getDurationHours(item), 0);
          return {
            key,
            label: `Week of ${value.startLabel}`,
            subLabel: value.bucketLabel,
            assignments: value.assignments.sort((a, b) =>
              a.date === b.date ? parseMinutes(a.startTime) - parseMinutes(b.startTime) : a.date > b.date ? 1 : -1,
            ),
            summary: `${value.assignments.length} shifts • ${uniqueLocations.size} locations • ${uniqueRoles.size} roles`,
            totalHours,
            sortKey: value.sortKey,
          };
        })
        .sort((a, b) => a.sortKey - b.sortKey);
    }

    const grouped: Record<string, { bucketLabel: string; sortKey: number; assignments: ShiftAssignment[] }> = {};
    filteredAssignments.forEach((assignment) => {
      const bucket = createMonthBucket(assignment.date);
      if (!grouped[bucket.key]) {
        grouped[bucket.key] = { bucketLabel: bucket.label, sortKey: bucket.sortKey, assignments: [] };
      }
      grouped[bucket.key].assignments.push(assignment);
    });

    return Object.entries(grouped)
      .map(([key, value]) => {
        const uniqueLocations = new Set(value.assignments.map((item) => item.location));
        const uniqueRoles = new Set(value.assignments.map((item) => item.role));
        const totalHours = value.assignments.reduce((sum, item) => sum + getDurationHours(item), 0);
        return {
          key,
          label: value.bucketLabel,
          subLabel: `${value.assignments.length} shifts scheduled`,
          assignments: value.assignments.sort((a, b) =>
            a.date === b.date ? parseMinutes(a.startTime) - parseMinutes(b.startTime) : a.date > b.date ? 1 : -1,
          ),
          summary: `${uniqueLocations.size} locations • ${uniqueRoles.size} roles`,
          totalHours,
          sortKey: value.sortKey,
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey);
  }, [assignmentsByDate, filteredAssignments, timeFrame]);

  const selectedStaff = useMemo(() => {
    if (!context || !selectedAssignment) return null;
    return context.staff.find((member) => member.id === selectedAssignment.staffId) ?? null;
  }, [context, selectedAssignment]);

  const nextCoverageGap = useMemo(() => {
    const coverageEntries = Object.entries(coverage).map(([key, value]) => ({ key, ...value }));
    return coverageEntries
      .filter((item) => item.demand > item.scheduled)
      .sort((a, b) => (b.demand - b.scheduled) - (a.demand - a.scheduled))[0];
  }, [coverage]);

  const quickHints = useMemo(() => {
    const items: { title: string; description: string }[] = [];
    const constraints = context?.constraints ?? [];

    if (nextCoverageGap) {
      items.push({
        title: 'Fill upcoming demand',
        description: `Add ${Math.max(0, nextCoverageGap.demand - nextCoverageGap.scheduled)} more teammates to ${nextCoverageGap.key} to balance demand.`,
      });
    } else {
      items.push({
        title: 'Coverage is balanced',
        description: 'Forecast demand is fully covered. Keep refining individual shifts to stay ahead of surges.',
      });
    }

    if (insights) {
      items.push({
        title: 'Optimize hours mix',
        description: `Utilisation is tracking at ${insights.utilisation}%. Adjust part-time availability to keep morale high.`,
      });
      items.push({
        title: 'Guardrail compliance',
        description: `Compliance score holds at ${insights.complianceScore}%. Run a quick audit before publishing to stay audit-ready.`,
      });
    } else {
      items.push({
        title: 'Let AI jump-start the plan',
        description: 'Use the builder to auto-generate a draft, then fine-tune coverage by location and role.',
      });
      items.push({
        title: 'Stay compliance ready',
        description: 'Turn on guardrails before publishing to catch labour, rest, and certification gaps instantly.',
      });
    }

    const failing = compliance.find((result) => !result.passed);
    if (failing) {
      const constraint = constraints.find((item) => item.id === failing.constraintId);
      items[items.length - 1] = {
        title: 'Resolve a compliance alert',
        description: constraint?.description ?? failing.message ?? 'Tighten this schedule before publishing.',
      };
    }

    while (items.length < 3) {
      items.push({
        title: 'Build with confidence',
        description: 'Stack shifts day, week, or month at a time. Drag, swap, and publish in one workspace.',
      });
    }

    return items.slice(0, 3);
  }, [compliance, context, insights, nextCoverageGap]);

  const builderInsights = useMemo(() => {
    if (!selectedAssignment || !insights) {
      return [
        {
          title: 'Select a shift',
          description: 'Choose any shift in the timeline to unlock AI-guided coverage, fairness, and swap suggestions.',
        },
      ];
    }

    const roleInsight = insights.roleCoverage.find((item) => item.role === selectedAssignment.role);
    const locationInsight = insights.locationCoverage.find((item) => item.location === selectedAssignment.location);

    return [
      {
        title: 'Smart swap',
        description:
          'Use the talent graph to propose a like-for-like swap while keeping certifications, overtime, and rest intact.',
      },
      {
        title: roleInsight ? `${roleInsight.averageHours}h average for ${selectedAssignment.role}` : 'Role insights',
        description: roleInsight
          ? `${roleInsight.assignments} assignments for ${roleInsight.role} this cycle. Keep hours fair across the team.`
          : 'Calibrate this role by checking utilisation and fairness indicators.',
      },
      {
        title: locationInsight ? `${locationInsight.fillRate}% coverage at ${selectedAssignment.location}` : 'Location pulse',
        description: locationInsight
          ? `Close the gap with ${Math.max(0, locationInsight.demand - locationInsight.scheduled)} more teammates needed.`
          : 'Monitor demand versus coverage for this site to stay ahead of the rush.',
      },
    ];
  }, [insights, selectedAssignment]);

  const planMetrics = useMemo(() => {
    if (!insights) return [];
    return [
      { label: 'Coverage', value: `${insights.coverageScore}%`, helper: 'Forecast demand fulfilled.' },
      { label: 'Utilisation', value: `${insights.utilisation}%`, helper: 'Hours aligned to preferences.' },
      { label: 'Fairness', value: `${insights.fairnessIndex}%`, helper: 'Balanced distribution across staff.' },
      { label: 'Compliance', value: `${insights.complianceScore}%`, helper: 'Guardrails passing pre-publish.' },
    ];
  }, [insights]);

  if (!context || !draft) {
    return <div className="text-slate-500">Preparing AI scheduling workspace…</div>;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        {quickHints.map((hint) => (
          <div
            key={hint.title}
            className="rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 p-[1px] shadow-lg"
          >
            <div className="h-full rounded-[10px] bg-white/95 p-5">
              <p className="text-sm font-semibold text-blue-900">{hint.title}</p>
              <p className="mt-2 text-sm text-slate-600">{hint.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Schedule builder</h2>
            <p className="text-sm text-slate-500">Craft day, week, or month views with AI-optimised staffing suggestions.</p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            {(['day', 'week', 'month'] as TimeFrame[]).map((frame) => (
              <button
                key={frame}
                type="button"
                onClick={() => setTimeFrame(frame)}
                className={`rounded-full px-3 py-1 transition ${
                  timeFrame === frame ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-white/60'
                }`}
              >
                {frame.charAt(0).toUpperCase() + frame.slice(1)}
              </button>
            ))}
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
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {viewGroups.map((group) => (
              <div key={group.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{group.subLabel}</p>
                    <h3 className="text-lg font-semibold text-slate-900">{group.label}</h3>
                    <p className="text-sm text-slate-600">{group.summary}</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    {group.totalHours.toFixed(1)} scheduled hrs
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {group.assignments.map((assignment) => {
                    const staff = context.staff.find((member) => member.id === assignment.staffId);
                    const assignmentId = getAssignmentId(assignment);
                    const isActive = assignmentId === selectedAssignmentId;
                    return (
                      <button
                        type="button"
                        onClick={() => setSelectedAssignmentId(assignmentId)}
                        key={assignmentId}
                        className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                          isActive
                            ? 'border-blue-500 bg-white shadow-sm ring-2 ring-blue-100'
                            : 'border-transparent bg-white hover:border-blue-200 hover:bg-blue-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{staff?.displayName}</p>
                            <p className="text-sm text-slate-500">
                              {assignment.date} • {formatInterval(assignment)} • {assignment.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {assignment.role}
                            </span>
                            {assignment.metadata?.tags?.length ? (
                              <p className="mt-2 text-xs font-medium text-slate-500">
                                {assignment.metadata.tags.join(', ')}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {filteredAssignments.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                No shifts match the current filters. Reset filters or switch the time frame to explore the AI-generated plan.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Shift intelligence</h3>
              {selectedAssignment && selectedStaff ? (
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="font-semibold text-slate-900">{selectedStaff.displayName}</p>
                    <p>
                      {selectedAssignment.date} • {formatInterval(selectedAssignment)} • {selectedAssignment.location}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{selectedAssignment.role}</p>
                  </div>
                  <div className="space-y-2">
                    {builderInsights.map((tile) => (
                      <div key={tile.title} className="rounded-md bg-blue-50/60 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">{tile.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{tile.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Select a shift from the builder to inspect staffing details and unlock guided optimisation tips.
                </p>
              )}
            </div>

            {planMetrics.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Plan health</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {planMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-md bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{metric.value}</p>
                      <p className="text-xs text-slate-500">{metric.helper}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nextCoverageGap && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Coverage heatmap</h3>
                <div className="mt-2 space-y-2 text-xs text-slate-600">
                  <p>
                    Largest opportunity at{' '}
                    <span className="font-semibold text-slate-900">{nextCoverageGap.key}</span> with{' '}
                    <span className="font-semibold text-slate-900">
                      {Math.max(0, nextCoverageGap.demand - nextCoverageGap.scheduled)}
                    </span>{' '}
                    teammates needed.
                  </p>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width: `${Math.min(100, (nextCoverageGap.scheduled / Math.max(1, nextCoverageGap.demand)) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">
                    Demand {nextCoverageGap.demand} • Scheduled {nextCoverageGap.scheduled}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

