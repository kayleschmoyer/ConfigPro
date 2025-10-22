import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { useClockContext } from '../hooks/ClockProvider';
import { useExceptions } from '../hooks/useExceptions';
import { ExceptionRow } from '../components/ExceptionRow';

export const Exceptions = () => {
  const { state } = useClockContext();
  const { filtered, search, setSearch, severity, setSeverity, resolve, reopen, metrics } = useExceptions(state.employees);

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Exception dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {metrics.unresolvedCount} open • {metrics.criticalCount} critical • Next SLA {metrics.nextSLA}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search employee"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-48"
          />
          <Select value={severity} onChange={(event) => setSeverity(event.target.value as typeof severity)}>
            <option value="ALL">All severities</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warnings</option>
            <option value="CRITICAL">Critical</option>
          </Select>
        </div>
      </header>

      <div className="grid gap-4">
        {filtered.map((item) => {
          const employee = state.employees.find((emp) => emp.id === item.employeeId);
          return (
            <ExceptionRow
              key={item.id}
              item={item}
              employee={employee}
              onResolve={(exception) => resolve(exception.id, state.selectedEmployee?.displayName ?? 'You')}
              onReopen={(exception) => reopen(exception.id)}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 text-sm text-muted-foreground">
            No anomalies at this time. Policy guardrails are holding steady.
          </div>
        )}
      </div>
    </div>
  );
};
