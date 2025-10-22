import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';
import { formatDateTime } from '../lib/format';
import type { Employee, ExceptionItem } from '../lib/types';

const severityStyles: Record<ExceptionItem['severity'], string> = {
  INFO: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
  WARN: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  CRITICAL: 'border-rose-500/40 bg-rose-500/10 text-rose-100',
};

export type ExceptionRowProps = {
  item: ExceptionItem;
  employee?: Employee;
  onResolve?: (item: ExceptionItem) => void;
  onReopen?: (item: ExceptionItem) => void;
};

export const ExceptionRow = ({ item, employee, onResolve, onReopen }: ExceptionRowProps) => {
  const severityClass = severityStyles[item.severity];

  return (
    <motion.article
      layout
      className={cn(
        'flex flex-col gap-3 rounded-3xl border p-4 shadow-inner shadow-black/10 backdrop-blur',
        severityClass
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide">{item.kind.replace(/_/g, ' ')}</h4>
          <p className="text-xs text-white/70">
            {employee ? `${employee.displayName} • ${formatDateTime(item.date)}` : formatDateTime(item.date)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/70">
          <span>{item.severity}</span>
          {item.resolved && <span className="rounded-full bg-white/10 px-2 py-1">Resolved</span>}
        </div>
      </div>
      <p className="text-sm text-white/80">{item.message}</p>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
        <span>Related punches: {item.relatedPunchIds?.join(', ') ?? '—'}</span>
        <div className="flex gap-2">
          {item.resolved ? (
            <Button size="sm" variant="ghost" onClick={() => onReopen?.(item)}>
              Reopen
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onResolve?.(item)}>
              Resolve
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
};
