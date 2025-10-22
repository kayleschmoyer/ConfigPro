import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { formatCurrency } from '../lib/format';
import { TransferPlan } from '../lib/types';

export type TransferPlannerProps = {
  plans: TransferPlan[];
  onAccept?: (plan: TransferPlan) => void;
  onAcceptAll?: (plans: TransferPlan[]) => void;
};

export const TransferPlanner = ({ plans, onAccept, onAcceptAll }: TransferPlannerProps) => {
  const totalSavings = plans.reduce((acc, plan) => acc + (plan.transferCost?.value ?? 0), 0);

  return (
    <Card className="space-y-6 bg-surface/90 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Transfers</p>
          <p className="text-sm text-muted">{plans.length} suggested lanes • {formatCurrency(totalSavings)} est. savings</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onAcceptAll?.(plans)} disabled={plans.length === 0}>
          Accept All
        </Button>
      </div>
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {plan.fromLocationId} → {plan.toLocationId}
                </p>
                <p className="text-xs text-muted">{plan.lines.length} SKUs • Lead time {plan.leadTimeDays ?? 2}d</p>
              </div>
              <Button size="sm" onClick={() => onAccept?.(plan)}>
                Approve
              </Button>
            </div>
            <ul className="mt-4 space-y-1 text-xs text-muted">
              {plan.lines.map((line) => (
                <li key={line.skuId} className="flex justify-between text-foreground/80">
                  <span>{line.skuId}</span>
                  <span>Qty {line.qty}</span>
                </li>
              ))}
            </ul>
            {plan.transferCost && (
              <p className="mt-4 text-xs text-muted">
                Transfer cost {formatCurrency(plan.transferCost.value, plan.transferCost.currency)}
              </p>
            )}
          </div>
        ))}
        {plans.length === 0 && (
          <div className="rounded-2xl border border-border/50 bg-background/40 p-6 text-center text-sm text-muted">
            No transfers required. Inventory balanced across network.
          </div>
        )}
      </div>
    </Card>
  );
};
