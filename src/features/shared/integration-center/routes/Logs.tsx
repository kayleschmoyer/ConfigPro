import { useLogs } from '../hooks/useLogs';
import { LogsTable } from '../components/LogsTable';

export function LogsRoute() {
  const { events, total, range, scrollTo, selected, setSelected, filters, updateFilter } = useLogs();

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-semibold text-foreground">Unified logs</h2>
        <p className="text-sm text-muted">Filter by connector, job, severity and correlation IDs. Export with one click.</p>
      </header>
      <LogsTable
        events={events}
        total={total}
        range={range}
        onRangeChange={(start) => scrollTo(start)}
        onSelect={(event) => setSelected(event)}
        selected={selected}
        filters={filters}
        onFilterChange={updateFilter}
      />
    </div>
  );
}
