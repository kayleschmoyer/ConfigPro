import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/Table';
import { Button } from '@/shared/ui/Button';
import { formatClockTime, formatDate, formatDuration } from '../lib/format';
import type { TimesheetEntry } from '../lib/types';

const ROW_HEIGHT = 72;
const BUFFER_ROWS = 6;

export type TimesheetTableProps = {
  entries: TimesheetEntry[];
  onEdit?: (entry: TimesheetEntry) => void;
  onApprove?: (entries: TimesheetEntry[]) => void;
  selectedIds?: string[];
  allowBulkActions?: boolean;
  onSelect?: (entryId: string) => void;
};

export const TimesheetTable = ({
  entries,
  onEdit,
  onApprove,
  selectedIds = [],
  allowBulkActions = false,
  onSelect,
}: TimesheetTableProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(ROW_HEIGHT * 8);

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    const target = event.currentTarget;
    setScrollTop(target.scrollTop);
    setViewportHeight(target.clientHeight);
  };

  const { startIndex, endIndex, visible } = useMemo(() => {
    const start = Math.floor(scrollTop / ROW_HEIGHT);
    const viewportRows = Math.ceil(viewportHeight / ROW_HEIGHT) + BUFFER_ROWS;
    const end = Math.min(entries.length, start + viewportRows);
    return {
      startIndex: start,
      endIndex: end,
      visible: entries.slice(start, end),
    };
  }, [entries, scrollTop, viewportHeight]);

  const isSelected = (id: string) => selectedIds.includes(id);

  return (
    <TableContainer className="max-h-[520px] overflow-hidden bg-surface/80">
      <div className="max-h-[520px] overflow-auto" onScroll={handleScroll}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Job</TableHead>
              <TableHead className="text-right">Reg</TableHead>
              <TableHead className="text-right">OT</TableHead>
              <TableHead className="text-right">DT</TableHead>
              <TableHead className="text-right">Break</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow aria-hidden style={{ height: startIndex * ROW_HEIGHT }} />
            {visible.map((entry) => (
              <TableRow
                key={entry.id}
                data-state={isSelected(entry.id) ? 'selected' : undefined}
                className={cn('transition-colors', onSelect && 'cursor-pointer')}
                style={{ height: ROW_HEIGHT }}
                onClick={() => onSelect?.(entry.id)}
              >
                <TableCell className="whitespace-nowrap font-medium">{formatDate(entry.start)}</TableCell>
                <TableCell>{formatClockTime(entry.start)}</TableCell>
                <TableCell>{entry.end ? formatClockTime(entry.end) : '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground/90">{entry.jobCode ?? '—'}</span>
                    {entry.costCenter && (
                      <span className="text-xs text-muted-foreground">{entry.costCenter}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">{formatDuration(entry.regularMinutes)}</TableCell>
                <TableCell className="text-right text-amber-300">{formatDuration(entry.otMinutes)}</TableCell>
                <TableCell className="text-right text-rose-300">{formatDuration(entry.dtMinutes)}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDuration(entry.breakMinutes)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    {entry.approved && <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">Approved</span>}
                    {entry.locked && <span className="rounded-full bg-slate-500/20 px-2 py-1 text-xs text-slate-200">Locked</span>}
                    {entry.exceptions?.map((exception) => (
                      <span
                        key={exception}
                        className="rounded-full bg-amber-500/20 px-2 py-1 text-xs uppercase tracking-wide text-amber-200"
                      >
                        {exception.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit?.(entry);
                      }}
                      className="text-xs font-semibold uppercase tracking-wide"
                    >
                      Edit
                    </Button>
                    {allowBulkActions ? null : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          onApprove?.([entry]);
                        }}
                        disabled={entry.approved}
                        className="text-xs font-semibold uppercase tracking-wide"
                      >
                        {entry.approved ? 'Approved' : 'Approve'}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow aria-hidden style={{ height: (entries.length - endIndex) * ROW_HEIGHT }} />
          </TableBody>
        </Table>
      </div>
      {allowBulkActions && selectedIds.length > 0 && (
        <div className="flex items-center justify-between border-t border-white/10 bg-surface/80 px-6 py-4 text-sm">
          <span>{selectedIds.length} entries selected</span>
          <Button size="sm" onClick={() => onApprove?.(entries.filter((entry) => selectedIds.includes(entry.id)))}>
            Approve selected
          </Button>
        </div>
      )}
    </TableContainer>
  );
};
