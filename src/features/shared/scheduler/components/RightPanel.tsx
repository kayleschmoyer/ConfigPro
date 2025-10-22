import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';
import { formatRange } from '../lib/format';
import { differenceInMinutes } from '../lib/time';
import type { LaborLawProfile, Violation } from '../lib';
import type { ShiftWithMeta } from '../hooks/useSchedule';

const minutesToHours = (minutes: number) => `${(minutes / 60).toFixed(1)}h`;

const getWeekKey = (iso: string) => {
  const date = new Date(iso);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date.toISOString().slice(0, 10);
};

const calculateTotals = (shift: ShiftWithMeta | null, shifts: ShiftWithMeta[]) => {
  if (!shift || !shift.employee?.id) {
    return { dayMinutes: 0, weekMinutes: 0 };
  }
  const dayKey = shift.start.slice(0, 10);
  const weekKey = getWeekKey(shift.start);
  let dayMinutes = 0;
  let weekMinutes = 0;
  shifts.forEach((item) => {
    if (item.employee?.id !== shift.employee?.id) return;
    const minutes = differenceInMinutes(item.start, item.end);
    if (item.start.slice(0, 10) === dayKey) {
      dayMinutes += minutes;
    }
    if (getWeekKey(item.start) === weekKey) {
      weekMinutes += minutes;
    }
  });
  return { dayMinutes, weekMinutes };
};

type RightPanelProps = {
  shift: ShiftWithMeta | null;
  shifts: ShiftWithMeta[];
  labor: LaborLawProfile;
  preview: Violation[] | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (shiftId: string) => void;
};

export const RightPanel = ({ shift, shifts, labor, preview, isOpen, onClose, onEdit }: RightPanelProps) => {
  const totals = calculateTotals(shift, shifts);
  const activeViolations = preview ?? shift?.violations ?? [];
  const overtimeDaily = labor.overtime?.dailyOTAfterMin ?? 0;
  const overtimeWeekly = labor.overtime?.weeklyOTAfterMin ?? 0;

  return (
    <aside
      className={cn(
        'sticky top-24 h-[calc(100vh-6rem)] w-[340px] shrink-0 rounded-2xl border border-border bg-background/90 shadow-xl shadow-primary/5 backdrop-blur transition-all duration-200',
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0 pointer-events-none',
      )}
    >
      <div className="flex items-start justify-between border-b border-border/60 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Shift context</h2>
          <p className="text-xs text-muted-foreground">Guardrails, coverage, and totals refresh live as you edit.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="space-y-4 overflow-y-auto px-5 py-5 text-sm text-muted-foreground">
        {shift ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/50 bg-surface/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assignment</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{shift.employee?.displayName ?? 'Unassigned'}</p>
              <p className="text-sm text-muted-foreground">
                {shift.role?.name ?? 'Select role'} · {shift.location?.name ?? 'Location TBD'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{formatRange(shift.start, shift.end)}</p>
              <Button className="mt-4 w-full" size="sm" onClick={() => onEdit(shift.id)}>
                Open in editor
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Daily total" value={minutesToHours(totals.dayMinutes)} cap={overtimeDaily} />
              <StatCard label="Weekly total" value={minutesToHours(totals.weekMinutes)} cap={overtimeWeekly} />
            </div>
            <div className="rounded-2xl border border-border/60 bg-surface/70 p-4">
              <h3 className="text-sm font-semibold text-foreground">Guardrails</h3>
              <div className="mt-3 space-y-3">
                {activeViolations.length ? (
                  activeViolations.map((violation) => (
                    <div key={violation.id} className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">{violation.code}</p>
                      <p className="text-sm text-foreground">{violation.message}</p>
                      {violation.suggestion && (
                        <p className="text-xs text-muted-foreground">Suggestion: {violation.suggestion}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-600">
                    No guardrail issues detected.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-surface/70 p-4">
              <h3 className="text-sm font-semibold text-foreground">Quick facts</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <span className="text-muted-foreground">Break:</span>{' '}
                  <span className="font-semibold text-foreground">{shift.breakMin ?? 0} minutes</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  <span className="font-semibold text-foreground">{shift.status ?? 'Draft'}</span>
                </li>
                {shift.flags?.length ? (
                  <li>
                    <span className="text-muted-foreground">Flags:</span>{' '}
                    <span className="font-semibold text-foreground">{shift.flags.join(', ')}</span>
                  </li>
                ) : null}
                {shift.notes && (
                  <li>
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="mt-1 rounded-xl bg-background/80 px-3 py-2 text-foreground">{shift.notes}</p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-6 text-sm text-muted-foreground">
            Select a shift to review guardrails and totals.
          </div>
        )}
      </div>
    </aside>
  );
};

type StatCardProps = {
  label: string;
  value: string;
  cap?: number;
};

const StatCard = ({ label, value, cap }: StatCardProps) => (
  <div className="rounded-2xl border border-border/50 bg-surface/70 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    {cap ? <p className="text-xs text-muted-foreground">Cap: {minutesToHours(cap)}</p> : null}
  </div>
);
