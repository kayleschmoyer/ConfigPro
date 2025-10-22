import { useMemo } from 'react';
import { Drawer } from '../../../shared/ui/Drawer';
import { Button } from '../../../shared/ui/Button';
import { formatCurrency } from '../lib/format';
import { ReorderProposal } from '../lib/types';

export type ProposalDrawerProps = {
  proposal: ReorderProposal | null;
  onClose: () => void;
  onConfirm?: (proposal: ReorderProposal) => void;
};

export const ProposalDrawer = ({ proposal, onClose, onConfirm }: ProposalDrawerProps) => {
  const estCost = proposal?.totals?.estCost;

  const summary = useMemo(() => {
    if (!proposal) return null;
    const safetyHits = proposal.lines.filter((line) => line.reason === 'BELOW_SAFETY').length;
    const transfers = proposal.lines.filter((line) => line.reason === 'TRANSFER_ALT').length;
    return { safetyHits, transfers };
  }, [proposal]);

  return (
    <Drawer
      isOpen={Boolean(proposal)}
      onClose={onClose}
      title={`Proposal • ${proposal?.supplierId ?? ''}`}
      description={proposal ? `Location ${proposal.locationId}` : undefined}
      footer={
        proposal && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Estimate</p>
              <p className="text-sm text-foreground">
                {formatCurrency(estCost?.value ?? 0, estCost?.currency)}
              </p>
            </div>
            <Button size="sm" onClick={() => proposal && onConfirm?.(proposal)}>
              Confirm Proposal
            </Button>
          </div>
        )
      }
    >
      {proposal && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-surface/70 p-4">
            <p className="text-sm font-semibold text-foreground">Summary</p>
            <p className="text-xs text-muted">
              {proposal.lines.length} lines • {summary?.safetyHits} safety breaches • {summary?.transfers} transfer alternates
            </p>
          </div>
          <div className="space-y-4">
            {proposal.lines.map((line) => (
              <div key={line.skuId} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">SKU {line.skuId}</p>
                    <p className="text-xs text-muted">{line.reason.replace('_', ' ')} • {line.method}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">Qty {line.qty}</p>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted">
                  {line.calc.rop && (
                    <div>
                      <dt className="uppercase tracking-[0.3em]">ROP</dt>
                      <dd className="text-foreground">{line.calc.rop}</dd>
                    </div>
                  )}
                  {line.calc.safety && (
                    <div>
                      <dt className="uppercase tracking-[0.3em]">Safety</dt>
                      <dd className="text-foreground">{line.calc.safety}</dd>
                    </div>
                  )}
                  {line.calc.eoq && (
                    <div>
                      <dt className="uppercase tracking-[0.3em]">EOQ</dt>
                      <dd className="text-foreground">{line.calc.eoq}</dd>
                    </div>
                  )}
                  {line.calc.serviceLevel && (
                    <div>
                      <dt className="uppercase tracking-[0.3em]">Service Level</dt>
                      <dd className="text-foreground">{Math.round(line.calc.serviceLevel * 100)}%</dd>
                    </div>
                  )}
                </dl>
                {line.notes && <p className="mt-3 text-xs text-muted">{line.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
};
