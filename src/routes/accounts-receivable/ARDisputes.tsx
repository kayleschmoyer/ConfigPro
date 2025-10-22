import { useMemo } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card';
import { useToast } from '../../shared/ui/Toast';
import { cn } from '../../lib/cn';
import { formatMoney, mapDisputesByStage } from './data';
import { useAccountsReceivable } from './context';
import { ClockIcon, DisputeIcon } from './components/Icons';

const stageLabels = {
  NEW: 'New',
  UNDER_REVIEW: 'Under review',
  WAITING_ON_CUSTOMER: 'Waiting on customer',
  RESOLVED: 'Resolved'
} as const;

export const ARDisputes = () => {
  const { data } = useAccountsReceivable();
  const { showToast } = useToast();

  const disputesByStage = useMemo(() => mapDisputesByStage(data.disputes), [data.disputes]);

  const escalate = (disputeId: string) => {
    showToast({
      variant: 'warning',
      title: 'Escalation sent',
      description: `Collections lead notified for ${disputeId}.`
    });
  };

  const getSlaLabel = (slaDueAt: string) => {
    const now = Date.now();
    const due = new Date(slaDueAt).getTime();
    const diffHours = Math.round((due - now) / (1000 * 60 * 60));
    if (diffHours > 24) return `${Math.floor(diffHours / 24)}d ${diffHours % 24}h`; 
    if (diffHours >= 0) return `${diffHours}h`;
    return `-${Math.abs(diffHours)}h`; 
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <DisputeIcon className="h-4 w-4 text-primary" />
          Dispute workflow
        </span>
        <h2 className="text-3xl font-semibold">Resolve disputes before they impact cash</h2>
        <p className="text-sm text-muted">
          Track pipeline health, SLA risk, and collaborate with sales and operations.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-4">
        {(Object.keys(stageLabels) as Array<keyof typeof stageLabels>).map((stage) => (
          <Card key={stage} className="flex min-h-[26rem] flex-col bg-background/80">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                {stageLabels[stage]}
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  {disputesByStage[stage].length}
                </span>
              </CardTitle>
              <CardDescription>
                {stage === 'RESOLVED' ? 'Closed and credited' : 'In flight disputes'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              {disputesByStage[stage].map((dispute) => {
                const invoices = dispute.invoiceIds
                  .map((id) => data.invoices.find((invoice) => invoice.id === id)?.number)
                  .filter(Boolean)
                  .join(', ');
                const slaLabel = getSlaLabel(dispute.slaDueAt);
                const slaBreached = slaLabel.startsWith('-');
                return (
                  <div
                    key={dispute.id}
                    className={cn(
                      'flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface/60 p-4 shadow-sm shadow-primary/10 transition hover:border-primary/50',
                      slaBreached && 'border-red-500/40 bg-red-500/10'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{dispute.reason}</p>
                        <p className="text-xs text-muted">Invoices {invoices}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                        {dispute.owner}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 font-semibold uppercase tracking-[0.3em]">
                        <ClockIcon className="h-4 w-4 text-primary" /> SLA {slaLabel}
                      </span>
                      <span>{formatMoney(dispute.amount)}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => escalate(dispute.id)}
                      >
                        Escalate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showToast({
                          variant: 'info',
                          title: 'Dispute workspace',
                          description: 'Collector notes and linked emails opened in side panel.'
                        })}
                      >
                        Open workspace
                      </Button>
                    </div>
                  </div>
                );
              })}
              {disputesByStage[stage].length === 0 && (
                <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/60 p-6 text-center text-sm text-muted">
                  Nothing here — keep it that way!
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
