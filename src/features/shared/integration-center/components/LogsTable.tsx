import { useRef } from 'react';
import { Button } from '../../../../shared/ui/Button';
import { Input } from '../../../../shared/ui/Input';
import { Select } from '../../../../shared/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '../../../../shared/ui/Table';
import type { LogEvent } from '../lib/types';

interface LogsTableProps {
  events: Array<LogEvent & { atRelative: string }>;
  total: number;
  range: { start: number; end: number };
  onRangeChange: (start: number) => void;
  onSelect: (event: LogEvent) => void;
  selected: LogEvent | null;
  filters: {
    connectorId?: string;
    jobId?: string;
    level?: LogEvent['level'];
    query?: string;
  };
  onFilterChange: (patch: Partial<LogsTableProps['filters']>) => void;
}

const severityColor: Record<LogEvent['level'], string> = {
  INFO: 'text-muted',
  WARN: 'text-amber-300',
  ERROR: 'text-rose-300'
};

export function LogsTable({
  events,
  total,
  range,
  onRangeChange,
  onSelect,
  selected,
  filters,
  onFilterChange
}: LogsTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const progress = scrollTop / (scrollHeight - clientHeight);
    const startIndex = Math.floor(progress * Math.max(total - (range.end - range.start), 0));
    onRangeChange(startIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          label="Search"
          placeholder="Search message"
          value={filters.query ?? ''}
          onChange={(event) => onFilterChange({ query: event.target.value })}
          className="w-64"
        />
        <Select
          label="Level"
          value={filters.level ?? ''}
          onChange={(event) => onFilterChange({ level: (event.target.value as LogEvent['level']) || undefined })}
        >
          <option value="">Any</option>
          <option value="INFO">Info</option>
          <option value="WARN">Warn</option>
          <option value="ERROR">Error</option>
        </Select>
        <Input
          label="Connector"
          value={filters.connectorId ?? ''}
          onChange={(event) => onFilterChange({ connectorId: event.target.value || undefined })}
          placeholder="conn-1"
        />
        <Input
          label="Job"
          value={filters.jobId ?? ''}
          onChange={(event) => onFilterChange({ jobId: event.target.value || undefined })}
          placeholder="job-1"
        />
        <Button variant="outline" onClick={() => onFilterChange({ query: '', level: undefined, connectorId: undefined, jobId: undefined })}>
          Clear filters
        </Button>
        <Button variant="ghost">Export CSV</Button>
      </div>
      <TableContainer ref={containerRef} onScroll={handleScroll} className="max-h-[520px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Correlation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow
                key={event.id}
                className="cursor-pointer"
                data-state={selected?.id === event.id ? 'selected' : undefined}
                onClick={() => onSelect(event)}
              >
                <TableCell className="text-xs text-muted">{event.atRelative}</TableCell>
                <TableCell className={`text-xs font-semibold ${severityColor[event.level]}`}>{event.level}</TableCell>
                <TableCell className="max-w-[360px] text-sm text-foreground/80">{event.message}</TableCell>
                <TableCell className="text-xs text-muted">{event.correlationId ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="text-xs text-muted">
        Showing {range.start + 1} – {Math.min(range.end, total)} of {total} events
      </div>
      {selected && (
        <aside className="rounded-3xl border border-border/60 bg-surface/70 p-6 text-sm text-foreground/80">
          <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Event detail</h3>
          <p className="mt-2 font-semibold text-foreground">{selected.message}</p>
          <div className="mt-2 grid gap-2 text-xs text-muted">
            <span>Code: {selected.code ?? '—'}</span>
            <span>Correlation: {selected.correlationId ?? '—'}</span>
            <span>Redacted: {selected.redacted ? 'Yes' : 'No'}</span>
          </div>
          <pre className="mt-4 max-h-48 overflow-auto rounded-2xl bg-surface/90 p-4 text-xs text-foreground/80">
            {JSON.stringify(selected.details ?? {}, null, 2)}
          </pre>
        </aside>
      )}
    </div>
  );
}
