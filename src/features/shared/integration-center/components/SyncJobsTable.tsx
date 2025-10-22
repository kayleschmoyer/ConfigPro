import { Button } from '@/shared/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableContainer
} from '@/shared/ui/Table';
import type { SyncJob } from '../lib/types';
import { EnvBadge } from './EnvBadge';

interface SyncJobsTableProps {
  jobs: Array<SyncJob & {
    lastRunRelative: string;
    runtimeSummary: string;
    nextRunCountdown: string;
    health: string;
  }>;
  activeJobId: string | null;
  onSelect: (id: string) => void;
  onRunNow: (id: string) => void;
  onTogglePause: (id: string) => void;
}

const healthColor: Record<string, string> = {
  CONNECTED: 'bg-emerald-400/10 text-emerald-200 border border-emerald-400/30',
  PAUSED: 'bg-sky-400/10 text-sky-200 border border-sky-400/30',
  FAILING: 'bg-rose-400/10 text-rose-200 border border-rose-400/30',
  DEGRADED: 'bg-amber-400/10 text-amber-200 border border-amber-400/30'
};

export function SyncJobsTable({ jobs, activeJobId, onSelect, onRunNow, onTogglePause }: SyncJobsTableProps) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Connector</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow
              key={job.id}
              data-state={job.id === activeJobId ? 'selected' : undefined}
              className="cursor-pointer"
              onClick={() => onSelect(job.id)}
            >
              <TableCell className="flex items-center gap-3">
                <EnvBadge environment={job.connectionId === 'conn-1' ? 'PROD' : 'SANDBOX'} />
                <span className="text-sm text-foreground">{job.connectionId}</span>
              </TableCell>
              <TableCell className="text-sm uppercase tracking-[0.2em] text-muted">{job.domain}</TableCell>
              <TableCell>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${healthColor[job.health]}`}>{job.health}</span>
              </TableCell>
              <TableCell>
                <div className="text-sm text-foreground">{job.lastRunRelative}</div>
                <div className="text-xs text-muted">{job.lastRun?.result ?? '—'}</div>
              </TableCell>
              <TableCell>{job.nextRunCountdown}</TableCell>
              <TableCell className="max-w-[240px] text-xs text-muted">{job.runtimeSummary}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); onRunNow(job.id); }}>
                  Run now
                </Button>
                <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); onTogglePause(job.id); }}>
                  {job.status === 'PAUSED' ? 'Resume' : 'Pause'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
