import { useCallback, useMemo, useState } from 'react';
import type { LogEvent } from '../lib';
import { formatRelative } from '../lib/format';

type FilterState = {
  connectorId?: string;
  jobId?: string;
  level?: LogEvent['level'];
  query?: string;
};

const generateLog = (index: number): LogEvent => ({
  id: `log-${index}`,
  at: new Date(Date.now() - index * 1000 * 12).toISOString(),
  level: index % 11 === 0 ? 'ERROR' : index % 5 === 0 ? 'WARN' : 'INFO',
  connectionId: index % 3 === 0 ? 'conn-1' : undefined,
  jobId: index % 4 === 0 ? 'job-1' : undefined,
  correlationId: index % 7 === 0 ? `corr-${Math.floor(index / 7)}` : undefined,
  code: index % 5 === 0 ? 'SYNC_DELAY' : 'SYNC_OK',
  message: index % 11 === 0 ? 'Failed to sync invoices' : 'Sync completed successfully',
  details: { index },
  redacted: index % 13 === 0
});

const allEvents = Array.from({ length: 750 }, (_, index) => generateLog(index + 1));

export function useLogs() {
  const [filters, setFilters] = useState<FilterState>({});
  const [range, setRange] = useState({ start: 0, end: 50 });
  const [selected, setSelected] = useState<LogEvent | null>(null);

  const updateFilter = useCallback((patch: Partial<FilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setRange({ start: 0, end: 50 });
  }, []);

  const filtered = useMemo(() => {
    return allEvents.filter((event) => {
      if (filters.connectorId && event.connectionId !== filters.connectorId) return false;
      if (filters.jobId && event.jobId !== filters.jobId) return false;
      if (filters.level && event.level !== filters.level) return false;
      if (filters.query && !event.message.toLowerCase().includes(filters.query.toLowerCase())) return false;
      return true;
    });
  }, [filters]);

  const virtual = useMemo(() => filtered.slice(range.start, range.end), [filtered, range]);

  const scrollTo = useCallback((startIndex: number) => {
    const size = range.end - range.start;
    setRange({ start: startIndex, end: startIndex + size });
  }, [range.end, range.start]);

  const enriched = useMemo(
    () =>
      virtual.map((event) => ({
        ...event,
        atRelative: formatRelative(event.at)
      })),
    [virtual]
  );

  return {
    filters,
    updateFilter,
    events: enriched,
    total: filtered.length,
    range,
    scrollTo,
    setRange,
    selected,
    setSelected
  };
}
