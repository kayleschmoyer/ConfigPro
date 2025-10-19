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
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'people'>('list');
  const [daypartFilter, setDaypartFilter] = useState('');
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

  const getAssignmentId = (assignment: ShiftAssignment) =>
    `${assignment.staffId}-${assignment.date}-${assignment.startTime}-${assignment.endTime}`;

  const dayparts = useMemo(
    () => [
      { id: 'opening', label: 'Opening', start: '05:00', end: '11:00' },
      { id: 'midday', label: 'Midday', start: '11:00', end: '16:00' },
      { id: 'closing', label: 'Closing', start: '16:00', end: '23:00' },
    ],
    [],
  );

  const parseMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const filteredAssignments = useMemo(() => {
    if (!draft) return [];
    return draft.assignments.filter((assignment) => {
      if (locationFilter && assignment.location !== locationFilter) {
        return false;
      }
      if (roleFilter && assignment.role !== roleFilter) {
        return false;
      }
      if (daypartFilter) {
        const window = dayparts.find((item) => item.id === daypartFilter);
        if (window) {
          const start = parseMinutes(assignment.startTime);
          const end = parseMinutes(assignment.endTime);
          const windowStart = parseMinutes(window.start);
          const windowEnd = parseMinutes(window.end);
          if (end <= windowStart || start >= windowEnd) {
            return false;
          }
        }
      }
      return true;
    });
  }, [draft, locationFilter, roleFilter, daypartFilter, dayparts]);

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

  const assignmentsByStaff = useMemo(() => {
    const grouped: Record<string, ShiftAssignment[]> = {};
    filteredAssignments.forEach((assignment) => {
      grouped[assignment.staffId] = grouped[assignment.staffId] ?? [];
      grouped[assignment.staffId].push(assignment);
    });
    return Object.entries(grouped)
      .map(([staffId, items]) => ({
        staffId,
        items: items.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : parseMinutes(a.startTime) - parseMinutes(b.startTime))),
      }))
      .sort((a, b) => (a.staffId > b.staffId ? 1 : -1));
  }, [filteredAssignments]);

  const timelineHours = useMemo(() => Array.from({ length: 8 }, (_, index) => 6 + index * 2), []);

  const daypartActive = (id: string) => daypartFilter === id;

  const nextCoverageGap = useMemo(() => {
    const coverageEntries = Object.entries(coverage).map(([key, value]) => ({ key, ...value }));
    return coverageEntries
      .filter((item) => item.demand > item.scheduled)
      .sort((a, b) => (b.demand - b.scheduled) - (a.demand - a.scheduled))[0];
  }, [coverage]);

  const selectedStaff = useMemo(() => {
    if (!context || !selectedAssignment) return null;
    return context.staff.find((member) => member.id === selectedAssignment.staffId) ?? null;
  }, [context, selectedAssignment]);

  const suggestionTiles = useMemo(() => {
    if (!selectedAssignment || !insights) {
      return [
        {
          title: 'Spin up auto-suggestions',
          description:
            'Pick a shift to unlock AI recommendations for coverage balancing, swaps, and overtime guardrails.',
        },
      ];
    }

    const roleInsight = insights.roleCoverage.find((item) => item.role === selectedAssignment.role);
    const locationInsight = insights.locationCoverage.find((item) => item.location === selectedAssignment.location);

    return [
      {
        title: 'Smart swap',
        description:
          'Identify adjacent talent to swap shifts instantly. Use AI guardrails to preserve compliance and fairness.',
      },
      {
        title: roleInsight ? `${roleInsight.averageHours}h avg for ${selectedAssignment.role}` : 'Role insights',
        description: roleInsight
          ? `Maintain balance: ${roleInsight.assignments} assignments for ${roleInsight.role} this week.`
          : 'Calibrate this role by checking utilisation and fairness indicators.',
      },
      {
        title: locationInsight ? `${locationInsight.fillRate}% fill at ${selectedAssignment.location}` : 'Location pulse',
        description: locationInsight
          ? `Close the gap with ${Math.max(0, locationInsight.demand - locationInsight.scheduled)} more teammates needed.`
          : 'Monitor demand vs. coverage for this location with live telemetry.',
      },
    ];
  }, [insights, selectedAssignment]);

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
                setDaypartFilter('');
              }}
            >
              Clear filters
            </button>
          )}
          <div className="flex items-center gap-2">
            {dayparts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDaypartFilter(daypartActive(item.id) ? '' : item.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  daypartActive(item.id)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-full px-3 py-1 transition ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-white/60'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`rounded-full px-3 py-1 transition ${
                viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-white/60'
              }`}
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => setViewMode('people')}
              className={`rounded-full px-3 py-1 transition ${
                viewMode === 'people' ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-white/60'
              }`}
            >
              People
            </button>
          </div>
          {activePlaybook && (
            <span className="ml-auto inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {activePlaybook.name} lens active
            </span>
          )}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => {
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
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
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
                          <p className="mt-2 text-xs font-medium text-slate-500">{assignment.metadata?.tags?.join(', ')}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredAssignments.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                    No shifts match the current filters. Try broadening the location or role selection to explore more AI-generated coverage.
                  </div>
                )}
              </div>
            )}

            {viewMode === 'timeline' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-400">
                  {timelineHours.map((hour) => (
                    <span key={hour} className="-translate-x-1/2">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  ))}
                </div>
                <div className="space-y-6">
                  {assignmentsByDate.map(({ date, items }) => (
                    <div key={date}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{date}</p>
                      <div className="relative mt-2 h-20 rounded-lg border border-slate-200 bg-slate-50">
                        {items.map((assignment) => {
                          const assignmentId = getAssignmentId(assignment);
                          const isActive = assignmentId === selectedAssignmentId;
                          const start = parseMinutes(assignment.startTime);
                          const end = parseMinutes(assignment.endTime);
                          const left = (start / (24 * 60)) * 100;
                          const width = Math.max(8, ((end - start) / (24 * 60)) * 100);
                          const staff = context.staff.find((member) => member.id === assignment.staffId);
                          return (
                            <button
                              key={assignmentId}
                              type="button"
                              onClick={() => setSelectedAssignmentId(assignmentId)}
                              className={`absolute top-2 overflow-hidden rounded-md border px-3 py-2 text-left text-xs shadow-sm transition ${
                                isActive
                                  ? 'border-blue-600 bg-blue-600/90 text-white'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                              }`}
                              style={{ left: `${left}%`, width: `${width}%` }}
                            >
                              <p className="font-semibold">{staff?.displayName}</p>
                              <p className="text-[10px] opacity-80">
                                {assignment.role} • {assignment.location}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'people' && (
              <div className="space-y-4">
                {assignmentsByStaff.map(({ staffId, items }) => {
                  const staff = context.staff.find((member) => member.id === staffId);
                  return (
                    <div key={staffId} className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{staff?.displayName ?? staffId}</p>
                          <p className="text-xs text-slate-500">{staff?.primaryRole}</p>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                          {items.length} shift{items.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {items.map((assignment) => {
                          const assignmentId = getAssignmentId(assignment);
                          const isActive = assignmentId === selectedAssignmentId;
                          return (
                            <button
                              key={assignmentId}
                              type="button"
                              onClick={() => setSelectedAssignmentId(assignmentId)}
                              className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition ${
                                isActive
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/70'
                              }`}
                            >
                              <span>
                                {assignment.date} • {formatInterval(assignment)}
                              </span>
                              <span className="font-medium text-slate-600">{assignment.location}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {assignmentsByStaff.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                    No team members match the filters. Reset filters to explore the full roster.
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-sm font-semibold text-blue-900">Interactive shift cockpit</h3>
              {selectedAssignment && selectedStaff ? (
                <div className="mt-3 space-y-2 text-sm text-blue-900/80">
                  <p>
                    <span className="font-semibold">{selectedStaff.displayName}</span> is scheduled for{' '}
                    <span className="font-semibold">{selectedAssignment.role}</span> at {selectedAssignment.location}.
                  </p>
                  <p>
                    {selectedAssignment.date} • {formatInterval(selectedAssignment)} • Prefers{' '}
                    {selectedStaff.availability?.preferredShifts?.join(', ') ?? 'dynamic rotations'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white px-3 py-1 font-semibold text-blue-700">
                      Utilisation {insights?.utilisation ?? 0}%
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 font-semibold text-blue-700">
                      Fairness {insights?.fairnessIndex ?? 0}%
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs">
                    <button
                      type="button"
                      className="rounded-md bg-blue-600 px-3 py-2 font-semibold text-white shadow hover:bg-blue-700"
                    >
                      Auto-rebalance shift
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-blue-200 bg-white px-3 py-2 font-semibold text-blue-700 hover:border-blue-300"
                    >
                      Offer overtime alternative
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-blue-200 bg-white px-3 py-2 font-semibold text-blue-700 hover:border-blue-300"
                    >
                      Open swap marketplace
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-blue-900/70">
                  Select a shift to unlock personalised optimisation actions, fairness insights, and coverage suggestions.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Guided suggestions</h3>
              <div className="mt-3 space-y-3">
                {suggestionTiles.map((tile) => (
                  <div key={tile.title} className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">{tile.title}</p>
                    <p className="mt-1 leading-relaxed">{tile.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Coverage radar</h3>
              {nextCoverageGap ? (
                <div className="mt-2 space-y-2 text-xs text-slate-600">
                  <p>
                    Largest opportunity at <span className="font-semibold text-slate-900">{nextCoverageGap.key}</span> with{' '}
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
              ) : (
                <p className="mt-2 text-xs text-slate-600">Coverage is balanced across current filters.</p>
              )}
            </div>
          </aside>
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
