import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { getSchedulingApi } from '../../api';
import { createSchedulingContext, generateScheduleInsights } from '../../modules/scheduling';
import type { ScheduleDraft, ShiftAssignment, ScheduleInsights } from '../../modules/scheduling';
import { demoConstraints, demoDemandForecast, demoDraft, demoLaborRules, demoStaff } from '../../data/demoSchedulingData';
import { BaselineDemandForecastingService, GreedyScheduleOptimizationService } from '../../services';

interface SwapRequest {
  id: string;
  fromShift: ShiftAssignment;
  toStaffId: string;
  reason: string;
}

export const EmployeePortal = () => {
  const api = useMemo(() => getSchedulingApi(), []);
  const [schedule, setSchedule] = useState<ScheduleDraft | null>(null);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [timeFocus, setTimeFocus] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [persona, setPersona] = useState<'full-time' | 'part-time' | 'float'>('full-time');

  useEffect(() => {
    const load = async () => {
      try {
        const drafts = await api.getAuditLog('draft-demo');
        if (drafts.length === 0) {
          const forecasting = new BaselineDemandForecastingService();
          const forecast = await forecasting.generateForecast(demoDemandForecast.signals);
          const context = createSchedulingContext(demoStaff, demoLaborRules, forecast, demoConstraints, [demoDraft]);
          const optimizer = new GreedyScheduleOptimizationService({ maxShiftsPerDay: 2 });
          const generated = await optimizer.generateSchedule(context);
          await api.draftSchedule(generated);
        }
      } catch (error) {
        console.error(error);
      }
    };
    void load();
  }, [api]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const audit = await api.getAuditLog('draft-demo');
        if (audit.length === 0) {
          return;
        }
        const latest = audit[audit.length - 1].payload.next as ScheduleDraft | undefined;
        if (latest) {
          setSchedule(latest);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void fetchSchedule();
  }, [api]);

  const handleAvailabilitySubmit = (event: FormEvent) => {
    event.preventDefault();
    setMessage('Availability preferences saved. Manager will review updates.');
  };

  const handleBid = (assignment: ShiftAssignment) => {
    setMessage(`Bid submitted for ${assignment.date} ${assignment.startTime}-${assignment.endTime}`);
  };

  const handleSwapRequest = (assignment: ShiftAssignment, toStaffId: string, reason: string) => {
    const request: SwapRequest = {
      id: `swap-${Date.now()}`,
      fromShift: assignment,
      toStaffId,
      reason,
    };
    setSwapRequests((prev) => [...prev, request]);
    setMessage('Swap request sent to manager for approval.');
  };

  const shifts = schedule?.assignments ?? [];

  const contextualSchedule = useMemo(() => {
    if (!schedule) return null;
    return createSchedulingContext(demoStaff, demoLaborRules, demoDemandForecast, demoConstraints, [schedule]);
  }, [schedule]);

  const insights: ScheduleInsights | null = useMemo(() => {
    if (!contextualSchedule || !schedule) {
      return null;
    }
    return generateScheduleInsights(contextualSchedule, schedule);
  }, [contextualSchedule, schedule]);

  const availableLocations = useMemo(() => {
    if (!schedule) return [];
    return Array.from(new Set(schedule.assignments.map((assignment) => assignment.location))).sort();
  }, [schedule]);

  const availableRoles = useMemo(() => {
    if (!schedule) return [];
    return Array.from(new Set(schedule.assignments.map((assignment) => assignment.role))).sort();
  }, [schedule]);

  const filteredShifts = useMemo(() => {
    if (!schedule) return [];
    return schedule.assignments.filter((assignment) => {
      if (roleFilter && assignment.role !== roleFilter) {
        return false;
      }
      if (locationFilter && assignment.location !== locationFilter) {
        return false;
      }
      const startHour = Number.parseInt(assignment.startTime.split(':')[0] ?? '0', 10);
      if (Number.isNaN(startHour)) {
        return true;
      }
      if (timeFocus === 'morning') {
        return startHour < 12;
      }
      if (timeFocus === 'afternoon') {
        return startHour >= 12 && startHour < 17;
      }
      if (timeFocus === 'evening') {
        return startHour >= 17;
      }
      return true;
    });
  }, [schedule, roleFilter, locationFilter, timeFocus]);

  const prioritizedShifts = useMemo(
    () =>
      filteredShifts
        .slice()
        .sort(
          (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime) || a.location.localeCompare(b.location),
        ),
    [filteredShifts],
  );

  const personaNarratives: Record<'full-time' | 'part-time' | 'float', string> = {
    'full-time': 'Stay aligned with 40-hour pacing, leadership coverage, and premium shift access.',
    'part-time': 'Blend lifestyle flexibility with high-impact micro-shifts tailored to your availability.',
    float: 'Discover multi-site opportunities where your skills close urgent coverage gaps.',
  } as const;

  const opportunityFocus = useMemo(() => {
    if (!insights) return [];
    return insights.locationCoverage
      .slice()
      .sort((a, b) => a.fillRate - b.fillRate)
      .slice(0, 3)
      .map((item) => ({
        location: item.location,
        fillRate: item.fillRate,
        demand: item.demand,
        scheduled: item.scheduled,
      }));
  }, [insights]);

  const employeeMetrics = insights
    ? [
        {
          label: 'Fairness index',
          value: `${insights.fairnessIndex}%`,
          helper: 'Roster balance across the entire team.',
        },
        {
          label: 'Overtime risk',
          value: `${insights.overtimeRisk}%`,
          helper: 'Team members approaching overtime limits.',
        },
        {
          label: 'Coverage score',
          value: `${insights.coverageScore}%`,
          helper: 'Demand windows already filled by the AI engine.',
        },
        {
          label: 'Qualification match',
          value: `${insights.qualificationMatch}%`,
          helper: 'Assignments aligned with certifications and skills.',
        },
      ]
    : [];

  const nextShiftsPreview = useMemo(() => prioritizedShifts.slice(0, 3), [prioritizedShifts]);

  return (
    <div className="space-y-8">
      {insights && (
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Personal scheduling radar</h2>
              <p className="text-sm text-slate-500">
                High-signal insights tuned for frontline teams across retail, hospitality, healthcare, logistics, and beyond.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'full-time' as const, label: 'Full-time' },
                  { id: 'part-time' as const, label: 'Part-time' },
                  { id: 'float' as const, label: 'Flex & float' },
                ]
              ).map((option) => {
                const active = persona === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPersona(option.id)}
                    className={`rounded-full px-4 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Persona lens: {personaNarratives[persona]}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {employeeMetrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
                <p className="mt-1 text-xs text-slate-500">{metric.helper}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Locations needing love</h3>
              <p className="text-xs text-slate-500">Aim bids at the moments where extra coverage moves the needle.</p>
              <ul className="mt-3 space-y-3">
                {opportunityFocus.length === 0 && (
                  <li className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    All locations are currently fully covered. Keep an eye on live updates for new opportunities.
                  </li>
                )}
                {opportunityFocus.map((item) => {
                  const status = item.fillRate < 100 ? 'Extra hours available' : 'Fully covered – volunteer for overtime only';
                  return (
                    <li key={item.location} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.location}</p>
                        <p className="text-xs text-slate-500">Demand {item.demand} • Scheduled {item.scheduled}</p>
                      </div>
                      <span className="text-xs font-semibold text-blue-600">Fill rate {item.fillRate}% • {status}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Next best shifts</h3>
              <p className="text-xs text-slate-500">AI surfaces time slots aligned with your persona goals.</p>
              <ul className="mt-3 space-y-3">
                {nextShiftsPreview.length === 0 && <li className="text-xs text-slate-500">Adjust filters to reveal more shifts.</li>}
                {nextShiftsPreview.map((assignment) => (
                  <li key={`${assignment.date}-${assignment.startTime}-${assignment.location}`} className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {assignment.date} • {assignment.startTime}-{assignment.endTime} • {assignment.location}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">My availability</h2>
        <p className="text-sm text-slate-500">
          Share preferred hours to influence automated scheduling. {personaNarratives[persona]}
        </p>
        <form onSubmit={handleAvailabilitySubmit} className="mt-4 space-y-4">
          <textarea
            className="w-full rounded-md border border-slate-300 p-3 text-sm"
            rows={4}
            placeholder="Weekday availability notes..."
            value={JSON.stringify(availability, null, 2)}
            onChange={(event) => {
              try {
                const parsed = JSON.parse(event.target.value);
                setAvailability(parsed);
              } catch {
                setAvailability({});
              }
            }}
          />
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Save availability
          </button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Open shift bids</h2>
        <p className="text-sm text-slate-500">Bid on available shifts surfaced by AI demand forecasting.</p>
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
          <div className="flex flex-wrap gap-2">
            {(['all', 'morning', 'afternoon', 'evening'] as const).map((window) => {
              const active = timeFocus === window;
              const label = window === 'all' ? 'All day' : window.charAt(0).toUpperCase() + window.slice(1);
              return (
                <button
                  key={window}
                  type="button"
                  onClick={() => setTimeFocus(window)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {(locationFilter || roleFilter || timeFocus !== 'all') && (
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => {
                setLocationFilter('');
                setRoleFilter('');
                setTimeFocus('all');
              }}
            >
              Reset filters
            </button>
          )}
        </div>
        <div className="mt-6 space-y-4">
          {prioritizedShifts.map((assignment) => (
            <article key={`${assignment.staffId}-${assignment.date}-${assignment.startTime}`} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {assignment.date} • {assignment.startTime}-{assignment.endTime}
                  </p>
                  <p className="text-sm text-slate-500">Location: {assignment.location}</p>
                  <p className="text-xs text-slate-500">Role: {assignment.role}</p>
                </div>
                <button
                  type="button"
                  className="self-start rounded-md border border-blue-200 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  onClick={() => handleBid(assignment)}
                >
                  Bid shift
                </button>
              </div>
            </article>
          ))}
          {prioritizedShifts.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No open shifts match the current filters. Adjust persona or time window to discover more opportunities.
            </div>
          )}
        </div>
      </section>

      {opportunityFocus.length > 0 && (
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Opportunity signals</h2>
          <p className="text-sm text-slate-500">
            Target surge windows, multi-site deployments, and premium gigs curated from live demand forecasts.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {opportunityFocus.map((item) => (
              <div key={item.location} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">{item.location}</p>
                <p className="text-xs text-slate-500">Fill rate {item.fillRate}%</p>
                <p className="mt-2 text-xs text-slate-500">Demand: {item.demand} • Scheduled: {item.scheduled}</p>
                <p className="mt-2 text-xs text-blue-600">
                  {item.fillRate < 90
                    ? 'Hotspot — fast-track bid to secure bonus hours.'
                    : 'Healthy coverage — volunteer if you want overtime or cross-training.'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Swap requests</h2>
        <p className="text-sm text-slate-500">
          Propose swaps with teammates while retaining audit trails and keeping compliance automation in the loop.
        </p>
        <div className="mt-4 space-y-4">
          {shifts.map((assignment) => (
            <article key={`${assignment.staffId}-swap-${assignment.date}-${assignment.startTime}`} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">
                    {assignment.date} • {assignment.startTime}-{assignment.endTime}
                  </p>
                  <p className="text-sm text-slate-500">Assigned to: {assignment.staffId}</p>
                </div>
                <select
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  onChange={(event) => handleSwapRequest(assignment, event.target.value, 'Shift trade requested')}
                >
                  <option value="">Swap with…</option>
                  {demoStaff
                    .filter((staff) => staff.id !== assignment.staffId)
                    .map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.displayName}
                      </option>
                    ))}
                </select>
              </div>
            </article>
          ))}
        </div>
        {swapRequests.length > 0 && (
          <div className="mt-6 rounded-md bg-slate-100 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-700">Submitted swap requests</p>
            <ul className="mt-2 space-y-2">
              {swapRequests.map((request) => (
                <li key={request.id}>
                  {request.fromShift.date} {request.fromShift.startTime}-{request.fromShift.endTime} → {request.toStaffId} ({request.reason})
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {message && <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{message}</div>}
    </div>
  );
};
