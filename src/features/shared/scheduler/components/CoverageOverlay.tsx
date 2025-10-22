import { memo, useMemo } from 'react';
import { cn } from '../../../lib/cn';
import type { HeatmapEntry } from '../hooks/useSchedule';

type CoverageOverlayProps = {
  heat?: HeatmapEntry;
};

export const CoverageOverlay = memo(({ heat }: CoverageOverlayProps) => {
  const buckets = useMemo(() => {
    if (!heat) return [];
    return heat.required.map((required, index) => {
      const scheduled = heat.scheduled[index] ?? 0;
      const deficit = Math.max(0, required - scheduled);
      const surplus = Math.max(0, scheduled - required);
      return { required, scheduled, deficit, surplus };
    });
  }, [heat]);

  if (!heat) {
    return <div className="absolute inset-0" />;
  }

  const totalRequired = buckets.reduce((sum, bucket) => sum + bucket.required, 0);
  const totalDeficit = buckets.reduce((sum, bucket) => sum + bucket.deficit, 0);
  const coverageRatio = totalRequired === 0 ? 1 : Math.min(1, (totalRequired - totalDeficit) / totalRequired);

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-black/5" />
      <div
        className={cn('absolute inset-x-0 top-0 h-1 transition-colors', coverageRatio < 0.9 ? 'bg-amber-500/80' : 'bg-emerald-500/70')}
      />
      <div className="absolute inset-0 opacity-60">
        <div className="flex h-full flex-col">
          {buckets.map((bucket, index) => {
            const tone = bucket.deficit > 0 ? 'bg-amber-400/40' : bucket.surplus > 0 ? 'bg-emerald-400/20' : 'bg-transparent';
            return <div key={index} className={cn('flex-1 border-b border-white/5', tone)} />;
          })}
        </div>
      </div>
    </div>
  );
});

CoverageOverlay.displayName = 'CoverageOverlay';
