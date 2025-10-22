import { cn } from '@/lib/cn';
import type { MatchAssessment, Variance } from '../lib/match';

const varianceCopy: Record<Variance['kind'], string> = {
  qty: 'Quantity variance',
  price: 'Price variance',
  tax: 'Tax variance',
  freight: 'Freight variance',
};

const severityTone = (assessment: MatchAssessment['status']) => {
  switch (assessment) {
    case 'MATCHED':
      return 'bg-success/10 text-success border-success/40';
    case 'BLOCKED':
      return 'bg-error/10 text-error border-error/50';
    default:
      return 'bg-warning/10 text-warning border-warning/40';
  }
};

export const VarianceBadge = ({
  assessment,
}: {
  assessment?: MatchAssessment;
}) => {
  if (!assessment) return null;
  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]',
        severityTone(assessment.status)
      )}
      role="status"
      aria-live="polite"
    >
      <span>{assessment.status === 'MATCHED' ? 'In tolerance' : 'Match review'}</span>
      {assessment.variances.map((variance) => (
        <span key={variance.kind} className="text-foreground/70">
          {varianceCopy[variance.kind]} · Δ{' '}
          {((Math.abs(variance.actual - variance.expected) / (variance.expected || 1)) * 100).toFixed(1)}%
        </span>
      ))}
    </div>
  );
};
