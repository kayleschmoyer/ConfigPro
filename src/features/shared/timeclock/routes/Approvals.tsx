import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useClockContext } from '../hooks/ClockProvider';
import { useApprovals } from '../hooks/useApprovals';
import { formatDate } from '../lib/format';

export const Approvals = () => {
  const { state } = useClockContext();
  const { filtered, summary, search, setSearch, selectedEmployeeId, setSelectedEmployeeId, decide } = useApprovals(
    state.employees
  );

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Pending approvals</h2>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search team"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-48"
          />
          <Input
            placeholder="Employee ID"
            value={selectedEmployeeId ?? ''}
            onChange={(event) => setSelectedEmployeeId(event.target.value)}
            className="w-36"
          />
        </div>
      </header>

      <div className="grid gap-4">
        {filtered.map((item) => {
          const employee = state.employees.find((emp) => emp.id === item.employeeId);
          return (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl shadow-black/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {employee?.role ?? 'EMP'} • Pending since {formatDate(item.pendingSince)}
                  </p>
                  <h3 className="text-lg font-semibold text-white">{employee?.displayName ?? item.employeeId}</h3>
                  <p className="text-sm text-muted-foreground">
                    Period {formatDate(item.periodStart)} – {formatDate(item.periodEnd)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => decide(item.id, 'REQUEST_CHANGES')}>
                    Request changes
                  </Button>
                  <Button variant="ghost" onClick={() => decide(item.id, 'REJECT')}>
                    Reject
                  </Button>
                  <Button onClick={() => decide(item.id, 'APPROVE')}>Approve</Button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-background/40 p-4 text-xs text-muted-foreground">
                <p>Entries pending: {item.entries.length || 'Imported from queue (demo)'}</p>
                <p>Notes sync to payroll when approved.</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-surface/70 p-6 text-sm text-muted-foreground">
            All approvals are up to date. Enjoy the calm.
          </div>
        )}
      </div>
    </div>
  );
};
