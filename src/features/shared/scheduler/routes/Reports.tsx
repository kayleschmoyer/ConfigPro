import { cn } from '@/lib/cn';

const reports = [
  { label: 'Coverage attainment', value: '95%', helper: 'Week to date vs requirement', tone: 'text-emerald-500' },
  { label: 'Overtime forecast', value: '4.2h', helper: 'Projected OT this week', tone: 'text-amber-500' },
  { label: 'Fairness index', value: '0.88', helper: '1.0 = perfectly balanced' },
  { label: 'Compliance events', value: '2', helper: 'Pending manager review', tone: 'text-amber-500' },
];

export const Reports = () => (
  <div className="space-y-6">
    <header className="space-y-2">
      <h2 className="text-2xl font-semibold text-foreground">Scheduling analytics</h2>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Monitor coverage, overtime exposure, fairness, and guardrail compliance to stay ahead of staffing risk.
      </p>
    </header>
    <div className="grid gap-4 md:grid-cols-4">
      {reports.map((report) => (
        <div key={report.label} className="rounded-2xl border border-border bg-surface/70 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{report.label}</p>
          <p className={cn('mt-2 text-2xl font-semibold text-foreground', report.tone)}>{report.value}</p>
          <p className="text-xs text-muted-foreground">{report.helper}</p>
        </div>
      ))}
    </div>
    <div className="rounded-2xl border border-border bg-surface/70 p-6">
      <h3 className="text-sm font-semibold text-foreground">Weekly coverage trend</h3>
      <div className="mt-4 h-56 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent">
        <p className="p-4 text-xs text-muted-foreground">Interactive charts stubbed for integration.</p>
      </div>
    </div>
  </div>
);
