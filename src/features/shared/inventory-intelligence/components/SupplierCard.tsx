import { motion } from 'framer-motion';
import { Card } from '@/shared/ui/Card';
import { formatCurrency, formatPercent } from '../lib/format';
import type { LeadTimeStats, Supplier } from '../lib';

export type SupplierCardProps = {
  supplier: Supplier;
  stats?: LeadTimeStats;
};

const scoreColor = (score?: number) => {
  if (score == null) return 'bg-surface/70 text-muted border border-border/60';
  if (score >= 85) return 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40';
  if (score >= 70) return 'bg-amber-500/20 text-amber-200 border border-amber-400/40';
  return 'bg-red-500/20 text-red-200 border border-red-400/40';
};

export const SupplierCard = ({ supplier, stats }: SupplierCardProps) => {
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
      <Card className="flex flex-col gap-6 bg-surface/80 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{supplier.name}</p>
            <p className="text-xs text-muted">{supplier.terms}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${scoreColor(supplier.score)}`}>
            Score {supplier.score ?? '—'}
          </span>
        </div>
        {stats && (
          <div className="grid grid-cols-3 gap-4 text-xs text-muted">
            <div>
              <p className="uppercase tracking-[0.3em]">Median</p>
              <p className="text-sm font-semibold text-foreground">{stats.medianDays}d</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.3em]">P95</p>
              <p className="text-sm font-semibold text-foreground">{stats.p95Days}d</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.3em]">On-Time</p>
              <p className="text-sm font-semibold text-foreground">{formatPercent(stats.onTimePct, 0)}</p>
            </div>
          </div>
        )}
        {supplier.priceBreaks && supplier.priceBreaks.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-background/40 p-3 text-xs text-muted">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em]">Price Breaks</p>
            <ul className="space-y-1">
              {supplier.priceBreaks.map((breakItem) => (
                <li key={breakItem.qty} className="flex justify-between">
                  <span>{breakItem.qty}+ units</span>
                  <span className="text-foreground/90">
                    {formatCurrency(breakItem.unitCost.value, breakItem.unitCost.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted">
          <span>On-time {formatPercent(supplier.onTimePct ?? stats?.onTimePct ?? 0, 0)}</span>
          <span>Defects {formatPercent(supplier.defectRatePct ?? 0, 1)}</span>
        </div>
      </Card>
    </motion.div>
  );
};
