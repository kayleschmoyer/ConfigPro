import { Card } from '../../../shared/ui/Card';
import { formatPercent } from '../lib/format';
import { SKU, StockSnapshot } from '../lib/types';
import { computeKitAvailability } from '../lib/kits';

export type KitBreakdownProps = {
  kit: SKU;
  snapshots: StockSnapshot[];
};

export const KitBreakdown = ({ kit, snapshots }: KitBreakdownProps) => {
  const availability = computeKitAvailability(kit, snapshots);

  return (
    <Card className="space-y-6 bg-surface/80 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Kit</p>
        <h3 className="text-lg font-semibold text-foreground">{kit.name}</h3>
        <p className="text-sm text-muted">Availability {availability.available} kits</p>
      </div>
      {kit.bom && kit.bom.length > 0 && (
        <div className="space-y-3">
          {kit.bom.map((component) => {
            const snapshot = snapshots.find((item) => item.skuId === component.childSkuId);
            const available = snapshot ? snapshot.onHand - snapshot.allocated : 0;
            const coverage = available / component.qty;
            const coveragePct = availability.available
              ? Math.min(coverage / availability.available, 1)
              : 0;
            const isGating = availability.gatedBy?.skuId === component.childSkuId;
            return (
              <div
                key={component.childSkuId}
                className={`rounded-2xl border p-4 ${isGating ? 'border-red-400/60 bg-red-500/10' : 'border-border/60 bg-background/40'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{component.childSkuId}</p>
                    <p className="text-xs text-muted">Needs {component.qty} per kit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{available} available</p>
                    <p className="text-xs text-muted">Coverage {formatPercent(coveragePct * 100, 0)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
