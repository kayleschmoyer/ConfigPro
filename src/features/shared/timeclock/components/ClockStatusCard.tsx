import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';
import { formatClockTime, formatDateTime, formatDuration } from '../lib/format';
import type { Employee, OfflineQueueSnapshot, Punch } from '../lib';

const statusColors: Record<string, string> = {
  CLOCKED_IN: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  CLOCKED_OUT: 'bg-slate-500/20 text-slate-200 border border-slate-400/30',
  ON_BREAK: 'bg-amber-500/20 text-amber-200 border border-amber-400/30',
};

export type ClockStatusCardProps = {
  status: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK';
  employee?: Employee;
  activePunch?: Punch;
  currentShift?: { nextBreakDueMinutes: number; otTriggered: boolean; flags: string[] };
  offlineQueue: OfflineQueueSnapshot<Punch>;
  onViewTimesheet?: () => void;
};

export const ClockStatusCard = ({
  status,
  employee,
  activePunch,
  currentShift,
  offlineQueue,
  onViewTimesheet,
}: ClockStatusCardProps) => {
  const label = status.replace('_', ' ');
  const offlineCount = offlineQueue.events.filter((event) => event.status !== 'synced').length;

  return (
    <motion.section
      layout
      className="relative flex flex-col gap-6 rounded-3xl border border-white/5 bg-surface/70 p-6 shadow-lg shadow-black/30 backdrop-blur"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', statusColors[status])}>
            {label}
          </span>
          {activePunch && (
            <span className="text-sm text-muted-foreground">
              {`Since ${formatClockTime(activePunch.timestamp)}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {offlineCount > 0 && <span className="rounded-full bg-amber-500/20 px-3 py-1 text-amber-200">{offlineCount} punch queued</span>}
          <Button variant="outline" size="sm" onClick={onViewTimesheet} className="hidden md:inline-flex">
            My Timesheet
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {employee?.photoUrl ? (
            <img
              src={employee.photoUrl}
              alt={employee.displayName}
              className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-surface/80 text-xl font-semibold">
              {employee?.displayName.slice(0, 2) ?? '--'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-foreground">{employee?.displayName ?? 'No employee selected'}</h2>
            <p className="text-sm text-muted-foreground">
              {activePunch
                ? `Clocked in from ${activePunch.device?.name ?? 'device'} • ${formatDateTime(activePunch.timestamp)}`
                : 'Authenticate to start your shift'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="rounded-2xl border border-white/5 bg-background/40 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-muted">Next break</div>
            <div className="text-lg font-semibold text-foreground">
              {currentShift ? formatDuration(currentShift.nextBreakDueMinutes) : '—'}
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-background/40 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-muted">Overtime</div>
            <div className="text-lg font-semibold text-foreground">
              {currentShift?.otTriggered ? 'Triggered' : 'On track'}
            </div>
          </div>
        </div>
      </div>

      {currentShift?.flags?.length ? (
        <div className="flex flex-wrap gap-2 text-xs text-amber-200">
          {currentShift.flags.map((flag) => (
            <span key={flag} className="rounded-full bg-amber-500/20 px-3 py-1 uppercase tracking-wide">
              {flag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      ) : null}

      {offlineQueue.events.length > 0 && (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/10 p-4 text-sm text-primary/90">
          <p className="font-semibold">Offline punches queued</p>
          <ul className="mt-2 space-y-1">
            {offlineQueue.events.slice(0, 3).map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-3">
                <span>{formatDateTime(event.payload.timestamp)}</span>
                <span className="text-xs uppercase tracking-wide text-primary/70">{event.status}</span>
              </li>
            ))}
            {offlineQueue.events.length > 3 && (
              <li className="text-xs text-primary/70">+{offlineQueue.events.length - 3} more queued</li>
            )}
          </ul>
        </div>
      )}
    </motion.section>
  );
};
