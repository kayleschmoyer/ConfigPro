import { cn } from '@/lib/cn';
import type { Environment } from '../lib/types';

export interface EnvBadgeProps {
  environment: Environment;
  className?: string;
}

export function EnvBadge({ environment, className }: EnvBadgeProps) {
  const styles =
    environment === 'PROD'
      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40'
      : 'bg-sky-500/10 text-sky-300 border border-sky-500/40';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
        styles,
        className
      )}
      aria-label={`${environment} environment`}
    >
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
      {environment}
    </span>
  );
}
