import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';
import { sampleAvailability, sampleCoverage, sampleEmployees, sampleLabor, sampleLocations, sampleRoles, sampleShifts } from '../lib/constants';
import type { SchedulerContext } from '../lib';
import { useAutoScheduler } from '../hooks/useAutoScheduler';

const demoContext: SchedulerContext = {
  roles: sampleRoles,
  locations: sampleLocations,
  employees: sampleEmployees,
  coverage: sampleCoverage,
  labor: sampleLabor,
  availability: sampleAvailability,
};

export const AutoScheduler = () => {
  const [appliedPlan, setAppliedPlan] = useState(sampleShifts);
  const auto = useAutoScheduler({ context: demoContext, shifts: appliedPlan, onApply: setAppliedPlan });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-foreground">Auto-scheduler</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          ConfigPro’s heuristic blends a feasibility pass that respects every guardrail with a refinement loop to minimise overtime
          and keep fairness front-and-centre. Run a dry plan to review guardrails, then apply when you’re confident.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" size="sm" onClick={() => void auto.run()} disabled={auto.isRunning}>
          {auto.isRunning ? 'Evaluating…' : 'Dry run plan'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => auto.apply()}
          disabled={!auto.result || (auto.result?.violations.some((violation) => violation.kind === 'HARD') ?? false)}
        >
          Apply to demo grid
        </Button>
      </div>
      {auto.result && (
        <div className="grid gap-4 rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur md:grid-cols-3">
          <Metric label="Total score" value={auto.result.scores.total.toFixed(2)} helper="Higher is better" />
          <Metric label="Fairness" value={auto.result.scores.fairness.toFixed(2)} helper="1.0 = perfectly balanced" />
          <Metric label="Coverage" value={(auto.result.scores.coverage * 100).toFixed(0) + '%'} helper="Required shifts staffed" />
          <Metric label="Preferences" value={(auto.result.scores.prefs * 100).toFixed(0) + '%'} helper="Employee preferences" />
          <Metric label="Cost efficiency" value={auto.result.scores.cost.toFixed(2)} helper="Normalised cost score" />
          <Metric label="OT alerts" value={String(auto.result.scores.overtime)} helper="Soft guardrail notices" tone="text-amber-500" />
          <div className="md:col-span-3 rounded-2xl border border-border/60 bg-background/70 p-4">
            <h3 className="text-sm font-semibold text-foreground">Violations</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {auto.result.violations.length ? (
                auto.result.violations.map((violation) => (
                  <li key={violation.id} className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">{violation.kind}</span>{' '}
                    {violation.message}
                  </li>
                ))
              ) : (
                <li>No guardrail warnings — ready to publish.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const Metric = ({ label, value, helper, tone }: { label: string; value: string; helper?: string; tone?: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={cn('mt-1 text-lg font-semibold text-foreground', tone)}>{value}</p>
    {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
  </div>
);
