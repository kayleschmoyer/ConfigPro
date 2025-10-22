import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { formatClockTime, formatDuration } from '../lib/format';
import { useClockContext } from '../hooks/ClockProvider';

const quickActions = [
  { label: 'Clock In/Out', path: '/time-clock/clock' },
  { label: 'Start Break', path: '/time-clock/clock?mode=break-start' },
  { label: 'My Timesheet', path: '/time-clock/timesheets' },
  { label: 'Request PTO', path: '/time-clock/timesheets?tab=pto' },
  { label: 'View Schedule', path: '/time-clock/scheduling' },
  { label: 'Approvals', path: '/time-clock/approvals', roles: ['LEAD', 'MANAGER', 'PAYROLL'] },
  { label: 'Exceptions', path: '/time-clock/exceptions', roles: ['LEAD', 'MANAGER', 'PAYROLL'] },
  { label: 'Reports', path: '/time-clock/reports', roles: ['MANAGER', 'PAYROLL'] },
];

export const TimeClockHome = () => {
  const navigate = useNavigate();
  const { state, status, currentShift } = useClockContext();

  const actions = useMemo(() => {
    return quickActions.filter((action) => {
      if (!action.roles) return true;
      const role = state.selectedEmployee?.role ?? state.employees[0]?.role;
      return action.roles.includes(role ?? 'EMP');
    });
  }, [state.employees, state.selectedEmployee]);

  const activePunch = state.activePunch;

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent p-8 text-white shadow-2xl shadow-black/40">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/30">ConfigPro Workforce</p>
          <h1 className="mt-3 text-4xl font-semibold">The world’s most trusted Time Clock</h1>
          <p className="mt-3 text-sm text-white/80">
            Lightning-fast punches, bulletproof compliance, and delightful kiosk experiences for every device.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="rounded-full border border-white/20 px-4 py-2">
              Status: {status.replace('_', ' ')}
            </span>
            {activePunch && (
              <span className="rounded-full border border-white/20 px-4 py-2">
                Clocked in since {formatClockTime(activePunch.timestamp)}
              </span>
            )}
            {currentShift && (
              <span className="rounded-full border border-white/20 px-4 py-2">
                Break due in {formatDuration(currentShift.nextBreakDueMinutes)}
              </span>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Quick actions</h2>
        <p className="text-sm text-muted-foreground">High-impact flows optimized for kiosk, web, and mobile.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {actions.map((action) => (
            <Button
              key={action.path}
              variant="outline"
              size="lg"
              onClick={() => navigate(action.path)}
              className="h-28 flex-col items-start justify-center rounded-3xl bg-white/5 text-left text-base text-white shadow-lg shadow-black/30"
            >
              <span className="text-sm uppercase tracking-[0.3em] text-primary/50">Go to</span>
              <span className="text-xl font-semibold">{action.label}</span>
            </Button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 text-sm text-muted-foreground">
          <h3 className="text-lg font-semibold text-white">Smart cues</h3>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              <span>
                {state.selectedEmployee
                  ? `${state.selectedEmployee.displayName} is ${status.replace('_', ' ').toLowerCase()}.`
                  : 'Select an employee to begin.'}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
              <span>
                {currentShift
                  ? `Next break due in ${formatDuration(currentShift.nextBreakDueMinutes)}.`
                  : 'No active shift. Clock in to start tracking.'}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" aria-hidden />
              <span>
                {state.offlineQueue.events.length > 0
                  ? `${state.offlineQueue.events.length} punch queued offline. Keep device online to sync.`
                  : 'Offline queue empty. Punches are syncing instantly.'}
              </span>
            </li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 text-sm text-muted-foreground">
          <h3 className="text-lg font-semibold text-white">Device readiness</h3>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">Anti-buddy toolkit enabled</p>
          <ul className="mt-4 space-y-3">
            <li>• Selfie capture {state.policy?.antiBuddy?.selfieRequired ? 'required' : 'optional'}.</li>
            <li>• Random liveness checks {state.policy?.antiBuddy?.livenessRandom ? 'active' : 'off'}.</li>
            <li>• Daily rotating QR {state.policy?.antiBuddy?.rotatingQR ? 'enabled' : 'disabled'}.</li>
          </ul>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/time-clock/policies')}
          >
            Configure policies
          </Button>
        </div>
      </section>
    </div>
  );
};
