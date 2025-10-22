import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { sampleEmployees } from '../lib/constants';
import { useAvailability } from '../hooks/useAvailability';

export const Availability = () => {
  const availability = useAvailability({ employees: sampleEmployees });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-foreground">Availability & PTO guardrails</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage recurring availability, one-off exceptions, and PTO requests. These guardrails drive the live drag-and-drop
          experience and auto-scheduler eligibility.
        </p>
      </header>
      <section className="rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center gap-4">
          <Select label="Employee" className="min-w-[200px]">
            {availability.employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.displayName}
              </option>
            ))}
          </Select>
          <Input type="date" label="Exception date" />
          <Button size="sm">Add exception</Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {availability.employees.map((employee) => {
            const rules = availability.getEmployeeAvailability(employee.id);
            return (
              <div key={employee.id} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <h3 className="text-sm font-semibold text-foreground">{employee.displayName}</h3>
                <p className="text-xs text-muted-foreground">{employee.roles.join(', ')}</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {rules.map((rule) => (
                    <li key={rule.id} className="flex items-center justify-between">
                      <span>
                        {rule.kind === 'AVAILABLE' ? 'Available' : 'Unavailable'} ·{' '}
                        {new Date(rule.start).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })} –{' '}
                        {new Date(rule.end).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => availability.removeRule(rule.id)}>
                        Remove
                      </Button>
                    </li>
                  ))}
                  {rules.length === 0 && <li>No guardrails yet — add a recurring rule or exception.</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
