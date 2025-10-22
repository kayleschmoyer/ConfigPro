import { cn } from '../../../lib/cn';

const STATUS_STYLES: Record<string, string> = {
  'UNDER ROP': 'bg-orange-500/20 text-orange-200 border border-orange-400/40',
  'BELOW SAFETY': 'bg-red-500/20 text-red-200 border border-red-400/40',
  'DELAY RISK': 'bg-amber-500/20 text-amber-200 border border-amber-400/40',
  PROMO: 'bg-fuchsia-500/20 text-fuchsia-100 border border-fuchsia-400/40'
};

export type StatusBadgeProps = {
  status: string;
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = STATUS_STYLES[status.toUpperCase()] ?? 'bg-surface/60 text-muted border border-border/40';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest',
        style
      )}
      role="status"
    >
      {status}
    </span>
  );
};
