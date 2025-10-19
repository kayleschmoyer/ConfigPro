import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { getSchedulingApi } from '../../api';
import { createSchedulingContext } from '../../modules/scheduling';
import type { ScheduleDraft, ShiftAssignment } from '../../modules/scheduling';
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

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">My availability</h2>
        <p className="text-sm text-slate-500">Share preferred hours to influence automated scheduling.</p>
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
        <div className="mt-6 space-y-4">
          {shifts.map((assignment) => (
            <article key={`${assignment.staffId}-${assignment.date}-${assignment.startTime}`} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {assignment.date} • {assignment.startTime}-{assignment.endTime}
                  </p>
                  <p className="text-sm text-slate-500">Location: {assignment.location}</p>
                </div>
                <button
                  type="button"
                  className="rounded-md border border-blue-200 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  onClick={() => handleBid(assignment)}
                >
                  Bid shift
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Swap requests</h2>
        <p className="text-sm text-slate-500">Propose swaps with teammates while retaining audit trails.</p>
        <div className="mt-4 space-y-4">
          {shifts.map((assignment) => (
            <article key={`${assignment.staffId}-swap-${assignment.date}-${assignment.startTime}`} className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
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
                  {request.fromShift.date} {request.fromShift.startTime}-{request.fromShift.endTime} →{' '}
                  {request.toStaffId} ({request.reason})
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
