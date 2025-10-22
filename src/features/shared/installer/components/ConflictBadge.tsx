import { AlertTriangle } from 'lucide-react';

interface ConflictBadgeProps {
  conflicts: string[];
}

export const ConflictBadge = ({ conflicts }: ConflictBadgeProps) => {
  if (!conflicts.length) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-200">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
      Conflicts with {conflicts.join(', ')}
    </span>
  );
};
