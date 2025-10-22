import { useMemo } from 'react';
import { Button } from '../../../shared/ui/Button';
import { useClockContext } from '../hooks/ClockProvider';
import { ClockStatusCard } from '../components/ClockStatusCard';
import { formatDuration } from '../lib/format';

export const Breaks = () => {
  const { state, status, currentShift, submitPunch } = useClockContext();

  const policyCopy = useMemo(() => {
    const breaks = state.policy?.breaks;
    if (!breaks) return 'No break policy configured.';
    const meal = breaks.mealRequired
      ? `Meal ${breaks.mealMin ?? 30} min`
      : 'Meal optional';
    const second = breaks.secondMealAfterMin
      ? `Second meal after ${formatDuration(breaks.secondMealAfterMin)}`
      : 'No second meal rule';
    return `${meal} • ${second} • Paid break ${breaks.paidBreakMin ?? 10} min`;
  }, [state.policy?.breaks]);

  const handleBreak = async (type: 'BREAK_START' | 'BREAK_END') => {
    if (!state.selectedEmployee) return;
    await submitPunch({
      employee: state.selectedEmployee,
      punchType: type,
      jobCode: state.selectedEmployee.defaultJobCode,
    });
  };

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[420px_1fr] lg:p-10">
      <div className="space-y-4">
        <ClockStatusCard
          status={status}
          employee={state.selectedEmployee}
          activePunch={state.activePunch}
          currentShift={currentShift}
          offlineQueue={state.offlineQueue}
        />
        <div className="rounded-3xl border border-white/10 bg-surface/70 p-6 text-sm text-muted-foreground">
          <h2 className="text-lg font-semibold text-white">Break policy</h2>
          <p className="mt-3">{policyCopy}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted">Grace</p>
          <p>
            Clock-in grace {state.policy?.grace?.inMin ?? 0} min • Clock-out grace {state.policy?.grace?.outMin ?? 0} min
          </p>
        </div>
      </div>
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl shadow-black/30">
          <h2 className="text-lg font-semibold text-white">Manage break</h2>
          <p className="text-sm text-muted-foreground">Policy enforcement keeps your team compliant automatically.</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleBreak('BREAK_START')}
              disabled={status !== 'CLOCKED_IN'}
            >
              Start break
            </Button>
            <Button size="lg" onClick={() => handleBreak('BREAK_END')} disabled={status !== 'ON_BREAK'}>
              End break
            </Button>
          </div>
          <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-white/5 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Minimum</p>
              <p className="text-lg font-semibold text-white">{state.policy?.breaks?.mealMin ?? 30} minutes</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Auto-end</p>
              <p className="text-lg font-semibold text-white">
                {state.policy?.breaks?.secondMealAfterMin
                  ? formatDuration(state.policy?.breaks?.secondMealAfterMin ?? 0)
                  : 'Off'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
