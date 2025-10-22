import { Drawer } from '../../../../shared/ui/Drawer';
import { Button } from '../../../../shared/ui/Button';
import type { SyncJob } from '../lib/types';
import { formatDuration, formatNumber, formatRelative, formatTimestamp } from '../lib/format';

interface RunDetailDrawerProps {
  job: (SyncJob & {
    lastRunRelative: string;
    runtimeSummary: string;
    nextRunCountdown: string;
    health: string;
  }) | null;
  open: boolean;
  onClose: () => void;
  onRetry: (id: string) => void;
}

export function RunDetailDrawer({ job, open, onClose, onRetry }: RunDetailDrawerProps) {
  return (
    <Drawer
      isOpen={open}
      onClose={onClose}
      title={job ? `Run detail — ${job.domain}` : 'Run detail'}
      description={job ? `Job ${job.id} • ${job.status}` : undefined}
      footer={
        job && (
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Next run {job.nextRunCountdown}</span>
            <Button onClick={() => onRetry(job.id)}>Retry failed items</Button>
          </div>
        )
      }
    >
      {!job ? (
        <p className="text-sm text-muted">Choose a sync job to inspect the most recent run, durations and retries.</p>
      ) : (
        <div className="space-y-6 text-sm text-foreground/80">
          <section className="grid gap-3 md:grid-cols-2">
            <Stat label="Last run" value={formatTimestamp(job.lastRun?.at)} helper={job.lastRunRelative} />
            <Stat label="Duration" value={job.lastRun ? formatDuration(job.lastRun.durationMs) : '—'} />
            <Stat label="Processed" value={job.lastRun ? formatNumber(job.lastRun.processed) : '0'} />
            <Stat label="Failed" value={job.lastRun ? formatNumber(job.lastRun.failed) : '0'} helper={job.runtimeSummary} />
          </section>
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Retry timeline</h3>
            <ul className="space-y-2">
              {[0, 1, 2].map((attempt) => (
                <li key={attempt} className="rounded-3xl bg-surface/70 px-4 py-3">
                  Attempt {attempt + 1} • {formatRelative(new Date(Date.now() - attempt * 60000).toISOString())}
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Diff summary</h3>
            <div className="rounded-3xl bg-surface/70 p-4 font-mono text-xs text-foreground/80">
              {JSON.stringify({ updated: 24, inserted: 8, deleted: 1 }, null, 2)}
            </div>
          </section>
        </div>
      )}
    </Drawer>
  );
}

interface StatProps {
  label: string;
  value: string;
  helper?: string;
}

const Stat = ({ label, value, helper }: StatProps) => (
  <div className="rounded-3xl border border-border/40 bg-surface/80 px-5 py-4 shadow-inner shadow-primary/5">
    <p className="text-xs uppercase tracking-[0.3em] text-muted">{label}</p>
    <p className="mt-1 text-sm text-foreground">{value}</p>
    {helper && <p className="text-xs text-muted/80">{helper}</p>}
  </div>
);
