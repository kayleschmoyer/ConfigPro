import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { cn } from '../../../lib/cn';
import { formatCurrency, formatPercent } from '../lib/format';
import { PlannerStep, ReorderProposal, SKU } from '../lib/types';

export type ReplenishmentPlannerProps = {
  proposals: ReorderProposal[];
  skus: SKU[];
  onCreate?: (proposals: ReorderProposal[]) => void;
};

const STEPS: { key: PlannerStep; title: string; helper: string }[] = [
  { key: 'SELECT', title: 'Select SKUs', helper: 'Choose items requiring attention' },
  { key: 'OPTIMIZE', title: 'Optimize', helper: 'EOQ, ROP and transfers optimized' },
  { key: 'GROUP', title: 'Group by Supplier', helper: 'Bundle by supplier and location' },
  { key: 'CONFIRM', title: 'Confirm', helper: 'Review math and adjust quantities' },
  { key: 'CREATE', title: 'Create PO Stubs', helper: 'Generate drafts for AP/PO handoff' }
];

const StepPill = ({ active, complete }: { active: boolean; complete: boolean }) => (
  <span
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition',
      complete
        ? 'border-primary bg-primary text-white'
        : active
        ? 'border-primary/60 bg-primary/10 text-primary'
        : 'border-border/60 bg-surface/60 text-muted'
    )}
    aria-hidden="true"
  />
);

export const ReplenishmentPlanner = ({ proposals, skus, onCreate }: ReplenishmentPlannerProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const activeStep = STEPS[stepIndex];

  const totals = useMemo(() => {
    const lineCount = proposals.reduce((acc, proposal) => acc + proposal.lines.length, 0);
    const estCost = proposals.reduce(
      (acc, proposal) => acc + (proposal.totals?.estCost.value ?? 0),
      0
    );
    return { lineCount, estCost };
  }, [proposals]);

  const next = () => setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  const prev = () => setStepIndex((index) => Math.max(index - 1, 0));

  const handleCreate = () => {
    onCreate?.(proposals);
    next();
  };

  return (
    <Card className="space-y-8 bg-surface/90 p-8">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center gap-4">
          {STEPS.map((step, index) => {
            const complete = index < stepIndex;
            const active = index === stepIndex;
            return (
              <div key={step.key} className="flex items-center gap-3">
                <StepPill active={active} complete={complete} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                    {step.title}
                  </p>
                  <p className={cn('text-sm text-muted', active && 'text-foreground/90')}>{step.helper}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <motion.div
        key={activeStep.key}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="space-y-6"
      >
        {activeStep.key === 'SELECT' && (
          <div className="grid gap-4">
            <p className="text-sm text-muted">{totals.lineCount} SKUs flagged this cycle.</p>
            <div className="grid gap-3">
              {skus.map((sku) => (
                <div key={sku.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/70 p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{sku.sku}</p>
                    <p className="text-xs text-muted">{sku.name}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Included
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep.key === 'OPTIMIZE' && (
          <div className="grid gap-4">
            <p className="text-sm text-muted">
              EOQ, ROP and safety stock optimized. Transfers applied before reorders.
            </p>
            <div className="grid gap-3">
              {proposals.flatMap((proposal) =>
                proposal.lines.map((line) => (
                  <div key={`${proposal.id}-${line.skuId}`} className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/70 p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">SKU {line.skuId}</p>
                      <p className="text-xs text-muted">Method {line.method} • Reason {line.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">Qty {line.qty}</p>
                      {line.calc.safety && (
                        <p className="text-xs text-muted">Safety {line.calc.safety}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeStep.key === 'GROUP' && (
          <div className="grid gap-3">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="rounded-2xl border border-border/60 bg-surface/70 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Supplier {proposal.supplierId}
                    </p>
                    <p className="text-xs text-muted">Location {proposal.locationId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(proposal.totals?.estCost.value ?? 0, proposal.totals?.estCost.currency)}
                    </p>
                    <p className="text-xs text-muted">{proposal.lines.length} lines</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeStep.key === 'CONFIRM' && (
          <div className="grid gap-4">
            <p className="text-sm text-muted">Double-check quantities before creating POs.</p>
            <div className="grid gap-3">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="rounded-2xl border border-border/60 bg-surface/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {proposal.lines.length} SKUs • Supplier {proposal.supplierId}
                      </p>
                      <p className="text-xs text-muted">
                        Lead time {proposal.lines[0]?.calc.leadTimeDays ?? 0} days • Service level {formatPercent((proposal.lines[0]?.calc.serviceLevel ?? 0.95) * 100, 0)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Adjust
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep.key === 'CREATE' && (
          <div className="rounded-2xl border border-primary/60 bg-primary/10 p-6 text-center">
            <p className="text-lg font-semibold text-primary">PO stubs generated</p>
            <p className="text-sm text-primary/80">
              Draft POs routed to AP and supplier contacts. Undo available for 30 minutes.
            </p>
          </div>
        )}
      </motion.div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Summary</p>
          <p className="text-sm text-muted">
            {totals.lineCount} lines • {formatCurrency(totals.estCost)} planned spend
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={prev} disabled={stepIndex === 0}>
            Back
          </Button>
          {activeStep.key !== 'CREATE' ? (
            <Button size="sm" onClick={activeStep.key === 'CONFIRM' ? handleCreate : next}>
              {activeStep.key === 'CONFIRM' ? 'Create PO Drafts' : 'Next'}
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setStepIndex(0)}>
              Start New Cycle
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
