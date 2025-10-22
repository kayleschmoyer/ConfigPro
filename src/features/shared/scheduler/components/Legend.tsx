import { cn } from '../../../lib/cn';

const statusItems = [
  { label: 'Overtime', tone: 'bg-red-500/20 text-red-600 border-red-500/40' },
  { label: 'Minor labor law', tone: 'bg-amber-400/20 text-amber-600 border-amber-400/40' },
  { label: 'Fatigue risk', tone: 'bg-orange-400/20 text-orange-600 border-orange-400/40' },
  { label: 'Certification gap', tone: 'bg-fuchsia-400/20 text-fuchsia-600 border-fuchsia-400/40' },
];

const coverageItems = [
  { label: 'Coverage gap', tone: 'bg-amber-400/20 border-amber-400/40' },
  { label: 'Fully staffed', tone: 'bg-emerald-400/20 border-emerald-400/40' },
];

export const Legend = () => (
  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
    {statusItems.map((item) => (
      <span
        key={item.label}
        className={cn('flex items-center gap-2 rounded-full border px-3 py-1 font-semibold', item.tone)}
      >
        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
        {item.label}
      </span>
    ))}
    <span className="text-muted/60">•</span>
    {coverageItems.map((item) => (
      <span key={item.label} className={cn('rounded-full border px-3 py-1', item.tone)}>
        {item.label}
      </span>
    ))}
  </div>
);
