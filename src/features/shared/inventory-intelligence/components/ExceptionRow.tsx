import { motion } from 'framer-motion';
import { Button } from '../../../shared/ui/Button';
import { formatDate } from '../lib/format';
import { Exception } from '../lib/types';

export type ExceptionRowProps = {
  exception: Exception;
  onAction?: (action: string, exception: Exception) => void;
};

export const ExceptionRow = ({ exception, onAction }: ExceptionRowProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="rounded-2xl border border-border/60 bg-surface/80 p-4"
      role="listitem"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            {exception.bucket.replace('_', ' ')}
          </p>
          <p className="text-sm font-semibold text-foreground">{exception.message}</p>
          <p className="text-xs text-muted">Detected {formatDate(exception.detectedAt)}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
            exception.severity === 'HIGH'
              ? 'bg-red-500/20 text-red-200 border border-red-400/40'
              : exception.severity === 'MEDIUM'
              ? 'bg-amber-500/20 text-amber-100 border border-amber-400/40'
              : 'bg-surface/60 text-muted border border-border/50'
          }`}
        >
          {exception.severity}
        </span>
      </div>
      {exception.actions && exception.actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {exception.actions.map((action) => (
            <Button
              key={action.action}
              variant="outline"
              size="sm"
              onClick={() => onAction?.(action.action, exception)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
